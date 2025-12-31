import { z } from 'zod';

export const pdfAttachmentSchema = z.object({
  templateId: z.string().min(1),
  filename: z.string().min(1),
  variables: z.record(z.unknown()).optional(),
});

export const sendEmailSchema = z.object({
  templateId: z.string().min(1),
  to: z.union([z.string().email(), z.array(z.string().email()).min(1)]),
  variables: z.record(z.unknown()).optional(),
  from: z.string().email().optional(),
  subject: z.string().optional(),
  replyTo: z.string().email().optional(),
  attachments: z
    .array(
      z.object({
        filename: z.string(),
        content: z.string(),
        contentType: z.string().optional(),
      })
    )
    .optional(),
  pdfAttachments: z.array(pdfAttachmentSchema).optional(),
  tags: z.array(z.string()).optional(),
  metadata: z.record(z.string()).optional(),
});

export type PdfAttachmentInput = z.infer<typeof pdfAttachmentSchema>;
export type SendEmailInput = z.infer<typeof sendEmailSchema>;
