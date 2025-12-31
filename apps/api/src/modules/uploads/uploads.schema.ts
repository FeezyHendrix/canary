import { z } from 'zod';

export const uploadResponseSchema = z.object({
  url: z.string().url(),
  key: z.string(),
  filename: z.string(),
  contentType: z.string(),
  size: z.number(),
});

export type UploadResponse = z.infer<typeof uploadResponseSchema>;

export const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/svg+xml',
];

export const MAX_FILE_SIZE_5MB = 5 * 1024 * 1024;
