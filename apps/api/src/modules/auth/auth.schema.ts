import { z } from 'zod';

export const oauthCallbackSchema = z.object({
  code: z.string(),
  state: z.string().optional(),
});

export const switchTeamSchema = z.object({
  teamId: z.string().uuid(),
});

export type OAuthCallbackInput = z.infer<typeof oauthCallbackSchema>;
export type SwitchTeamInput = z.infer<typeof switchTeamSchema>;
