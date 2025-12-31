import { z } from 'zod';

export const createTemplateSchema = z.object({
  name: z.string().min(1).max(100),
  slug: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional(),
  subject: z.string().min(1).max(200),
  designJson: z.record(z.unknown()),
  generatePdf: z.boolean().optional(),
  pdfFilename: z.string().max(100).optional(),
});

export const updateTemplateSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  slug: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional(),
  subject: z.string().min(1).max(200).optional(),
  designJson: z.record(z.unknown()).optional(),
  isActive: z.boolean().optional(),
  generatePdf: z.boolean().optional(),
  pdfFilename: z.string().max(100).optional(),
});

export const templatePreviewSchema = z.object({
  variables: z.record(z.unknown()),
});

export const testSendSchema = z.object({
  to: z.string().email(),
  variables: z.record(z.unknown()).optional(),
});

export const listTemplatesSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  pageSize: z.coerce.number().min(1).max(100).default(20),
  search: z.string().optional(),
  isActive: z.coerce.boolean().optional(),
});

export type CreateTemplateInput = z.infer<typeof createTemplateSchema>;
export type UpdateTemplateInput = z.infer<typeof updateTemplateSchema>;
export type TemplatePreviewInput = z.infer<typeof templatePreviewSchema>;
export type TestSendInput = z.infer<typeof testSendSchema>;
export type ListTemplatesInput = z.infer<typeof listTemplatesSchema>;
