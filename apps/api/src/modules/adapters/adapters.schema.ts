import { z } from 'zod';
import { ADAPTER_TYPE_LIST } from '@canary/shared';

export const createAdapterSchema = z.object({
  name: z.string().min(1).max(100),
  type: z.enum(ADAPTER_TYPE_LIST as [string, ...string[]]),
  config: z.record(z.unknown()),
  defaultFrom: z.string().email().optional(),
  isDefault: z.boolean().optional(),
});

export const updateAdapterSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  config: z.record(z.unknown()).optional(),
  defaultFrom: z.string().email().optional(),
  isDefault: z.boolean().optional(),
  isActive: z.boolean().optional(),
});

export type CreateAdapterInput = z.infer<typeof createAdapterSchema>;
export type UpdateAdapterInput = z.infer<typeof updateAdapterSchema>;
