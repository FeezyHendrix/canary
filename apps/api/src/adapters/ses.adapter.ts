import { z } from 'zod';
import { SESClient, SendEmailCommand, GetSendQuotaCommand } from '@aws-sdk/client-ses';
import {
  BaseEmailAdapter,
  type SendEmailOptions,
  type SendResult,
  type TestResult,
} from './base.adapter';
import type { ConfigField, AdapterType } from '@canary/shared';

export class SESAdapter extends BaseEmailAdapter {
  readonly type: AdapterType = 'ses';
  readonly name = 'Amazon SES';

  readonly configSchema = z.object({
    accessKeyId: z.string().min(1),
    secretAccessKey: z.string().min(1),
    region: z.string().min(1),
  });

  private client: SESClient;

  constructor(config: Record<string, unknown>) {
    super(config);
    this.client = new SESClient({
      region: config.region as string,
      credentials: {
        accessKeyId: config.accessKeyId as string,
        secretAccessKey: config.secretAccessKey as string,
      },
    });
  }

  getConfigFields(): ConfigField[] {
    return [
      {
        name: 'accessKeyId',
        label: 'Access Key ID',
        type: 'text',
        required: true,
        placeholder: 'AKIAXXXXXXXXXXXXXXXX',
      },
      {
        name: 'secretAccessKey',
        label: 'Secret Access Key',
        type: 'password',
        required: true,
        placeholder: 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
      },
      {
        name: 'region',
        label: 'Region',
        type: 'select',
        required: true,
        options: [
          { value: 'us-east-1', label: 'US East (N. Virginia)' },
          { value: 'us-west-2', label: 'US West (Oregon)' },
          { value: 'eu-west-1', label: 'EU (Ireland)' },
          { value: 'eu-central-1', label: 'EU (Frankfurt)' },
          { value: 'ap-south-1', label: 'Asia Pacific (Mumbai)' },
          { value: 'ap-southeast-2', label: 'Asia Pacific (Sydney)' },
        ],
        defaultValue: 'us-east-1',
      },
    ];
  }

  async send(options: SendEmailOptions): Promise<SendResult> {
    try {
      const command = new SendEmailCommand({
        Source: options.from,
        Destination: {
          ToAddresses: options.to,
        },
        Message: {
          Subject: { Data: options.subject, Charset: 'UTF-8' },
          Body: {
            Html: { Data: options.html, Charset: 'UTF-8' },
            Text: options.text ? { Data: options.text, Charset: 'UTF-8' } : undefined,
          },
        },
        ReplyToAddresses: options.replyTo ? [options.replyTo] : undefined,
        Tags: options.tags?.map((t) => ({ Name: t, Value: 'true' })),
      });

      const result = await this.client.send(command);

      return {
        success: true,
        messageId: result.MessageId,
        providerResponse: result,
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'SES_ERROR',
          message: (error as Error).message,
        },
      };
    }
  }

  async testConnection(): Promise<TestResult> {
    try {
      const command = new GetSendQuotaCommand({});
      await this.client.send(command);
      return { success: true, message: 'Successfully connected to Amazon SES' };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to connect to Amazon SES',
        error: (error as Error).message,
      };
    }
  }
}
