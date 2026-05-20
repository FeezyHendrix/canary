import nodemailer from 'nodemailer';
import { env } from '../lib/env';

let transporter: nodemailer.Transporter | null = null;

function getTransporter(): nodemailer.Transporter | null {
  if (transporter) return transporter;

  if (!env.SMTP_HOST || !env.SMTP_PORT || !env.SMTP_FROM) {
    return null;
  }

  transporter = nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    secure: env.SMTP_PORT === 465,
    auth: env.SMTP_USER && env.SMTP_PASS ? { user: env.SMTP_USER, pass: env.SMTP_PASS } : undefined,
  });

  return transporter;
}

export function isSystemEmailConfigured(): boolean {
  return !!(env.SMTP_HOST && env.SMTP_PORT && env.SMTP_FROM);
}

interface SystemEmailOptions {
  to: string;
  subject: string;
  html: string;
}

export async function sendSystemEmail(options: SystemEmailOptions): Promise<boolean> {
  const transport = getTransporter();

  if (!transport) {
    console.warn('[system-email] SMTP not configured, skipping email send');
    return false;
  }

  await transport.sendMail({
    from: env.SMTP_FROM,
    to: options.to,
    subject: options.subject,
    html: options.html,
  });

  return true;
}

export function buildVerificationEmail(token: string): { subject: string; html: string } {
  const verifyUrl = `${env.APP_URL}/verify-email?token=${token}`;

  return {
    subject: 'Verify your email address',
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 480px; margin: 0 auto; padding: 40px 20px;">
        <h2 style="color: #111827; margin-bottom: 16px;">Verify your email</h2>
        <p style="color: #4b5563; line-height: 1.6;">Click the button below to verify your email address and activate your account.</p>
        <a href="${verifyUrl}" style="display: inline-block; background: #4f46e5; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; margin: 24px 0;">Verify Email</a>
        <p style="color: #9ca3af; font-size: 14px; margin-top: 24px;">If you didn't create an account, you can safely ignore this email.</p>
        <p style="color: #9ca3af; font-size: 12px; margin-top: 16px;">Or copy this link: ${verifyUrl}</p>
      </div>
    `,
  };
}

export function buildPasswordResetEmail(token: string): { subject: string; html: string } {
  const resetUrl = `${env.APP_URL}/reset-password?token=${token}`;

  return {
    subject: 'Reset your password',
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 480px; margin: 0 auto; padding: 40px 20px;">
        <h2 style="color: #111827; margin-bottom: 16px;">Reset your password</h2>
        <p style="color: #4b5563; line-height: 1.6;">Someone requested a password reset for your account. Click the button below to choose a new password.</p>
        <a href="${resetUrl}" style="display: inline-block; background: #4f46e5; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; margin: 24px 0;">Reset Password</a>
        <p style="color: #9ca3af; font-size: 14px; margin-top: 24px;">If you didn't request this, you can safely ignore this email. The link expires in 1 hour.</p>
        <p style="color: #9ca3af; font-size: 12px; margin-top: 16px;">Or copy this link: ${resetUrl}</p>
      </div>
    `,
  };
}
