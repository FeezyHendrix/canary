import { z } from 'zod';
import Mailgun from 'mailgun.js';
import formData from 'form-data';
import { BaseEmailAdapter, type SendEmailOptions, type SendResult, type TestResult } from './base.adapter';
import type { ConfigField, AdapterType } from '@canary/shared';

export class MailgunAdapter extends BaseEmailAdapter {
  readonly type: AdapterType = 'mailgun';
  readonly name = 'Mailgun';

  readonly configSchema = z.object({
    apiKey: z.string().min(1),
    domain: z.string().min(1),
    region: z.enum(['us', 'eu']).default('us'),
  });

  private client: ReturnType<Mailgun['client']>;
  private domain: string;

  constructor(config: Record<string, unknown>) {
    super(config);
    const mailgun = new Mailgun(formData);
    const region = (config.region as string) || 'us';
    this.client = mailgun.client({
      username: 'api',
      key: config.apiKey as string,
      url: region === 'eu' ? 'https://api.eu.mailgun.net' : 'https://api.mailgun.net',
    });
    this.domain = config.domain as string;
  }

  getConfigFields(): ConfigField[] {
    return [
      {
        name: 'apiKey',
        label: 'API Key',
        type: 'password',
        required: true,
        placeholder: 'key-xxxxxxxxxxxxxxxxxxxxxxxx',
        helpText: 'Get your API key from Mailgun Dashboard > API Keys',
      },
      {
        name: 'domain',
        label: 'Domain',
        type: 'text',
        required: true,
        placeholder: 'mg.yourdomain.com',
        helpText: 'Your verified sending domain',
      },
      {
        name: 'region',
        label: 'Region',
        type: 'select',
        required: false,
        options: [
          { value: 'us', label: 'US' },
          { value: 'eu', label: 'EU' },
        ],
        defaultValue: 'us',
      },
    ];
  }

  async send(options: SendEmailOptions): Promise<SendResult> {
    try {
      const result = await this.client.messages.create(this.domain, {
        to: options.to,
        from: options.from,
        subject: options.subject,
        html: options.html,
        text: options.text,
        'h:Reply-To': options.replyTo,
        attachment: options.attachments?.map((a) => ({
          filename: a.filename,
          data: typeof a.content === 'string' ? Buffer.from(a.content, 'base64') : a.content,
        })),
        'o:tag': options.tags,
      });

      return {
        success: true,
        messageId: result.id,
        providerResponse: result,
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'MAILGUN_ERROR',
          message: (error as Error).message,
        },
      };
    }
  }

  async testConnection(): Promise<TestResult> {
    try {
      await this.client.domains.get(this.domain);
      return { success: true, message: 'Successfully connected to Mailgun' };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to connect to Mailgun',
        error: (error as Error).message,
      };
    }
  }
}
