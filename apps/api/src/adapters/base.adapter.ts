import { z } from 'zod';
import type { ConfigField, AdapterType } from '@canary/shared';

export interface SendEmailOptions {
  to: string[];
  from: string;
  subject: string;
  html: string;
  text?: string;
  replyTo?: string;
  attachments?: Array<{
    filename: string;
    content: Buffer | string;
    contentType?: string;
  }>;
  tags?: string[];
  metadata?: Record<string, string>;
}

export interface SendResult {
  success: boolean;
  messageId?: string;
  providerResponse?: unknown;
  error?: {
    code: string;
    message: string;
  };
}

export interface TestResult {
  success: boolean;
  message: string;
  error?: string;
}

export abstract class BaseEmailAdapter {
  abstract readonly type: AdapterType;
  abstract readonly name: string;
  abstract readonly configSchema: z.ZodSchema;

  protected config: Record<string, unknown>;

  constructor(config: Record<string, unknown>) {
    this.config = config;
  }

  abstract send(options: SendEmailOptions): Promise<SendResult>;
  abstract testConnection(): Promise<TestResult>;
  abstract getConfigFields(): ConfigField[];

  validateConfig(): boolean {
    const result = this.configSchema.safeParse(this.config);
    return result.success;
  }
}
