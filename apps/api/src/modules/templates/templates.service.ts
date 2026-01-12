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
 * Custom block types that aren't natively supported by @usewaypoint/email-builder.
 * These need to be transformed to Html blocks before rendering.
 */
const CUSTOM_BLOCK_TYPES = ['Chart', 'Video', 'SocialIcons', 'Quote', 'List', 'Table', 'Code', 'Badge', 'Icon'];

/**
 * Transform custom blocks to Html placeholders for email-builder compatibility.
 * The actual rendering of complex blocks (like Chart) happens at send time.
 */
function transformCustomBlocksForCompile(designJson: Record<string, unknown>): Record<string, unknown> {
  const transformed = JSON.parse(JSON.stringify(designJson)); // Deep clone

  for (const [key, block] of Object.entries(transformed)) {
    if (!block || typeof block !== 'object') continue;

    const blockType = (block as Record<string, unknown>).type as string;
    if (!CUSTOM_BLOCK_TYPES.includes(blockType)) continue;

    const data = (block as Record<string, unknown>).data as Record<string, unknown>;
    const props = (data?.props || {}) as Record<string, unknown>;
    const style = (data?.style || {}) as Record<string, unknown>;

    let htmlContent = '';

    switch (blockType) {
      case 'Chart':
        htmlContent = `<div style="width:${props?.width || 500}px;height:${props?.height || 300}px;background:#f3f4f6;display:flex;align-items:center;justify-content:center;border-radius:8px;color:#6b7280;font-family:sans-serif;" data-block-type="Chart" data-block-id="${key}"><span style="font-size:14px;">📊 Chart: ${props?.title || (props?.dataSource === 'dynamic' ? `{{${props?.dynamicVariable || 'chartData'}}}` : 'Static Chart')}</span></div>`;
        break;
      case 'Video':
        htmlContent = `<div style="text-align:center;padding:16px;"><a href="${props?.url || '#'}" style="display:inline-block;padding:12px 24px;background:#3b82f6;color:white;text-decoration:none;border-radius:6px;">▶ Watch Video</a></div>`;
        break;
      case 'SocialIcons': {
        const platforms = (props?.platforms || []) as Array<{ platform: string; url: string }>;
        const iconsHtml = platforms.map(p =>
          `<a href="${p.url}" style="margin:0 8px;color:#6b7280;text-decoration:none;">${p.platform}</a>`
        ).join('');
        htmlContent = `<div style="text-align:center;padding:16px;">${iconsHtml || 'Social Icons'}</div>`;
        break;
      }
      case 'Quote':
        htmlContent = `<blockquote style="border-left:4px solid #e5e7eb;padding-left:16px;margin:16px 0;font-style:italic;color:#4b5563;">${props?.text || 'Quote'}<footer style="margin-top:8px;font-size:14px;color:#6b7280;">— ${props?.author || 'Author'}</footer></blockquote>`;
        break;
      case 'List': {
        const items = (props?.items || ['Item 1', 'Item 2']) as string[];
        const listType = props?.listType === 'ordered' ? 'ol' : 'ul';
        const listItems = items.map(item => `<li style="margin:4px 0;">${item}</li>`).join('');
        htmlContent = `<${listType} style="padding-left:24px;margin:16px 0;">${listItems}</${listType}>`;
        break;
      }
      case 'Table': {
        const rows = (props?.rows || [['Cell 1', 'Cell 2']]) as string[][];
        const tableRows = rows.map(row =>
          `<tr>${row.map(cell => `<td style="border:1px solid #e5e7eb;padding:8px;">${cell}</td>`).join('')}</tr>`
        ).join('');
        htmlContent = `<table style="width:100%;border-collapse:collapse;margin:16px 0;"><tbody>${tableRows}</tbody></table>`;
        break;
      }
      case 'Code':
        htmlContent = `<pre style="background:#1f2937;color:#f3f4f6;padding:16px;border-radius:8px;overflow-x:auto;font-family:monospace;font-size:14px;"><code>${props?.code || '// Code block'}</code></pre>`;
        break;
      case 'Badge':
        htmlContent = `<span style="display:inline-block;padding:4px 12px;background:${props?.backgroundColor || '#3b82f6'};color:${props?.textColor || 'white'};border-radius:9999px;font-size:14px;font-weight:500;">${props?.text || 'Badge'}</span>`;
        break;
      case 'Icon':
        htmlContent = `<span style="font-size:${props?.size || 24}px;color:${props?.color || '#6b7280'};">${props?.name || '⭐'}</span>`;
        break;
      default:
        htmlContent = `<div style="padding:16px;background:#f3f4f6;border-radius:8px;color:#6b7280;">${blockType} Block</div>`;
    }

    transformed[key] = {
      type: 'Html',
      data: {
        style: style,
        props: {
          contents: htmlContent,
        },
      },
    };
  }

  return transformed;
}

function compileDesignToHtml(designJson: Record<string, unknown>): string {
  try {
    // Transform custom blocks to Html placeholders before rendering
    const transformedDesign = transformCustomBlocksForCompile(designJson);
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
