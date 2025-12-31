export interface Webhook {
  id: string;
  teamId: string;
  name: string;
  url: string;
  events: WebhookEvent[];
  isActive: boolean;
  lastTriggeredAt: Date | null;
  lastSuccessAt: Date | null;
  consecutiveFailures: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface WebhookDelivery {
  id: string;
  webhookId: string;
  event: WebhookEvent;
  payload: Record<string, unknown>;
  responseStatus: number | null;
  responseBody: string | null;
  success: boolean;
  attemptCount: number;
  createdAt: Date;
}

export interface CreateWebhookInput {
  name: string;
  url: string;
  events: WebhookEvent[];
}

export interface UpdateWebhookInput {
  name?: string;
  url?: string;
  events?: WebhookEvent[];
  isActive?: boolean;
}

export const WEBHOOK_EVENTS = [
  'email.queued',
  'email.sent',
  'email.delivered',
  'email.opened',
  'email.clicked',
  'email.bounced',
  'email.failed',
  'email.spam',
] as const;

export type WebhookEvent = (typeof WEBHOOK_EVENTS)[number];

export interface WebhookPayload {
  event: WebhookEvent;
  timestamp: string;
  data: {
    emailId: string;
    templateId?: string;
    to: string[];
    subject: string;
    status: string;
    error?: string;
  };
}
