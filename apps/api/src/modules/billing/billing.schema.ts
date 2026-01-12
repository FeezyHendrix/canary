import { z } from 'zod';

export const checkoutSchema = z.object({
  plan: z.enum(['pro', 'team']),
  interval: z.enum(['monthly', 'annual']),
  successUrl: z.string().url().optional(),
  cancelUrl: z.string().url().optional(),
});

export type CheckoutInput = z.infer<typeof checkoutSchema>;
