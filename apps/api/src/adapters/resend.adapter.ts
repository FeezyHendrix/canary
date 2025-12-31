import { z } from 'zod';
import { Resend } from 'resend';
import {
  BaseEmailAdapter,
  type SendEmailOptions,
  type SendResult,
  type TestResult,
} from './base.adapter';
import type { ConfigField, AdapterType } from '@canary/shared';

export class ResendAdapter extends BaseEmailAdapter {
  readonly type: AdapterType = 'resend';
  readonly name = 'Resend';

  readonly configSchema = z.object({
    apiKey: z.string().min(1),
  });

  private client: Resend;

  constructor(config: Record<string, unknown>) {
    super(config);
    this.client = new Resend(config.apiKey as string);
  }

  getConfigFields(): ConfigField[] {
    return [
      {
        name: 'apiKey',
        label: 'API Key',
        type: 'password',
        required: true,
        placeholder: 're_xxxxxxxxxxxxxxxxxxxxxxxx',
        helpText: 'Get your API key from Resend Dashboard',
      },
    ];
  }

  async send(options: SendEmailOptions): Promise<SendResult> {
    try {
      const result = await this.client.emails.send({
        to: options.to,
        from: options.from,
        subject: options.subject,
        html: options.html,
        text: options.text,
        replyTo: options.replyTo,
        attachments: options.attachments?.map((a) => ({
          filename: a.filename,
          content: typeof a.content === 'string' ? Buffer.from(a.content, 'base64') : a.content,
        })),
        tags: options.tags?.map((t) => ({ name: t, value: 'true' })),
      });

      if (result.error) {
        return {
          success: false,
          error: {
            code: 'RESEND_ERROR',
            message: result.error.message,
          },
        };
      }

      return {
        success: true,
        messageId: result.data?.id,
        providerResponse: result.data,
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'RESEND_ERROR',
          message: (error as Error).message,
        },
      };
    }
  }

  async testConnection(): Promise<TestResult> {
    try {
      const result = await this.client.domains.list();

      if (result.error) {
        return {
          success: false,
          message: 'Failed to connect to Resend',
          error: result.error.message,
        };
      }

      return { success: true, message: 'Successfully connected to Resend' };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to connect to Resend',
        error: (error as Error).message,
      };
    }
  }
}
