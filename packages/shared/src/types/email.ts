import type { EmailStatus } from '../constants/email-status';

export interface EmailLog {
  id: string;
  teamId: string;
  templateId: string | null;
  templateVersionId: string | null;
  adapterId: string | null;
  apiKeyId: string | null;
  toAddresses: string[];
  fromAddress: string;
  subject: string;
  variables: Record<string, unknown> | null;
  status: EmailStatus;
  providerMessageId: string | null;
  providerResponse: Record<string, unknown> | null;
  errorMessage: string | null;
  errorCode: string | null;
  sentAt: Date | null;
  deliveredAt: Date | null;
  openedAt: Date | null;
  clickedAt: Date | null;
  bouncedAt: Date | null;
  createdAt: Date;
}

export interface SendEmailInput {
  templateId: string;
  to: string | string[];
  variables?: Record<string, unknown>;
  from?: string;
  subject?: string;
  replyTo?: string;
  attachments?: EmailAttachment[];
  tags?: string[];
  metadata?: Record<string, string>;
}

export interface EmailAttachment {
  filename: string;
  content: string; // Base64 encoded
  contentType?: string;
}

export interface SendEmailResponse {
  id: string;
  status: 'queued' | 'sent';
  messageId?: string;
}

export interface EmailLogListItem {
  id: string;
  templateName: string | null;
  toAddresses: string[];
  subject: string;
  status: EmailStatus;
  createdAt: Date;
  sentAt: Date | null;
}

export interface EmailStats {
  total: number;
  sent: number;
  delivered: number;
  opened: number;
  clicked: number;
  bounced: number;
  failed: number;
}

export interface EmailLogFilters {
  templateId?: string;
  status?: EmailStatus;
  from?: Date;
  to?: Date;
  search?: string;
}
