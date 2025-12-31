export const EMAIL_STATUSES = {
  QUEUED: 'queued',
  SENT: 'sent',
  DELIVERED: 'delivered',
  OPENED: 'opened',
  CLICKED: 'clicked',
  BOUNCED: 'bounced',
  FAILED: 'failed',
  SPAM: 'spam',
} as const;

export type EmailStatus = (typeof EMAIL_STATUSES)[keyof typeof EMAIL_STATUSES];

export const EMAIL_STATUS_LIST: EmailStatus[] = [
  'queued',
  'sent',
  'delivered',
  'opened',
  'clicked',
  'bounced',
  'failed',
  'spam',
];

export const EMAIL_STATUS_LABELS: Record<EmailStatus, string> = {
  queued: 'Queued',
  sent: 'Sent',
  delivered: 'Delivered',
  opened: 'Opened',
  clicked: 'Clicked',
  bounced: 'Bounced',
  failed: 'Failed',
  spam: 'Spam',
};

export const EMAIL_STATUS_COLORS: Record<EmailStatus, string> = {
  queued: 'gray',
  sent: 'blue',
  delivered: 'green',
  opened: 'cyan',
  clicked: 'purple',
  bounced: 'orange',
  failed: 'red',
  spam: 'yellow',
};
