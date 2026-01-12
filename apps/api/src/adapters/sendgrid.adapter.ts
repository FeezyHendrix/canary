import { z } from 'zod';
import sgMail from '@sendgrid/mail';
import { BaseEmailAdapter, type SendEmailOptions, type SendResult, type TestResult } from './base.adapter';
import type { ConfigField, AdapterType } from '@canary/shared';

export class SendGridAdapter extends BaseEmailAdapter {
  readonly type: AdapterType = 'sendgrid';
  readonly name = 'SendGrid';

  readonly configSchema = z.object({
    apiKey: z.string().min(1),
  });

  constructor(config: Record<string, unknown>) {
    super(config);
    sgMail.setApiKey(config.apiKey as string);
  }

  getConfigFields(): ConfigField[] {
    return [
      {
        name: 'apiKey',
        label: 'API Key',
        type: 'password',
        required: true,
        placeholder: 'SG.xxxxxxxxxxxxxxxxxxxxxxxx',
        helpText: 'Get your API key from SendGrid Settings > API Keys',
      },
    ];
  }

  async send(options: SendEmailOptions): Promise<SendResult> {
    try {
      const [response] = await sgMail.send({
        to: options.to,
        from: options.from,
        subject: options.subject,
        html: options.html,
        text: options.text,
        replyTo: options.replyTo,
        attachments: options.attachments?.map((a) => ({
          filename: a.filename,
          content: typeof a.content === 'string' ? a.content : a.content.toString('base64'),
          type: a.contentType,
          disposition: a.cid ? 'inline' : 'attachment',
          content_id: a.cid,
        })),
        customArgs: options.metadata,
        categories: options.tags,
      });

      return {
        success: true,
        messageId: response.headers['x-message-id'] as string,
        providerResponse: response,
      };
    } catch (error) {
      const err = error as { response?: { body?: { errors?: Array<{ message: string }> } }; message?: string };
      return {
        success: false,
        error: {
          code: 'SENDGRID_ERROR',
          message: err.response?.body?.errors?.[0]?.message || err.message || 'Unknown error',
        },
      };
    }
  }

  async testConnection(): Promise<TestResult> {
    try {
      const response = await fetch('https://api.sendgrid.com/v3/user/profile', {
        headers: { Authorization: `Bearer ${this.config.apiKey}` },
      });

      if (response.ok) {
        return { success: true, message: 'Successfully connected to SendGrid' };
      }

      return {
        success: false,
        message: 'Failed to connect to SendGrid',
        error: `HTTP ${response.status}`,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to connect to SendGrid',
        error: (error as Error).message,
      };
    }
  }
}
