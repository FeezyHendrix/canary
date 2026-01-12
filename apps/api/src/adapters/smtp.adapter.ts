import { z } from 'zod';
import nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';
import { BaseEmailAdapter, type SendEmailOptions, type SendResult, type TestResult } from './base.adapter';
import type { ConfigField, AdapterType } from '@canary/shared';

export class SMTPAdapter extends BaseEmailAdapter {
  readonly type: AdapterType = 'smtp';
  readonly name = 'SMTP';

  readonly configSchema = z.object({
    host: z.string().min(1),
    port: z.coerce.number().min(1).max(65535),
    secure: z.boolean().default(true),
    username: z.string().optional(),
    password: z.string().optional(),
  });

  private transporter: Transporter;

  constructor(config: Record<string, unknown>) {
    super(config);
    this.transporter = nodemailer.createTransport({
      host: config.host as string,
      port: config.port as number,
      secure: config.secure as boolean,
      auth:
        config.username && config.password
          ? {
              user: config.username as string,
              pass: config.password as string,
            }
          : undefined,
    });
  }

  getConfigFields(): ConfigField[] {
    return [
      {
        name: 'host',
        label: 'SMTP Host',
        type: 'text',
        required: true,
        placeholder: 'smtp.example.com',
      },
      {
        name: 'port',
        label: 'Port',
        type: 'number',
        required: true,
        placeholder: '587',
        defaultValue: 587,
      },
      {
        name: 'secure',
        label: 'Use TLS/SSL',
        type: 'boolean',
        required: false,
        defaultValue: true,
        helpText: 'Use port 465 with SSL, or port 587 with STARTTLS',
      },
      {
        name: 'username',
        label: 'Username',
        type: 'text',
        required: false,
        placeholder: 'your-username',
      },
      {
        name: 'password',
        label: 'Password',
        type: 'password',
        required: false,
        placeholder: 'your-password',
      },
    ];
  }

  async send(options: SendEmailOptions): Promise<SendResult> {
    try {
      const result = await this.transporter.sendMail({
        to: options.to.join(', '),
        from: options.from,
        subject: options.subject,
        html: options.html,
        text: options.text,
        replyTo: options.replyTo,
        attachments: options.attachments?.map((a) => ({
          filename: a.filename,
          content: typeof a.content === 'string' ? Buffer.from(a.content, 'base64') : a.content,
          contentType: a.contentType,
          cid: a.cid, // For inline images (e.g., charts)
        })),
      });

      return {
        success: true,
        messageId: result.messageId,
        providerResponse: result,
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'SMTP_ERROR',
          message: (error as Error).message,
        },
      };
    }
  }

  async testConnection(): Promise<TestResult> {
    try {
      await this.transporter.verify();
      return { success: true, message: 'Successfully connected to SMTP server' };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to connect to SMTP server',
        error: (error as Error).message,
      };
    }
  }
}
