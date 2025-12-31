import { eq, or } from 'drizzle-orm';
import { db, templates, emailLogs, adapters } from '../../db';
import { decryptJson } from '../../lib/encryption';
import { renderTemplate } from '../../lib/handlebars';
import { createAdapter } from '../../adapters/adapter.factory';
import { getDefaultAdapter } from '../adapters/adapters.service';
import { NotFoundError, AppError } from '../../lib/errors';
import { ERROR_CODES } from '@canary/shared';
import type { SendEmailInput } from './emails.schema';
import type { AdapterType } from '@canary/shared';

export async function sendEmail(
  teamId: string,
  apiKeyId: string,
  input: SendEmailInput
) {
  const template = await db.query.templates.findFirst({
    where: or(
      eq(templates.id, input.templateId),
      eq(templates.slug, input.templateId)
    ),
  });

  if (!template || template.teamId !== teamId) {
    throw new NotFoundError('Template');
  }

  if (!template.isActive) {
    throw new AppError(ERROR_CODES.INVALID_TEMPLATE, 'Template is not active', 400);
  }

  const adapter = await getDefaultAdapter(teamId);

  if (!adapter) {
    throw new AppError(ERROR_CODES.ADAPTER_ERROR, 'No email adapter configured', 400);
  }

  const adapterConfig = decryptJson(adapter.configEncrypted);
  const emailAdapter = createAdapter(adapter.type as AdapterType, adapterConfig);

  const variables = input.variables || {};
  const subject = input.subject || renderTemplate(template.subject, variables);
  const html = renderTemplate(template.compiledHtml || '', variables);
  const toAddresses = Array.isArray(input.to) ? input.to : [input.to];
  const fromAddress = input.from || adapter.defaultFrom;

  if (!fromAddress) {
    throw new AppError(ERROR_CODES.VALIDATION_ERROR, 'No from address specified', 400);
  }

  const [log] = await db
    .insert(emailLogs)
    .values({
      teamId,
      templateId: template.id,
      templateVersionId: template.currentVersionId,
      adapterId: adapter.id,
      apiKeyId,
      toAddresses,
      fromAddress,
      subject,
      variables,
      status: 'queued',
    })
    .returning();

  const result = await emailAdapter.send({
    to: toAddresses,
    from: fromAddress,
    subject,
    html,
    text: stripHtml(html),
    replyTo: input.replyTo,
    attachments: input.attachments?.map((a) => ({
      filename: a.filename,
      content: a.content,
      contentType: a.contentType,
    })),
    tags: input.tags,
    metadata: input.metadata,
  });

  if (result.success) {
    await db
      .update(emailLogs)
      .set({
        status: 'sent',
        sentAt: new Date(),
        providerMessageId: result.messageId,
        providerResponse: result.providerResponse as Record<string, unknown>,
      })
      .where(eq(emailLogs.id, log.id));

    return {
      id: log.id,
      status: 'sent' as const,
      messageId: result.messageId,
    };
  }

  await db
    .update(emailLogs)
    .set({
      status: 'failed',
      errorCode: result.error?.code,
      errorMessage: result.error?.message,
    })
    .where(eq(emailLogs.id, log.id));

  throw new AppError(
    ERROR_CODES.SEND_FAILED,
    result.error?.message || 'Failed to send email',
    500
  );
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
}
