import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { useAuth } from '@/features/auth/auth-context';
import type { SubscriptionPlan } from '@canary/shared';
import { PLAN_LIMITS, PLAN_LABELS, PLAN_PRICES, PREMIUM_BLOCK_TYPES } from '@canary/shared';

interface SubscriptionWithUsage {
  id: string;
  teamId: string;
  polarCustomerId: string | null;
  polarSubscriptionId: string | null;
  plan: SubscriptionPlan;
  status: 'active' | 'canceled' | 'past_due' | 'incomplete';
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
  createdAt: string;
  updatedAt: string;
  usage: {
    templates: number;
    teamMembers: number;
  };
}

export function useSubscription() {
  const { currentTeam } = useAuth();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['subscription', currentTeam?.teamId],
    queryFn: () =>
      api.get<{ success: boolean; data: SubscriptionWithUsage }>('/api/billing/subscription'),
    enabled: !!currentTeam?.teamId,
  });

  const subscription = data?.data;
  const plan = subscription?.plan || 'free';
  const limits = PLAN_LIMITS[plan];

  return {
    subscription,
    plan,
    limits,
    isLoading,
    error,
    refetch,
    isPro: plan === 'pro' || plan === 'team',
    isTeam: plan === 'team',
    isFree: plan === 'free',
    canUsePremiumBlocks: limits.premiumBlocksEnabled,
    canCreateTemplate: (currentCount: number) => {
      if (limits.maxTemplates === null) return true;
      return currentCount < limits.maxTemplates;
    },
    canAddTeamMember: (currentCount: number) => {
      return currentCount < limits.maxTeamMembers;
    },
  };
}

export function isPremiumBlock(blockType: string): boolean {
  return PREMIUM_BLOCK_TYPES.includes(blockType as typeof PREMIUM_BLOCK_TYPES[number]);
}

export { PLAN_LIMITS, PLAN_LABELS, PLAN_PRICES, PREMIUM_BLOCK_TYPES };
