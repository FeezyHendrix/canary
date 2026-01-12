import { useMutation } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { useSubscription, PLAN_LIMITS, PLAN_LABELS, PLAN_PRICES } from '@/hooks/use-subscription';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/components/ui/toaster';
import {
  CreditCard,
  Check,
  ExternalLink,
  AlertTriangle,
  Loader2,
  Sparkles,
} from 'lucide-react';
import type { SubscriptionPlan } from '@canary/shared';

export function BillingPage() {
  const { subscription, plan, limits, isLoading } = useSubscription();

  const checkoutMutation = useMutation({
    mutationFn: (data: { plan: 'pro' | 'team'; interval: 'monthly' | 'annual' }) =>
      api.post<{ success: boolean; data: { checkoutUrl: string } }>('/api/billing/checkout', data),
    onSuccess: (response) => {
      window.location.href = response.data.checkoutUrl;
    },
    onError: () => {
      toast({ title: 'Failed to start checkout', variant: 'destructive' });
    },
  });

  const portalMutation = useMutation({
    mutationFn: () =>
      api.post<{ success: boolean; data: { portalUrl: string } }>('/api/billing/portal'),
    onSuccess: (response) => {
      window.open(response.data.portalUrl, '_blank');
    },
    onError: () => {
      toast({ title: 'Failed to open billing portal', variant: 'destructive' });
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Billing</h1>
          <p className="text-muted-foreground">Manage your subscription and billing</p>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-6 w-28" />
                  <Skeleton className="h-5 w-12 rounded-full" />
                </div>
                <Skeleton className="h-4 w-40" />
              </div>
              <Skeleton className="h-9 w-44" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-1">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-12" />
                </div>
                <Skeleton className="h-2 w-full" />
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-4 w-12" />
                </div>
                <Skeleton className="h-2 w-full" />
              </div>
              <div className="flex justify-between">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-16" />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-16 mb-2" />
                <Skeleton className="h-8 w-20" />
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  {[1, 2, 3, 4, 5].map((j) => (
                    <Skeleton key={j} className="h-4 w-full" />
                  ))}
                </div>
                <Skeleton className="h-9 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const usage = subscription?.usage || { templates: 0, teamMembers: 0 };
  const templateLimit = limits.maxTemplates;
  const memberLimit = limits.maxTeamMembers;

  const templatePercentage = templateLimit
    ? Math.min((usage.templates / templateLimit) * 100, 100)
    : 0;
  const memberPercentage = Math.min((usage.teamMembers / memberLimit) * 100, 100);

  const isPastDue = subscription?.status === 'past_due';
  const isCanceled =
    subscription?.status === 'canceled' || subscription?.cancelAtPeriodEnd;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Billing</h1>
        <p className="text-muted-foreground">Manage your subscription and billing</p>
      </div>

      {isPastDue && (
        <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
          <AlertTriangle className="h-5 w-5 text-red-600" />
          <div className="flex-1">
            <p className="font-medium text-red-800">Payment failed</p>
            <p className="text-sm text-red-600">
              Please update your payment method to continue using premium features.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => portalMutation.mutate()}
            disabled={portalMutation.isPending}
          >
            Update Payment
          </Button>
        </div>
      )}

      {isCanceled && subscription?.currentPeriodEnd && (
        <div className="flex items-center gap-3 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <AlertTriangle className="h-5 w-5 text-yellow-600" />
          <div className="flex-1">
            <p className="font-medium text-yellow-800">Subscription ending</p>
            <p className="text-sm text-yellow-600">
              Your subscription will end on{' '}
              {new Date(subscription.currentPeriodEnd).toLocaleDateString()}. You'll be
              downgraded to the Free plan.
            </p>
          </div>
        </div>
      )}

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                Current Plan
                <Badge variant={plan === 'free' ? 'secondary' : 'default'}>
                  {PLAN_LABELS[plan]}
                </Badge>
              </CardTitle>
              <CardDescription>
                {plan === 'free'
                  ? 'Free forever with basic features'
                  : `$${PLAN_PRICES[plan].monthly}/month`}
              </CardDescription>
            </div>
            {plan !== 'free' && (
              <Button
                variant="outline"
                onClick={() => portalMutation.mutate()}
                disabled={portalMutation.isPending}
              >
                <CreditCard className="mr-2 h-4 w-4" />
                Manage Subscription
                <ExternalLink className="ml-2 h-3 w-3" />
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Templates</span>
                <span>
                  {usage.templates}
                  {templateLimit ? ` / ${templateLimit}` : ' (Unlimited)'}
                </span>
              </div>
              {templateLimit && (
                <Progress value={templatePercentage} className="h-2" />
              )}
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Team Members</span>
                <span>
                  {usage.teamMembers} / {memberLimit}
                </span>
              </div>
              <Progress value={memberPercentage} className="h-2" />
            </div>
            <div className="flex justify-between text-sm">
              <span>Premium Blocks</span>
              <span>
                {limits.premiumBlocksEnabled ? (
                  <span className="text-green-600 flex items-center gap-1">
                    <Check className="h-4 w-4" /> Enabled
                  </span>
                ) : (
                  <span className="text-muted-foreground">Not available</span>
                )}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-3 gap-4">
        <PlanCard
          plan="free"
          currentPlan={plan}
          onSelect={() => {}}
          disabled={true}
        />
        <PlanCard
          plan="pro"
          currentPlan={plan}
          onSelect={() => checkoutMutation.mutate({ plan: 'pro', interval: 'monthly' })}
          isLoading={checkoutMutation.isPending}
          recommended
        />
        <PlanCard
          plan="team"
          currentPlan={plan}
          onSelect={() => checkoutMutation.mutate({ plan: 'team', interval: 'monthly' })}
          isLoading={checkoutMutation.isPending}
        />
      </div>
    </div>
  );
}

interface PlanCardProps {
  plan: SubscriptionPlan;
  currentPlan: SubscriptionPlan;
  onSelect: () => void;
  isLoading?: boolean;
  disabled?: boolean;
  recommended?: boolean;
}

function PlanCard({
  plan,
  currentPlan,
  onSelect,
  isLoading,
  disabled,
  recommended,
}: PlanCardProps) {
  const limits = PLAN_LIMITS[plan];
  const price = PLAN_PRICES[plan];
  const isCurrent = plan === currentPlan;

  const features = [
    `${limits.maxTemplates ?? 'Unlimited'} templates`,
    `${limits.maxTeamMembers} team member${limits.maxTeamMembers > 1 ? 's' : ''}`,
    limits.premiumBlocksEnabled ? 'Premium blocks' : 'Standard blocks only',
    'Unlimited email sends',
    'API access',
  ];

  return (
    <Card className={recommended ? 'border-primary shadow-md' : ''}>
      <CardHeader>
        {recommended && (
          <div className="flex items-center gap-1 text-primary text-sm font-medium mb-2">
            <Sparkles className="h-4 w-4" />
            Recommended
          </div>
        )}
        <CardTitle className="flex items-center justify-between">
          {PLAN_LABELS[plan]}
          {isCurrent && (
            <Badge variant="outline" className="font-normal">
              Current
            </Badge>
          )}
        </CardTitle>
        <CardDescription>
          {price.monthly === 0 ? (
            <span className="text-2xl font-bold text-foreground">Free</span>
          ) : (
            <>
              <span className="text-2xl font-bold text-foreground">${price.monthly}</span>
              <span className="text-muted-foreground">/month</span>
            </>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <ul className="space-y-2 text-sm">
          {features.map((feature, i) => (
            <li key={i} className="flex items-center gap-2">
              <Check className="h-4 w-4 text-green-600" />
              {feature}
            </li>
          ))}
        </ul>
        <Button
          className="w-full"
          variant={isCurrent ? 'outline' : recommended ? 'default' : 'secondary'}
          onClick={onSelect}
          disabled={isCurrent || disabled || isLoading}
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : isCurrent ? (
            'Current Plan'
          ) : plan === 'free' ? (
            'Downgrade'
          ) : (
            `Upgrade to ${PLAN_LABELS[plan]}`
          )}
        </Button>
        {price.annual > 0 && (
          <p className="text-xs text-center text-muted-foreground">
            Or ${price.annual}/year (save ${price.monthly * 12 - price.annual})
          </p>
        )}
      </CardContent>
    </Card>
  );
}
