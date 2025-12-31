import { Worker, Job } from 'bullmq';
import { Redis } from 'ioredis';
import { eq, or } from 'drizzle-orm';
import { db, templates, emailLogs } from '../../db';
import { renderTemplate } from '../../lib/handlebars';
import { generatePdfFromHtml, isPdfEnabled } from '../../services/pdf.service';
import { createAdapter } from '../../adapters/adapter.factory';
import { decryptJson } from '../../lib/encryption';
import { getDefaultAdapter } from '../../modules/adapters/adapters.service';
import type { EmailJobData } from '../queues';
import type { AdapterType } from '@canary/shared';
import { env } from '../../lib/env';

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export function createEmailWorker() {
  const connection = new Redis(env.REDIS_URL, { maxRetriesPerRequest: null });

  const worker = new Worker<EmailJobData>(
    'email',
    async (job: Job<EmailJobData>) => {
      const {
        emailLogId,
        teamId,
        templateId,
        to,
        from,
        subject,
        variables,
        pdfAttachments,
        replyTo,
        tags,
        metadata,
      } = job.data;

      const template = await db.query.templates.findFirst({
        where: eq(templates.id, templateId),
      });

      if (!template) {
        throw new Error(`Template ${templateId} not found`);
      }

      const html = renderTemplate(template.compiledHtml || '', variables);
      const renderedSubject = renderTemplate(subject, variables);

      const attachments: Array<{ filename: string; content: Buffer; contentType: string }> = [];

      if (pdfAttachments?.length && isPdfEnabled()) {
        for (const pdfAttachment of pdfAttachments) {
          const pdfTemplate = await db.query.templates.findFirst({
            where: or(
              eq(templates.id, pdfAttachment.templateId),
              eq(templates.slug, pdfAttachment.templateId)
            ),
          });

          if (!pdfTemplate) {
            console.warn(`[worker] PDF template ${pdfAttachment.templateId} not found, skipping`);
            continue;
          }

          const pdfVariables = pdfAttachment.variables ?? variables;
          const pdfHtml = renderTemplate(pdfTemplate.compiledHtml || '', pdfVariables);
          const pdfBuffer = await generatePdfFromHtml(pdfHtml);

          attachments.push({
            filename: pdfAttachment.filename,
            content: pdfBuffer,
            contentType: 'application/pdf',
          });
        }
      }

      const adapter = await getDefaultAdapter(teamId);
      if (!adapter) {
        throw new Error('No email adapter configured');
      }

      const adapterConfig = decryptJson(adapter.configEncrypted);
      const emailAdapter = createAdapter(adapter.type as AdapterType, adapterConfig);

      const result = await emailAdapter.send({
        to,
        from,
        subject: renderedSubject,
        html,
        text: stripHtml(html),
        replyTo,
        attachments: attachments.map((a) => ({
          filename: a.filename,
          content: a.content,
          contentType: a.contentType,
        })),
        tags,
        metadata,
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
          .where(eq(emailLogs.id, emailLogId));

        return { success: true, messageId: result.messageId };
      }

      throw new Error(result.error?.message || 'Failed to send email');
    },
    {
      connection,
      concurrency: env.WORKER_CONCURRENCY,
    }
  );

  worker.on('completed', (job: Job<EmailJobData>) => {
    console.log(`[worker] Email job ${job.id} completed`);
  });

  worker.on('failed', async (job: Job<EmailJobData> | undefined, err: Error) => {
    console.error(`[worker] Email job ${job?.id} failed: ${err.message}`);

    if (job) {
      await db
        .update(emailLogs)
        .set({
          status: 'failed',
          errorMessage: err.message,
        })
        .where(eq(emailLogs.id, job.data.emailLogId));
    }
  });

  return worker;
}
