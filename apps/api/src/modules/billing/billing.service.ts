import { eq, count } from 'drizzle-orm';
import { db } from '../../db';
import { subscriptions, templates, teamMembers } from '../../db/schema';
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
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  return subscription;
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
