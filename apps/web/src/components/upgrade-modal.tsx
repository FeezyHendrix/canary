import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { api } from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/toaster';
import { X, Check, Sparkles, Loader2 } from 'lucide-react';
import { PLAN_LABELS, PLAN_PRICES, PLAN_LIMITS } from '@canary/shared';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  feature: 'premium_blocks' | 'templates' | 'team_members';
  currentUsage?: number; // Used for display purposes in future iterations
}

const featureMessages = {
  premium_blocks: {
    title: 'Unlock Premium Blocks',
    description:
      'Premium blocks like Charts, Videos, Tables, and Code blocks are available on Pro and Team plans.',
  },
  templates: {
    title: 'Template Limit Reached',
    description:
      "You've reached the maximum number of templates on your current plan. Upgrade to create more templates.",
  },
  team_members: {
    title: 'Team Member Limit Reached',
    description:
      "You've reached the maximum number of team members on your current plan. Upgrade to invite more people.",
  },
};

export function UpgradeModal({ isOpen, onClose, feature, currentUsage: _currentUsage }: UpgradeModalProps) {
  const navigate = useNavigate();
  const [selectedPlan, setSelectedPlan] = useState<'pro' | 'team'>('pro');

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

  if (!isOpen) return null;

  const message = featureMessages[feature];

  const handleUpgrade = () => {
    checkoutMutation.mutate({ plan: selectedPlan, interval: 'monthly' });
  };

  const handleViewPlans = () => {
    onClose();
    navigate('/billing');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-background rounded-lg shadow-lg w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-violet-600 rounded-lg flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <h2 className="text-lg font-semibold">{message.title}</h2>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <p className="text-muted-foreground mb-6">{message.description}</p>

        <div className="space-y-3 mb-6">
          <PlanOption
            plan="pro"
            isSelected={selectedPlan === 'pro'}
            onSelect={() => setSelectedPlan('pro')}
            feature={feature}
          />
          <PlanOption
            plan="team"
            isSelected={selectedPlan === 'team'}
            onSelect={() => setSelectedPlan('team')}
            feature={feature}
          />
        </div>

        <div className="flex gap-3">
          <Button variant="outline" className="flex-1" onClick={handleViewPlans}>
            Compare Plans
          </Button>
          <Button className="flex-1" onClick={handleUpgrade} disabled={checkoutMutation.isPending}>
            {checkoutMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              `Upgrade to ${PLAN_LABELS[selectedPlan]}`
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

interface PlanOptionProps {
  plan: 'pro' | 'team';
  isSelected: boolean;
  onSelect: () => void;
  feature: 'premium_blocks' | 'templates' | 'team_members';
}

function PlanOption({ plan, isSelected, onSelect, feature }: PlanOptionProps) {
  const limits = PLAN_LIMITS[plan];
  const price = PLAN_PRICES[plan];

  const getFeatureHighlight = () => {
    switch (feature) {
      case 'premium_blocks':
        return 'All premium blocks included';
      case 'templates':
        return `${limits.maxTemplates ?? 'Unlimited'} templates`;
      case 'team_members':
        return `Up to ${limits.maxTeamMembers} team member${limits.maxTeamMembers > 1 ? 's' : ''}`;
    }
  };

  return (
    <button
      onClick={onSelect}
      className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
        isSelected
          ? 'border-primary bg-primary/5'
          : 'border-border hover:border-muted-foreground/30'
      }`}
    >
      <div className="flex items-center justify-between mb-1">
        <span className="font-semibold">{PLAN_LABELS[plan]}</span>
        <span className="text-sm">
          <span className="font-semibold">${price.monthly}</span>
          <span className="text-muted-foreground">/mo</span>
        </span>
      </div>
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Check className="h-4 w-4 text-green-600" />
        {getFeatureHighlight()}
      </div>
    </button>
  );
}
