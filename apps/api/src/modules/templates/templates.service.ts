import { eq, and, ilike, desc, count } from 'drizzle-orm';
import { renderToStaticMarkup, TReaderDocument } from '@usewaypoint/email-builder';
import { db, templates, templateVersions, emailLogs } from '../../db';
import { generateTemplateSlug } from '../../lib/slug';
import { extractVariables, renderTemplate } from '../../lib/handlebars';
import { NotFoundError, ConflictError, AppError } from '../../lib/errors';
import { getDefaultAdapter } from '../adapters/adapters.service';
import { emailQueue } from '../../jobs/queues';
import { ERROR_CODES } from '@canary/shared';
import type {
  CreateTemplateInput,
  UpdateTemplateInput,
  ListTemplatesInput,
  TestSendInput,
} from './templates.schema';

export async function listTemplates(teamId: string, params: ListTemplatesInput) {
  const { page, pageSize, search, isActive } = params;
  const offset = (page - 1) * pageSize;

  const conditions = [eq(templates.teamId, teamId)];

  if (isActive !== undefined) {
    conditions.push(eq(templates.isActive, isActive));
  }

  if (search) {
    conditions.push(ilike(templates.name, `%${search}%`));
  }

  const [items, [{ total }]] = await Promise.all([
    db.query.templates.findMany({
      where: and(...conditions),
      orderBy: [desc(templates.updatedAt)],
      limit: pageSize,
      offset,
    }),
    db
      .select({ total: count() })
      .from(templates)
      .where(and(...conditions)),
  ]);

  return {
    items: items.map((t) => ({
      id: t.id,
      name: t.name,
      slug: t.slug,
      description: t.description,
      subject: t.subject,
      thumbnailUrl: t.thumbnailUrl,
      isActive: t.isActive,
      generatePdf: t.generatePdf,
      updatedAt: t.updatedAt,
      variables: t.variables || [],
    })),
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  };
}

export async function getTemplate(teamId: string, id: string) {
  const template = await db.query.templates.findFirst({
    where: and(eq(templates.teamId, teamId), eq(templates.id, id)),
  });

  if (!template) {
    throw new NotFoundError('Template');
  }

  return template;
}

export async function getTemplateBySlug(teamId: string, slug: string) {
  const template = await db.query.templates.findFirst({
    where: and(eq(templates.teamId, teamId), eq(templates.slug, slug)),
  });

  if (!template) {
    throw new NotFoundError('Template');
  }

  return template;
}

export async function createTemplate(teamId: string, userId: string, input: CreateTemplateInput) {
  const slug = input.slug || generateTemplateSlug(input.name);

  const existing = await db.query.templates.findFirst({
    where: and(eq(templates.teamId, teamId), eq(templates.slug, slug)),
  });

  if (existing) {
    throw new ConflictError('Template with this slug already exists');
  }

  const variables = extractVariablesFromDesign(input.designJson);
  const compiledHtml = compileDesignToHtml(input.designJson);

  const [template] = await db
    .insert(templates)
    .values({
      teamId,
      name: input.name,
      slug,
      description: input.description,
      subject: input.subject,
      designJson: input.designJson,
      compiledHtml,
      variables,
      generatePdf: input.generatePdf ?? false,
      pdfFilename: input.pdfFilename,
      createdBy: userId,
    })
    .returning();

  const [version] = await db
    .insert(templateVersions)
    .values({
      templateId: template.id,
      version: 1,
      subject: input.subject,
      designJson: input.designJson,
      compiledHtml,
      variables,
      createdBy: userId,
    })
    .returning();

  await db
    .update(templates)
    .set({ currentVersionId: version.id })
    .where(eq(templates.id, template.id));

  return { ...template, currentVersionId: version.id };
}

export async function updateTemplate(
  teamId: string,
  id: string,
  userId: string,
  input: UpdateTemplateInput
) {
  const template = await getTemplate(teamId, id);

  if (input.slug && input.slug !== template.slug) {
    const existing = await db.query.templates.findFirst({
      where: and(eq(templates.teamId, teamId), eq(templates.slug, input.slug)),
    });

    if (existing) {
      throw new ConflictError('Template with this slug already exists');
    }
  }

  const updates: Record<string, unknown> = { updatedAt: new Date() };

  if (input.name !== undefined) updates.name = input.name;
  if (input.slug !== undefined) updates.slug = input.slug;
  if (input.description !== undefined) updates.description = input.description;
  if (input.subject !== undefined) updates.subject = input.subject;
  if (input.isActive !== undefined) updates.isActive = input.isActive;
  if (input.generatePdf !== undefined) updates.generatePdf = input.generatePdf;
  if (input.pdfFilename !== undefined) updates.pdfFilename = input.pdfFilename;

  if (input.designJson !== undefined) {
    updates.designJson = input.designJson;
    updates.variables = extractVariablesFromDesign(input.designJson);
    updates.compiledHtml = compileDesignToHtml(input.designJson);
  }

  const [updated] = await db.update(templates).set(updates).where(eq(templates.id, id)).returning();

  return updated;
}

export async function deleteTemplate(teamId: string, id: string) {
  const template = await getTemplate(teamId, id);
  await db.delete(templates).where(eq(templates.id, id));
  return template;
}

export async function duplicateTemplate(teamId: string, id: string, userId: string) {
  const template = await getTemplate(teamId, id);

  const newName = `${template.name} (Copy)`;
  const newSlug = generateTemplateSlug(newName);

  const [duplicate] = await db
    .insert(templates)
    .values({
      teamId,
      name: newName,
      slug: newSlug,
      description: template.description,
      subject: template.subject,
      designJson: template.designJson,
      compiledHtml: template.compiledHtml,
      variables: template.variables,
      createdBy: userId,
    })
    .returning();

  return duplicate;
}

export async function createVersion(
  teamId: string,
  templateId: string,
  userId: string,
  name?: string
) {
  const template = await getTemplate(teamId, templateId);

  const lastVersion = await db.query.templateVersions.findFirst({
    where: eq(templateVersions.templateId, templateId),
    orderBy: [desc(templateVersions.version)],
  });

  const nextVersion = (lastVersion?.version || 0) + 1;

  const [version] = await db
    .insert(templateVersions)
    .values({
      templateId,
      version: nextVersion,
      name,
      subject: template.subject,
      designJson: template.designJson,
      compiledHtml: template.compiledHtml,
      variables: template.variables,
      createdBy: userId,
    })
    .returning();

  await db
    .update(templates)
    .set({ currentVersionId: version.id })
    .where(eq(templates.id, templateId));

  return version;
}

export async function listVersions(teamId: string, templateId: string) {
  await getTemplate(teamId, templateId);

  return db.query.templateVersions.findMany({
    where: eq(templateVersions.templateId, templateId),
    orderBy: [desc(templateVersions.version)],
  });
}

export async function restoreVersion(
  teamId: string,
  templateId: string,
  versionId: string,
  userId: string
) {
  await getTemplate(teamId, templateId);

  const version = await db.query.templateVersions.findFirst({
    where: and(eq(templateVersions.templateId, templateId), eq(templateVersions.id, versionId)),
  });

  if (!version) {
    throw new NotFoundError('Version');
  }

  const [updated] = await db
    .update(templates)
    .set({
      subject: version.subject,
      designJson: version.designJson,
      compiledHtml: version.compiledHtml,
      variables: version.variables,
      currentVersionId: versionId,
      updatedAt: new Date(),
    })
    .where(eq(templates.id, templateId))
    .returning();

  return updated;
}

export async function previewTemplate(
  teamId: string,
  id: string,
  variables: Record<string, unknown>
) {
  const template = await getTemplate(teamId, id);

  const subject = renderTemplate(template.subject, variables);
  const html = renderTemplate(template.compiledHtml || '', variables);

  return { subject, html, text: stripHtml(html) };
}

function extractVariablesFromDesign(designJson: Record<string, unknown>): string[] {
  const jsonStr = JSON.stringify(designJson);
  return extractVariables(jsonStr);
}

/**
 * Transform Chart blocks to placeholder Image blocks for email-builder compatibility.
 * The actual chart rendering happens at send time via the email processor.
 */
function transformChartBlocksForCompile(designJson: Record<string, unknown>): Record<string, unknown> {
  const transformed = JSON.parse(JSON.stringify(designJson)); // Deep clone

  for (const [key, block] of Object.entries(transformed)) {
    if (block && typeof block === 'object' && (block as Record<string, unknown>).type === 'Chart') {
      const chartBlock = block as Record<string, unknown>;
      const data = chartBlock.data as Record<string, unknown>;
      const props = data?.props as Record<string, unknown>;

      // Convert Chart to Html block with a placeholder
      transformed[key] = {
        type: 'Html',
        data: {
          style: data?.style || {},
          props: {
            contents: `<div style="width:${props?.width || 500}px;height:${props?.height || 300}px;background:#f3f4f6;display:flex;align-items:center;justify-content:center;border-radius:8px;color:#6b7280;font-family:sans-serif;" data-block-type="Chart" data-block-id="${key}"><span style="font-size:14px;">📊 Chart: ${props?.title || (props?.dataSource === 'dynamic' ? `{{${props?.dynamicVariable || 'chartData'}}}` : 'Static Chart')}</span></div>`,
          },
        },
      };
    }
  }

  return transformed;
}

function compileDesignToHtml(designJson: Record<string, unknown>): string {
  try {
    // Transform Chart blocks to Html placeholders before rendering
    const transformedDesign = transformChartBlocksForCompile(designJson);
    return renderToStaticMarkup(transformedDesign as TReaderDocument, { rootBlockId: 'root' });
  } catch (error) {
    console.error('[templates] Failed to compile design to HTML:', error);
    return '';
  }
}

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export async function testSendEmail(teamId: string, templateId: string, input: TestSendInput) {
  const template = await getTemplate(teamId, templateId);

  const adapter = await getDefaultAdapter(teamId);
  if (!adapter) {
    throw new AppError(
      ERROR_CODES.ADAPTER_ERROR,
      'No email adapter configured. Please add an adapter first.',
      400
    );
  }

  const fromAddress = adapter.defaultFrom;
  if (!fromAddress) {
    throw new AppError(ERROR_CODES.VALIDATION_ERROR, 'No from address configured on adapter', 400);
  }

  const variables = input.variables || {};
  const subject = `[TEST] ${renderTemplate(template.subject, variables)}`;

  const [log] = await db
    .insert(emailLogs)
    .values({
      teamId,
      templateId: template.id,
      templateVersionId: template.currentVersionId,
      adapterId: adapter.id,
      toAddresses: [input.to],
      fromAddress,
      subject,
      variables,
      status: 'queued',
    })
    .returning();

  const job = await emailQueue.add('send', {
    emailLogId: log.id,
    teamId,
    templateId: template.id,
    to: [input.to],
    from: fromAddress,
    subject,
    variables,
  });

  await db.update(emailLogs).set({ jobId: job.id }).where(eq(emailLogs.id, log.id));

  return {
    id: log.id,
    jobId: job.id,
    status: 'queued' as const,
    to: input.to,
  };
}
