export const ADAPTER_TYPES = {
  SENDGRID: 'sendgrid',
  RESEND: 'resend',
  MAILGUN: 'mailgun',
  SES: 'ses',
  POSTMARK: 'postmark',
  SMTP: 'smtp',
} as const;

export type AdapterType = (typeof ADAPTER_TYPES)[keyof typeof ADAPTER_TYPES];

export const ADAPTER_TYPE_LIST: AdapterType[] = [
  'sendgrid',
  'resend',
  'mailgun',
  'ses',
  'postmark',
  'smtp',
];

export const ADAPTER_DISPLAY_NAMES: Record<AdapterType, string> = {
  sendgrid: 'SendGrid',
  resend: 'Resend',
  mailgun: 'Mailgun',
  ses: 'Amazon SES',
  postmark: 'Postmark',
  smtp: 'SMTP',
};

export const ADAPTER_DESCRIPTIONS: Record<AdapterType, string> = {
  sendgrid: 'Twilio SendGrid email delivery service',
  resend: 'Modern email API built for developers',
  mailgun: 'Powerful email delivery by Mailgun',
  ses: 'Amazon Simple Email Service',
  postmark: 'Transactional email service by Wildbit',
  smtp: 'Generic SMTP server connection',
};
