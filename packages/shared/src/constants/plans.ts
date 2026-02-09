export const SUBSCRIPTION_PLANS = {
  FREE: 'free',
  PRO: 'pro',
  TEAM: 'team',
} as const;

export type SubscriptionPlan = (typeof SUBSCRIPTION_PLANS)[keyof typeof SUBSCRIPTION_PLANS];

export const SUBSCRIPTION_PLAN_LIST: SubscriptionPlan[] = ['free', 'pro', 'team'];

export const SUBSCRIPTION_STATUSES = {
  ACTIVE: 'active',
  CANCELED: 'canceled',
  PAST_DUE: 'past_due',
  INCOMPLETE: 'incomplete',
  REFUNDED: 'refunded',
} as const;

export type SubscriptionStatus =
  (typeof SUBSCRIPTION_STATUSES)[keyof typeof SUBSCRIPTION_STATUSES];

/** Check if a subscription has active paid access */
export function hasActiveAccess(status: SubscriptionStatus): boolean {
  return status === 'active';
}

export interface PlanLimits {
  maxTemplates: number | null;
  maxTeamMembers: number;
  premiumBlocksEnabled: boolean;
}

export const PLAN_LIMITS: Record<SubscriptionPlan, PlanLimits> = {
  free: {
    maxTemplates: 3,
    maxTeamMembers: 1,
    premiumBlocksEnabled: false,
  },
  pro: {
    maxTemplates: 25,
    maxTeamMembers: 1,
    premiumBlocksEnabled: true,
  },
  team: {
    maxTemplates: null,
    maxTeamMembers: 10,
    premiumBlocksEnabled: true,
  },
};

export const PLAN_LABELS: Record<SubscriptionPlan, string> = {
  free: 'Free',
  pro: 'Pro',
  team: 'Team',
};

export const PLAN_PRICES: Record<SubscriptionPlan, { monthly: number; annual: number }> = {
  free: { monthly: 0, annual: 0 },
  pro: { monthly: 9, annual: 90 },
  team: { monthly: 19, annual: 190 },
};

export const PREMIUM_BLOCK_TYPES = [
  'Chart',
  'Video',
  'Table',
  'Code',
  'Quote',
  'List',
  'Badge',
  'Icon',
  'SocialIcons',
] as const;

export type PremiumBlockType = (typeof PREMIUM_BLOCK_TYPES)[number];

export function isPremiumBlock(blockType: string): boolean {
  return PREMIUM_BLOCK_TYPES.includes(blockType as PremiumBlockType);
}

export function getPlanLimits(plan: SubscriptionPlan): PlanLimits {
  return PLAN_LIMITS[plan];
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
