import type { SubscriptionPlan, SubscriptionStatus } from '../constants/plans';

export interface Subscription {
  id: string;
  teamId: string;
  polarCustomerId: string | null;
  polarSubscriptionId: string | null;
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  currentPeriodEnd: Date | null;
  cancelAtPeriodEnd: boolean;
  // Refund tracking
  refundedAt: Date | null;
  refundAmount: number | null;
  refundReason: string | null;
  refundCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface SubscriptionWithUsage extends Subscription {
  usage: {
    templates: number;
    teamMembers: number;
  };
}

export interface CheckoutInput {
  plan: 'pro' | 'team';
  interval: 'monthly' | 'annual';
  successUrl?: string;
  cancelUrl?: string;
}

export interface CheckoutResponse {
  checkoutUrl: string;
}

export interface PortalResponse {
  portalUrl: string;
}
