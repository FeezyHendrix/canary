import { z } from 'zod';
import { TEAM_ROLE_LIST } from '@canary/shared';

export const createTeamSchema = z.object({
  name: z.string().min(1).max(100),
});

export const updateTeamSchema = z.object({
  name: z.string().min(1).max(100).optional(),
});

export const inviteMemberSchema = z.object({
  email: z.string().email(),
  role: z.enum(TEAM_ROLE_LIST as [string, ...string[]]).default('member'),
});

export const updateMemberRoleSchema = z.object({
  role: z.enum(['admin', 'member']),
});

export type CreateTeamInput = z.infer<typeof createTeamSchema>;
export type UpdateTeamInput = z.infer<typeof updateTeamSchema>;
export type InviteMemberInput = z.infer<typeof inviteMemberSchema>;
export type UpdateMemberRoleInput = z.infer<typeof updateMemberRoleSchema>;
