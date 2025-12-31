import { z } from 'zod';
import { ServerClient } from 'postmark';
import {
  BaseEmailAdapter,
  type SendEmailOptions,
  type SendResult,
  type TestResult,
} from './base.adapter';
import type { ConfigField, AdapterType } from '@canary/shared';

export class PostmarkAdapter extends BaseEmailAdapter {
  readonly type: AdapterType = 'postmark';
  readonly name = 'Postmark';

  readonly configSchema = z.object({
    serverToken: z.string().min(1),
  });

  private client: ServerClient;

  constructor(config: Record<string, unknown>) {
    super(config);
    this.client = new ServerClient(config.serverToken as string);
  }

  getConfigFields(): ConfigField[] {
    return [
      {
        name: 'serverToken',
        label: 'Server Token',
        type: 'password',
        required: true,
        placeholder: 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx',
        helpText: 'Get your Server Token from Postmark Server > API Tokens',
      },
    ];
  }

  async send(options: SendEmailOptions): Promise<SendResult> {
    try {
      const result = await this.client.sendEmail({
        To: options.to.join(', '),
        From: options.from,
        Subject: options.subject,
        HtmlBody: options.html,
        TextBody: options.text,
        ReplyTo: options.replyTo,
        Attachments: options.attachments?.map((a) => ({
          Name: a.filename,
          Content: typeof a.content === 'string' ? a.content : a.content.toString('base64'),
          ContentType: a.contentType || 'application/octet-stream',
          ContentID: null,
        })),
        Tag: options.tags?.[0],
        Metadata: options.metadata,
      });

      return {
        success: true,
        messageId: result.MessageID,
        providerResponse: result,
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'POSTMARK_ERROR',
          message: (error as Error).message,
        },
      };
    }
  }

  async testConnection(): Promise<TestResult> {
    try {
      await this.client.getServer();
      return { success: true, message: 'Successfully connected to Postmark' };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to connect to Postmark',
        error: (error as Error).message,
      };
    }
  }
}
