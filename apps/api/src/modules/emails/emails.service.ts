import { eq, or } from 'drizzle-orm';
import { db, templates, emailLogs } from '../../db';
import { renderTemplate } from '../../lib/handlebars';
import { getDefaultAdapter } from '../adapters/adapters.service';
import { NotFoundError, AppError } from '../../lib/errors';
import { ERROR_CODES } from '@canary/shared';
import { emailQueue } from '../../jobs/queues';
import type { SendEmailInput } from './emails.schema';

export async function sendEmail(teamId: string, apiKeyId: string, input: SendEmailInput) {
  const template = await db.query.templates.findFirst({
    where: or(eq(templates.id, input.templateId), eq(templates.slug, input.templateId)),
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

  const variables = input.variables || {};
  const subject = input.subject || renderTemplate(template.subject, variables);
  const toAddresses = Array.isArray(input.to) ? input.to : [input.to];
  const fromAddress = input.from || adapter.defaultFrom;

  if (!fromAddress) {
    throw new AppError(ERROR_CODES.VALIDATION_ERROR, 'No from address specified', 400);
  }

  const hasPdfAttachment = (input.pdfAttachments?.length ?? 0) > 0;

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
      hasPdfAttachment,
    })
    .returning();

  const job = await emailQueue.add('send', {
    emailLogId: log.id,
    teamId,
    templateId: template.id,
    to: toAddresses,
    from: fromAddress,
    subject,
    variables,
    pdfAttachments: input.pdfAttachments,
    replyTo: input.replyTo,
    tags: input.tags,
    metadata: input.metadata,
  });

  await db.update(emailLogs).set({ jobId: job.id }).where(eq(emailLogs.id, log.id));

  return {
    id: log.id,
    jobId: job.id,
    status: 'queued' as const,
  };
}

export async function getEmailStatus(teamId: string, emailLogId: string) {
  const log = await db.query.emailLogs.findFirst({
    where: eq(emailLogs.id, emailLogId),
  });

  if (!log || log.teamId !== teamId) {
    throw new NotFoundError('Email');
  }

  return {
    id: log.id,
    status: log.status,
    sentAt: log.sentAt,
    providerMessageId: log.providerMessageId,
    errorMessage: log.errorMessage,
    hasPdfAttachment: log.hasPdfAttachment,
  };
}
