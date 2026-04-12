import type { FastifyInstance } from 'fastify';
import crypto from 'node:crypto';
import { eq } from 'drizzle-orm';
import { db, emailLogs } from '../../db';
import { triggerWebhooks, buildEmailEventPayload } from '../webhooks/webhook-trigger.service';
import type { WebhookEvent } from '@canary/shared';

type EmailEventType = 'delivered' | 'opened' | 'clicked' | 'bounced' | 'spam';

const eventToWebhookEvent: Record<EmailEventType, WebhookEvent> = {
  delivered: 'email.delivered',
  opened: 'email.opened',
  clicked: 'email.clicked',
  bounced: 'email.bounced',
  spam: 'email.spam',
};

const eventToTimestampColumn: Record<EmailEventType, string> = {
  delivered: 'deliveredAt',
  opened: 'openedAt',
  clicked: 'clickedAt',
  bounced: 'bouncedAt',
  spam: 'bouncedAt',
};

type EmailStatus =
  | 'queued'
  | 'sent'
  | 'delivered'
  | 'opened'
  | 'clicked'
  | 'bounced'
  | 'failed'
  | 'spam';

const eventToStatus: Record<EmailEventType, EmailStatus> = {
  delivered: 'delivered',
  opened: 'opened',
  clicked: 'clicked',
  bounced: 'bounced',
  spam: 'spam',
};

async function handleEmailEvent(
  providerMessageId: string,
  eventType: EmailEventType
): Promise<boolean> {
  const log = await db.query.emailLogs.findFirst({
    where: eq(emailLogs.providerMessageId, providerMessageId),
  });

  if (!log) return false;

  const status = eventToStatus[eventType];
  const timestampCol = eventToTimestampColumn[eventType];
  const now = new Date();

  const updateData: Record<string, unknown> = {
    status,
    [timestampCol]: now,
  };

  await db
    .update(emailLogs)
    .set(updateData as typeof emailLogs.$inferInsert)
    .where(eq(emailLogs.id, log.id));

  const eventPayload = await buildEmailEventPayload(log.id);
  if (eventPayload) {
    triggerWebhooks({
      teamId: eventPayload.teamId,
      event: eventToWebhookEvent[eventType],
      data: eventPayload.data,
    }).catch((err) =>
      console.error(`[provider-callbacks] Webhook trigger failed for ${eventType}:`, err)
    );
  }

  return true;
}

export async function providerCallbackRoutes(app: FastifyInstance) {
  // SendGrid Event Webhook
  // https://docs.sendgrid.com/for-developers/tracking-events/event
  app.post('/sendgrid', async (request, reply) => {
    const events = request.body as Array<{
      event: string;
      sg_message_id: string;
    }>;

    if (!Array.isArray(events)) {
      return reply.status(400).send({ error: 'Invalid payload' });
    }

    const sgEventMap: Record<string, EmailEventType> = {
      delivered: 'delivered',
      open: 'opened',
      click: 'clicked',
      bounce: 'bounced',
      spamreport: 'spam',
    };

    for (const event of events) {
      const eventType = sgEventMap[event.event];
      if (!eventType) continue;

      const messageId = event.sg_message_id?.split('.')[0];
      if (messageId) {
        await handleEmailEvent(messageId, eventType);
      }
    }

    return { success: true };
  });

  // Resend Webhook
  // https://resend.com/docs/dashboard/webhooks/introduction
  app.post('/resend', async (request, reply) => {
    const body = request.body as {
      type: string;
      data: { email_id: string };
    };

    if (!body?.type || !body?.data?.email_id) {
      return reply.status(400).send({ error: 'Invalid payload' });
    }

    const resendEventMap: Record<string, EmailEventType> = {
      'email.delivered': 'delivered',
      'email.opened': 'opened',
      'email.clicked': 'clicked',
      'email.bounced': 'bounced',
      'email.complained': 'spam',
    };

    const eventType = resendEventMap[body.type];
    if (eventType) {
      await handleEmailEvent(body.data.email_id, eventType);
    }

    return { success: true };
  });

  // Postmark Webhook
  // https://postmarkapp.com/developer/webhooks/webhooks-overview
  app.post('/postmark', async (request, reply) => {
    const body = request.body as {
      RecordType: string;
      MessageID: string;
    };

    if (!body?.RecordType || !body?.MessageID) {
      return reply.status(400).send({ error: 'Invalid payload' });
    }

    const postmarkEventMap: Record<string, EmailEventType> = {
      Delivery: 'delivered',
      Open: 'opened',
      Click: 'clicked',
      Bounce: 'bounced',
      SpamComplaint: 'spam',
    };

    const eventType = postmarkEventMap[body.RecordType];
    if (eventType) {
      await handleEmailEvent(body.MessageID, eventType);
    }

    return { success: true };
  });

  // Mailgun Webhook
  // https://documentation.mailgun.com/docs/mailgun/api-reference/openapi-final/tag/Webhooks/
  app.post('/mailgun', async (request, reply) => {
    const body = request.body as {
      signature?: { timestamp: string; token: string; signature: string };
      'event-data'?: { event: string; message?: { headers?: { 'message-id': string } } };
    };

    const eventData = body?.['event-data'];
    if (!eventData?.event) {
      return reply.status(400).send({ error: 'Invalid payload' });
    }

    const mailgunEventMap: Record<string, EmailEventType> = {
      delivered: 'delivered',
      opened: 'opened',
      clicked: 'clicked',
      failed: 'bounced',
      complained: 'spam',
    };

    const eventType = mailgunEventMap[eventData.event];
    if (eventType) {
      const messageId = eventData.message?.headers?.['message-id'];
      if (messageId) {
        await handleEmailEvent(messageId, eventType);
      }
    }

    return { success: true };
  });

  // Amazon SES (via SNS)
  // https://docs.aws.amazon.com/ses/latest/dg/event-publishing-retrieving-sns-contents.html
  app.post('/ses', async (request, reply) => {
    const body = request.body as Record<string, unknown>;

    // Handle SNS subscription confirmation
    if (body.Type === 'SubscriptionConfirmation') {
      const subscribeUrl = body.SubscribeURL as string;
      if (subscribeUrl) {
        await fetch(subscribeUrl);
      }
      return { success: true };
    }

    // Handle SNS notification
    if (body.Type === 'Notification') {
      let message: Record<string, unknown>;
      try {
        message = JSON.parse(body.Message as string);
      } catch {
        return reply.status(400).send({ error: 'Invalid SNS message' });
      }

      const sesEventMap: Record<string, EmailEventType> = {
        Delivery: 'delivered',
        Open: 'opened',
        Click: 'clicked',
        Bounce: 'bounced',
        Complaint: 'spam',
      };

      const notificationType = (message.eventType ?? message.notificationType) as string;
      const eventType = sesEventMap[notificationType];
      if (eventType) {
        const mail = message.mail as { messageId?: string } | undefined;
        if (mail?.messageId) {
          await handleEmailEvent(mail.messageId, eventType);
        }
      }
    }

    return { success: true };
  });
}
