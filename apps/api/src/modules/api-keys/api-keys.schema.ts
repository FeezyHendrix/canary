import { z } from 'zod';
import { API_KEY_SCOPES } from '@canary/shared';

export const createApiKeySchema = z.object({
  name: z.string().min(1).max(100),
  scopes: z.array(z.enum(API_KEY_SCOPES)).optional(),
  rateLimit: z.number().min(1).max(10000).optional(),
  expiresAt: z.coerce.date().optional(),
});

export const updateApiKeySchema = z.object({
  name: z.string().min(1).max(100).optional(),
  scopes: z.array(z.enum(API_KEY_SCOPES)).optional(),
  rateLimit: z.number().min(1).max(10000).optional(),
  isActive: z.boolean().optional(),
});

export type CreateApiKeyInput = z.infer<typeof createApiKeySchema>;
export type UpdateApiKeyInput = z.infer<typeof updateApiKeySchema>;
