import { Worker, Job } from 'bullmq';
import { Redis } from 'ioredis';
import { eq, or } from 'drizzle-orm';
import { db, templates, emailLogs, teams } from '../../db';
import { renderTemplate } from '../../lib/handlebars';
import { generatePdfFromHtml, isPdfEnabled } from '../../services/pdf.service';
import { renderChartToImage, isChartRenderingEnabled } from '../../services/chart.service';
import { createAdapter } from '../../adapters/adapter.factory';
import { decryptJson } from '../../lib/encryption';
import { getDefaultAdapter } from '../../modules/adapters/adapters.service';
import type { EmailJobData } from '../queues';
import type { AdapterType, ChartBlockProps, ChartData } from '@canary/shared';
import { env } from '../../lib/env';
import { nanoid } from 'nanoid';

/**
 * Canary branding footer HTML - shown for free tier users
 */
const CANARY_BRANDING_FOOTER = `
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top: 32px; border-top: 1px solid #e5e7eb;">
  <tr>
    <td style="padding: 24px 0; text-align: center;">
      <p style="margin: 0; font-size: 12px; color: #9ca3af; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
        Made with ❤️ by <a href="https://canarymail.dev" style="color: #6366f1; text-decoration: none;">Canary</a>
      </p>
    </td>
  </tr>
</table>
`;

/**
 * Add Canary branding footer to HTML email
 * Inserts before closing </body> tag, or appends to end if no body tag
 */
function addBrandingFooter(html: string): string {
  const bodyCloseIndex = html.toLowerCase().lastIndexOf('</body>');
  if (bodyCloseIndex !== -1) {
    return html.slice(0, bodyCloseIndex) + CANARY_BRANDING_FOOTER + html.slice(bodyCloseIndex);
  }
  // No body tag, append to end
  return html + CANARY_BRANDING_FOOTER;
}

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

interface ChartBlock {
  blockId: string;
  props: ChartBlockProps;
}

/**
 * Extract chart blocks from template design JSON
 */
function extractChartBlocks(designJson: Record<string, unknown>): ChartBlock[] {
  const chartBlocks: ChartBlock[] = [];

  // The designJson is a flat object with block IDs as keys
  // e.g., { root: {...}, 'block-123': { type: 'Chart', data: {...} } }
  for (const [blockId, block] of Object.entries(designJson)) {
    if (block && typeof block === 'object') {
      const blockObj = block as Record<string, unknown>;
      if (blockObj.type === 'Chart' && blockObj.data) {
        const data = blockObj.data as { props?: ChartBlockProps };
        if (data.props) {
          chartBlocks.push({ blockId, props: data.props });
          console.log(`[worker] Found Chart block: ${blockId}`);
        }
      }
    }
  }

  return chartBlocks;
}

/**
 * Process chart blocks and return CID attachments
 */
async function processChartBlocks(
  chartBlocks: ChartBlock[],
  variables: Record<string, unknown>
): Promise<{
  attachments: Array<{ filename: string; content: Buffer; contentType: string; cid: string }>;
  replacements: Map<string, string>;
}> {
  const attachments: Array<{ filename: string; content: Buffer; contentType: string; cid: string }> = [];
  const replacements = new Map<string, string>();

  if (!isChartRenderingEnabled()) {
    console.warn('[worker] Chart rendering not available (Gotenberg not configured)');
    return { attachments, replacements };
  }

  for (const chart of chartBlocks) {
    try {
      let chartData: ChartData | undefined;

      if (chart.props.dataSource === 'dynamic' && chart.props.dynamicVariable) {
        // Get chart data from variables
        chartData = variables[chart.props.dynamicVariable] as ChartData | undefined;
        if (!chartData) {
          console.warn(`[worker] Chart data variable '${chart.props.dynamicVariable}' not found`);
          continue;
        }
      } else if (chart.props.dataSource === 'static' && chart.props.staticData) {
        chartData = chart.props.staticData;
      }

      if (!chartData) {
        console.warn(`[worker] No chart data available for block ${chart.blockId}`);
        continue;
      }

      // Render chart to image
      const imageBuffer = await renderChartToImage(chart.props, chartData);
      const cid = `chart_${nanoid(8)}`;

      attachments.push({
        filename: `${cid}.png`,
        content: imageBuffer,
        contentType: 'image/png',
        cid,
      });

      // Store replacement mapping
      replacements.set(chart.blockId, cid);
    } catch (error) {
      console.error(`[worker] Failed to render chart ${chart.blockId}:`, error);
    }
  }

  return { attachments, replacements };
}

/**
 * Replace chart placeholders in HTML with CID image references
 */
function replaceChartPlaceholders(
  html: string,
  chartBlocks: ChartBlock[],
  replacements: Map<string, string>
): string {
  let result = html;

  for (const chart of chartBlocks) {
    const cid = replacements.get(chart.blockId);
    if (cid) {
      // Replace chart placeholder with image tag
      // The placeholder format depends on how the email builder serializes charts
      // We'll look for a div/span with data-chart-id or similar pattern
      const placeholder = new RegExp(
        `<div[^>]*data-block-type="Chart"[^>]*data-block-id="${chart.blockId}"[^>]*>.*?</div>`,
        'gs'
      );
      const imgTag = `<img src="cid:${cid}" alt="${chart.props.title || 'Chart'}" width="${chart.props.width}" height="${chart.props.height}" style="display:block;max-width:100%;" />`;
      result = result.replace(placeholder, imgTag);
    }
  }

  return result;
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

      let html = renderTemplate(template.compiledHtml || '', variables);
      const renderedSubject = renderTemplate(subject, variables);

      const attachments: Array<{ filename: string; content: Buffer; contentType: string; cid?: string }> = [];

      // Process chart blocks
      const chartBlocks = extractChartBlocks(template.designJson as Record<string, unknown>);
      console.log(`[worker] Found ${chartBlocks.length} chart blocks:`, chartBlocks.map(c => ({ blockId: c.blockId, type: c.props.chartType })));

      if (chartBlocks.length > 0) {
        console.log('[worker] Processing chart blocks...');
        const { attachments: chartAttachments, replacements } = await processChartBlocks(
          chartBlocks,
          variables
        );

        console.log(`[worker] Rendered ${chartAttachments.length} chart images, replacements:`, Array.from(replacements.entries()));

        // Add chart images as CID attachments
        for (const chartAttachment of chartAttachments) {
          attachments.push(chartAttachment);
        }

        // Replace chart placeholders in HTML
        const htmlBefore = html;
        html = replaceChartPlaceholders(html, chartBlocks, replacements);

        if (html === htmlBefore) {
          console.warn('[worker] HTML unchanged after chart replacement - placeholder regex may not match');
          // Log a snippet of the HTML to debug
          const snippetStart = html.indexOf('data-block-type');
          if (snippetStart > -1) {
            console.log('[worker] Found data-block-type at index', snippetStart, ':', html.substring(snippetStart, snippetStart + 200));
          } else {
            console.log('[worker] No data-block-type attribute found in HTML');
          }
        }
      }

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

      // Check if team has branding removal (paid feature)
      const team = await db.query.teams.findFirst({
        where: eq(teams.id, teamId),
        columns: { removeBranding: true },
      });

      // Add Canary branding footer for free tier users
      if (!team?.removeBranding) {
        html = addBrandingFooter(html);
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
          cid: a.cid,
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
