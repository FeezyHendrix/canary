import { eq, count } from 'drizzle-orm';
import { db } from '../../db';
import { subscriptions, templates, teamMembers, billingEvents } from '../../db/schema';
import { env } from '../../lib/env';
import { AppError } from '../../lib/errors';
import type { CheckoutInput } from './billing.schema';
import {
  PLAN_LIMITS,
  type SubscriptionPlan,
  type SubscriptionStatus,
} from '@canary/shared';

interface PolarCheckoutResponse {
  id: string;
  url: string;
}

interface PolarCustomerPortalResponse {
  url: string;
}

const POLAR_API_BASE = 'https://api.polar.sh/v1';

async function polarFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  if (!env.POLAR_ACCESS_TOKEN) {
    throw new AppError('BILLING_NOT_CONFIGURED', 'Billing is not configured', 503);
  }

  const response = await fetch(`${POLAR_API_BASE}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${env.POLAR_ACCESS_TOKEN}`,
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.text();
    console.error('Polar API error:', error);
    throw new AppError('POLAR_API_ERROR', 'Failed to communicate with billing provider', 502);
  }

  return response.json();
}

function getPriceId(plan: 'pro' | 'team', interval: 'monthly' | 'annual'): string {
  const priceIds: Record<string, string | undefined> = {
    'pro-monthly': env.POLAR_PRO_MONTHLY_PRICE_ID,
    'pro-annual': env.POLAR_PRO_ANNUAL_PRICE_ID,
    'team-monthly': env.POLAR_TEAM_MONTHLY_PRICE_ID,
    'team-annual': env.POLAR_TEAM_ANNUAL_PRICE_ID,
  };

  const priceId = priceIds[`${plan}-${interval}`];
  if (!priceId) {
    throw new AppError('PRICE_NOT_CONFIGURED', `Price for ${plan} ${interval} is not configured`, 503);
  }

  return priceId;
}

export async function getSubscription(teamId: string) {
  const [subscription] = await db
    .select()
    .from(subscriptions)
    .where(eq(subscriptions.teamId, teamId))
    .limit(1);

  if (!subscription) {
    return {
      id: '',
      teamId,
      polarCustomerId: null,
      polarSubscriptionId: null,
      plan: 'free' as SubscriptionPlan,
      status: 'active' as SubscriptionStatus,
      currentPeriodEnd: null,
      cancelAtPeriodEnd: false,
      refundedAt: null,
      refundAmount: null,
      refundReason: null,
      refundCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  return subscription;
}

export async function getSubscriptionByPolarId(polarSubscriptionId: string) {
  const [subscription] = await db
    .select()
    .from(subscriptions)
    .where(eq(subscriptions.polarSubscriptionId, polarSubscriptionId))
    .limit(1);

  return subscription;
}

type BillingEventType =
  | 'subscription_created'
  | 'subscription_updated'
  | 'subscription_canceled'
  | 'checkout_completed'
  | 'refund_processed'
  | 'subscription_revoked';

export async function logBillingEvent(
  teamId: string,
  eventType: BillingEventType,
  data: {
    previousPlan?: SubscriptionPlan;
    newPlan?: SubscriptionPlan;
    previousStatus?: SubscriptionStatus;
    newStatus?: SubscriptionStatus;
    amount?: number;
    reason?: string;
    polarEventId?: string;
    metadata?: Record<string, unknown>;
  }
) {
  await db.insert(billingEvents).values({
    teamId,
    eventType,
    previousPlan: data.previousPlan,
    newPlan: data.newPlan,
    previousStatus: data.previousStatus,
    newStatus: data.newStatus,
    amount: data.amount,
    reason: data.reason,
    polarEventId: data.polarEventId,
    metadata: data.metadata,
  });
}

export async function processRefund(
  teamId: string,
  refundData: {
    amount: number;
    reason?: string;
    polarEventId?: string;
  }
) {
  const existing = await getSubscription(teamId);
  const currentRefundCount = existing.refundCount ?? 0;

  // Log the refund event for audit trail
  await logBillingEvent(teamId, 'refund_processed', {
    previousPlan: existing.plan,
    newPlan: 'free',
    previousStatus: existing.status,
    newStatus: 'refunded',
    amount: refundData.amount,
    reason: refundData.reason,
    polarEventId: refundData.polarEventId,
    metadata: {
      refundCount: currentRefundCount + 1,
    },
  });

  const [updated] = await db
    .update(subscriptions)
    .set({
      plan: 'free', // Immediately downgrade on refund
      status: 'refunded',
      refundedAt: new Date(),
      refundAmount: refundData.amount,
      refundReason: refundData.reason || null,
      refundCount: currentRefundCount + 1,
      updatedAt: new Date(),
    })
    .where(eq(subscriptions.teamId, teamId))
    .returning();

  return updated;
}

export async function getSubscriptionWithUsage(teamId: string) {
  const subscription = await getSubscription(teamId);

  const [templateCount] = await db
    .select({ count: count() })
    .from(templates)
    .where(eq(templates.teamId, teamId));

  const [memberCount] = await db
    .select({ count: count() })
    .from(teamMembers)
    .where(eq(teamMembers.teamId, teamId));

  return {
    ...subscription,
    usage: {
      templates: templateCount?.count ?? 0,
      teamMembers: memberCount?.count ?? 0,
    },
  };
}

export async function createCheckoutSession(
  teamId: string,
  userId: string,
  userEmail: string,
  input: CheckoutInput
) {
  // Check for refund abuse before allowing new subscription
  await enforceNoRefundAbuse(teamId);

  const priceId = getPriceId(input.plan, input.interval);

  const existingSubscription = await getSubscription(teamId);

  const successUrl = input.successUrl || `${env.APP_URL}/settings/billing?success=true`;
  const cancelUrl = input.cancelUrl || `${env.APP_URL}/settings/billing?canceled=true`;

  const response = await polarFetch<PolarCheckoutResponse>('/checkouts/custom/', {
    method: 'POST',
    body: JSON.stringify({
      product_price_id: priceId,
      success_url: successUrl,
      customer_email: userEmail,
      metadata: {
        team_id: teamId,
        user_id: userId,
        plan: input.plan,
      },
    }),
  });

  return { checkoutUrl: response.url };
}

export async function createCustomerPortalSession(teamId: string) {
  const subscription = await getSubscription(teamId);

  if (!subscription.polarCustomerId) {
    throw new AppError('NO_SUBSCRIPTION', 'No active subscription found', 404);
  }

  const response = await polarFetch<PolarCustomerPortalResponse>(
    `/customer-portal/sessions/`,
    {
      method: 'POST',
      body: JSON.stringify({
        customer_id: subscription.polarCustomerId,
      }),
    }
  );

  return { portalUrl: response.url };
}

export async function upsertSubscription(
  teamId: string,
  data: {
    polarCustomerId?: string;
    polarSubscriptionId?: string;
    plan: SubscriptionPlan;
    status: SubscriptionStatus;
    currentPeriodEnd?: Date | null;
    cancelAtPeriodEnd?: boolean;
  }
) {
  const existing = await getSubscription(teamId);

  if (existing.id) {
    const [updated] = await db
      .update(subscriptions)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(subscriptions.teamId, teamId))
      .returning();
    return updated;
  }

  const [created] = await db
    .insert(subscriptions)
    .values({
      teamId,
      ...data,
    })
    .returning();

  return created;
}

export async function cancelSubscription(teamId: string) {
  const subscription = await getSubscription(teamId);

  if (!subscription.polarSubscriptionId) {
    throw new AppError('NO_SUBSCRIPTION', 'No active subscription to cancel', 404);
  }

  await polarFetch(`/subscriptions/${subscription.polarSubscriptionId}`, {
    method: 'DELETE',
  });

  return upsertSubscription(teamId, {
    plan: subscription.plan,
    status: 'canceled',
    cancelAtPeriodEnd: true,
  });
}

export function canCreateTemplate(plan: SubscriptionPlan, currentCount: number): boolean {
  const limits = PLAN_LIMITS[plan];
  if (limits.maxTemplates === null) return true;
  return currentCount < limits.maxTemplates;
}

export function canAddTeamMember(plan: SubscriptionPlan, currentCount: number): boolean {
  const limits = PLAN_LIMITS[plan];
  return currentCount < limits.maxTeamMembers;
}

export function canUsePremiumBlocks(plan: SubscriptionPlan): boolean {
  return PLAN_LIMITS[plan].premiumBlocksEnabled;
}

const MAX_REFUNDS_ALLOWED = 2;

/** Check if a team has exceeded refund limits (potential abuse) */
export async function checkRefundAbuse(teamId: string): Promise<{
  isAbusive: boolean;
  refundCount: number;
}> {
  const subscription = await getSubscription(teamId);
  const refundCount = subscription.refundCount ?? 0;

  return {
    isAbusive: refundCount >= MAX_REFUNDS_ALLOWED,
    refundCount,
  };
}

/** Enforce refund abuse check before allowing new subscription */
export async function enforceNoRefundAbuse(teamId: string): Promise<void> {
  const { isAbusive, refundCount } = await checkRefundAbuse(teamId);

  if (isAbusive) {
    throw new AppError(
      'REFUND_ABUSE_DETECTED',
      `This account has exceeded the maximum number of refunds (${refundCount}/${MAX_REFUNDS_ALLOWED}). Please contact support if you believe this is an error.`,
      403
    );
  }
}

/** Get the effective plan for a team, considering refund status */
export function getEffectivePlan(subscription: {
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
}): SubscriptionPlan {
  // If refunded, treat as free regardless of stored plan
  if (subscription.status === 'refunded') {
    return 'free';
  }
  return subscription.plan;
}

/** Check if a team can create a new template */
export async function enforceTemplateLimit(teamId: string): Promise<void> {
  const subscription = await getSubscription(teamId);
  const effectivePlan = getEffectivePlan(subscription);

  const [templateCount] = await db
    .select({ count: count() })
    .from(templates)
    .where(eq(templates.teamId, teamId));

  const currentCount = templateCount?.count ?? 0;

  if (!canCreateTemplate(effectivePlan, currentCount)) {
    const limits = PLAN_LIMITS[effectivePlan];
    throw new AppError(
      'TEMPLATE_LIMIT_REACHED',
      `You have reached the template limit (${limits.maxTemplates}) for the ${effectivePlan} plan. Please upgrade to create more templates.`,
      403
    );
  }
}

/** Check if a team can add a new member */
export async function enforceTeamMemberLimit(teamId: string): Promise<void> {
  const subscription = await getSubscription(teamId);
  const effectivePlan = getEffectivePlan(subscription);

  const [memberCount] = await db
    .select({ count: count() })
    .from(teamMembers)
    .where(eq(teamMembers.teamId, teamId));

  const currentCount = memberCount?.count ?? 0;

  if (!canAddTeamMember(effectivePlan, currentCount)) {
    const limits = PLAN_LIMITS[effectivePlan];
    throw new AppError(
      'TEAM_MEMBER_LIMIT_REACHED',
      `You have reached the team member limit (${limits.maxTeamMembers}) for the ${effectivePlan} plan. Please upgrade to add more members.`,
      403
    );
  }
}

/** Check if a team can use premium blocks */
export async function enforcePremiumBlockAccess(teamId: string): Promise<void> {
  const subscription = await getSubscription(teamId);
  const effectivePlan = getEffectivePlan(subscription);

  if (!canUsePremiumBlocks(effectivePlan)) {
    throw new AppError(
      'PREMIUM_FEATURE',
      'Premium blocks are only available on Pro and Team plans. Please upgrade to use this feature.',
      403
    );
  }
}
