# Paid Plans Design - Canary Email Builder

## Overview

Implement a SaaS pricing model for Canary with Polar.sh as the payment processor.

## Pricing Tiers

| | **Free** | **Pro** | **Team** |
|---|---|---|---|
| **Monthly** | $0 | $9/mo | $19/mo |
| **Annual** | $0 | $90/yr | $190/yr |
| **Templates** | 3 | 25 | Unlimited |
| **Premium Blocks** | ❌ | ✅ | ✅ |
| **Team Members** | 1 | 1 | 10 |
| **Email Sends** | Unlimited | Unlimited | Unlimited |
| **API Access** | ✅ | ✅ | ✅ |

### Premium Blocks (gated on Free)
- Chart (bar, line, pie, area, doughnut)
- Video
- Table
- Code
- Quote
- List
- Badge
- Icon
- SocialIcons

### Standard Blocks (always available)
- Text, Heading, Button, Image, Divider, Spacer, Container, Columns, Avatar, HTML

## Payment Processing

**Polar.sh** handles:
- Payment processing (4% + $0.40 per transaction)
- Global tax compliance (VAT, GST, etc.)
- Customer portal for subscription management
- Webhook notifications for plan changes

## Database Schema

### subscriptions table
```sql
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  polar_customer_id VARCHAR(255),
  polar_subscription_id VARCHAR(255),
  plan VARCHAR(20) NOT NULL DEFAULT 'free', -- 'free' | 'pro' | 'team'
  status VARCHAR(20) NOT NULL DEFAULT 'active', -- 'active' | 'canceled' | 'past_due'
  current_period_end TIMESTAMP,
  cancel_at_period_end BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(team_id)
);
```

### Plan Limits (static config)
```typescript
const PLAN_LIMITS = {
  free: { maxTemplates: 3, maxTeamMembers: 1, premiumBlocksEnabled: false },
  pro: { maxTemplates: 25, maxTeamMembers: 1, premiumBlocksEnabled: true },
  team: { maxTemplates: null, maxTeamMembers: 10, premiumBlocksEnabled: true }
};
```

## API Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/billing/checkout` | POST | Generate Polar checkout URL |
| `/api/billing/portal` | POST | Generate customer portal URL |
| `/api/billing/subscription` | GET | Get current team's subscription |
| `/api/webhooks/polar` | POST | Handle Polar webhook events |

## Checkout Flow

```
User clicks "Upgrade to Pro"
       ↓
Frontend calls POST /api/billing/checkout
       ↓
Backend generates Polar checkout URL (with teamId in metadata)
       ↓
Frontend redirects to Polar checkout
       ↓
User completes payment
       ↓
Polar redirects to /settings/billing?success=true
       ↓
Polar sends webhook to /api/webhooks/polar
       ↓
Backend creates/updates subscription record
       ↓
Team immediately gets Pro features
```

## Webhook Events

- `subscription.created` - Create subscription record
- `subscription.updated` - Update plan/status
- `subscription.canceled` - Mark canceled
- `checkout.completed` - Initial purchase success

## Frontend Feature Gating

### Block Gating
- Premium blocks show lock icon on Free plan
- Clicking locked block shows upgrade modal
- Backend rejects template save if contains premium blocks on Free

### Template Gating
- Check template count before creation
- Show "X/Y templates used" indicator
- Upgrade modal when at limit

### Team Member Gating
- Check member count before invite
- Show "X/Y members" indicator
- Upgrade modal when at limit

## Billing Page (/settings/billing)

Shows:
- Current plan with badge
- Usage indicators (templates, members)
- Plan comparison cards
- Upgrade/downgrade buttons
- "Manage Subscription" link to Polar portal

## Environment Variables

```
POLAR_ACCESS_TOKEN=xxx
POLAR_WEBHOOK_SECRET=xxx
POLAR_PRO_MONTHLY_PRICE_ID=xxx
POLAR_PRO_ANNUAL_PRICE_ID=xxx
POLAR_TEAM_MONTHLY_PRICE_ID=xxx
POLAR_TEAM_ANNUAL_PRICE_ID=xxx
```

## Migration Strategy

- Add subscriptions table
- All existing teams default to 'free' plan
- No data migration needed for existing templates/members
