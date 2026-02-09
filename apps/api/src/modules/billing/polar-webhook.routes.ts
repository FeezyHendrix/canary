import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import crypto from 'crypto';
import { env } from '../../lib/env';
import { upsertSubscription, processRefund, getSubscriptionByPolarId, logBillingEvent } from './billing.service';
import type { SubscriptionPlan, SubscriptionStatus } from '@canary/shared';

interface PolarWebhookEvent {
  type: string;
  data: {
    id: string;
    customer_id: string;
    product?: {
      id: string;
      name: string;
    };
    price?: {
      id: string;
    };
    status: string;
    current_period_end?: string | null;
    cancel_at_period_end?: boolean;
    metadata?: {
      team_id?: string;
      user_id?: string;
      plan?: string;
    };
    // Refund-specific fields
    subscription_id?: string;
    amount?: number;
    reason?: string;
  };
}

function verifyWebhookSignature(
  payload: string,
  signature: string,
  secret: string
): boolean {
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');

  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
}

function mapPolarStatus(status: string): SubscriptionStatus {
  switch (status) {
    case 'active':
      return 'active';
    case 'canceled':
      return 'canceled';
    case 'past_due':
      return 'past_due';
    case 'incomplete':
    case 'incomplete_expired':
      return 'incomplete';
    default:
      return 'active';
  }
}

function determinePlanFromMetadata(metadata: { plan?: string }): SubscriptionPlan {
  if (metadata.plan === 'pro') return 'pro';
  if (metadata.plan === 'team') return 'team';
  return 'free';
}

export async function polarWebhookRoutes(app: FastifyInstance) {
  app.addContentTypeParser(
    'application/json',
    { parseAs: 'string' },
    (req, body, done) => {
      done(null, body);
    }
  );

  app.post(
    '/',
    {
      config: {
        rawBody: true,
      },
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const signature = request.headers['webhook-signature'] as string;
      const payload = request.body as string;

      if (!env.POLAR_WEBHOOK_SECRET) {
        request.log.warn('Polar webhook secret not configured');
        return reply.status(500).send({ error: 'Webhook not configured' });
      }

      if (!signature) {
        return reply.status(401).send({ error: 'Missing signature' });
      }

      try {
        const isValid = verifyWebhookSignature(
          payload,
          signature,
          env.POLAR_WEBHOOK_SECRET
        );

        if (!isValid) {
          request.log.warn('Invalid webhook signature');
          return reply.status(401).send({ error: 'Invalid signature' });
        }
      } catch (error) {
        request.log.error('Signature verification error:', error);
        return reply.status(401).send({ error: 'Signature verification failed' });
      }

      let event: PolarWebhookEvent;
      try {
        event = JSON.parse(payload);
      } catch (error) {
        return reply.status(400).send({ error: 'Invalid JSON' });
      }

      request.log.info({ type: event.type }, 'Received Polar webhook');

      try {
        switch (event.type) {
          case 'subscription.created':
          case 'subscription.updated': {
            const { data } = event;
            const teamId = data.metadata?.team_id;

            if (!teamId) {
              request.log.warn('No team_id in subscription metadata');
              return reply.status(200).send({ received: true });
            }

            await upsertSubscription(teamId, {
              polarCustomerId: data.customer_id,
              polarSubscriptionId: data.id,
              plan: determinePlanFromMetadata(data.metadata),
              status: mapPolarStatus(data.status),
              currentPeriodEnd: data.current_period_end
                ? new Date(data.current_period_end)
                : null,
              cancelAtPeriodEnd: data.cancel_at_period_end,
            });

            request.log.info({ teamId, plan: data.metadata?.plan }, 'Subscription updated');
            break;
          }

          case 'subscription.canceled': {
            const { data } = event;
            const teamId = data.metadata?.team_id;

            if (!teamId) {
              request.log.warn('No team_id in subscription metadata');
              return reply.status(200).send({ received: true });
            }

            await upsertSubscription(teamId, {
              plan: determinePlanFromMetadata(data.metadata),
              status: 'canceled',
              cancelAtPeriodEnd: true,
            });

            request.log.info({ teamId }, 'Subscription canceled');
            break;
          }

          case 'checkout.completed': {
            const { data } = event;
            const teamId = data.metadata?.team_id;

            if (!teamId) {
              request.log.warn('No team_id in checkout metadata');
              return reply.status(200).send({ received: true });
            }

            await upsertSubscription(teamId, {
              polarCustomerId: data.customer_id,
              polarSubscriptionId: data.id,
              plan: determinePlanFromMetadata(data.metadata),
              status: 'active',
            });

            request.log.info({ teamId, plan: data.metadata?.plan }, 'Checkout completed');
            break;
          }

          // Handle refund events - revoke access immediately
          case 'order.refunded': {
            const { data } = event;
            const subscriptionId = data.subscription_id;

            if (!subscriptionId) {
              request.log.warn('No subscription_id in refund event');
              return reply.status(200).send({ received: true });
            }

            // Find the subscription by Polar subscription ID
            const subscription = await getSubscriptionByPolarId(subscriptionId);
            if (!subscription) {
              request.log.warn({ subscriptionId }, 'Subscription not found for refund');
              return reply.status(200).send({ received: true });
            }

            await processRefund(subscription.teamId, {
              amount: data.amount ?? 0,
              reason: data.reason || 'Customer requested refund',
              polarEventId: data.id,
            });

            request.log.info(
              { teamId: subscription.teamId, amount: data.amount },
              'Refund processed - access revoked'
            );
            break;
          }

          // Handle subscription revocation (e.g., chargeback, fraud)
          case 'subscription.revoked': {
            const { data } = event;
            const teamId = data.metadata?.team_id;

            if (!teamId) {
              request.log.warn('No team_id in subscription revocation');
              return reply.status(200).send({ received: true });
            }

            await processRefund(teamId, {
              amount: 0,
              reason: 'Subscription revoked',
              polarEventId: data.id,
            });

            request.log.info({ teamId }, 'Subscription revoked - access removed');
            break;
          }

          default:
            request.log.info({ type: event.type }, 'Unhandled webhook event type');
        }

        return reply.status(200).send({ received: true });
      } catch (error) {
        request.log.error('Webhook processing error:', error);
        return reply.status(500).send({ error: 'Processing failed' });
      }
    }
  );
}
