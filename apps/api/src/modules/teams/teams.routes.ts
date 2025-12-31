import type { FastifyInstance } from 'fastify';
import { requireAuth, requireTeam, requirePermission } from '../auth/middleware/session';
import {
  createTeam,
  getTeam,
  updateTeam,
  deleteTeam,
  listMembers,
  inviteMember,
  acceptInvite,
  removeMember,
  updateMemberRole,
} from './teams.service';
import {
  createTeamSchema,
  updateTeamSchema,
  inviteMemberSchema,
  updateMemberRoleSchema,
} from './teams.schema';

export async function teamsRoutes(app: FastifyInstance) {
  app.post('/', { preHandler: requireAuth }, async (request) => {
    const input = createTeamSchema.parse(request.body);
    const team = await createTeam(request.user!.id, input);
    return { success: true, data: team };
  });

  app.get('/:id', { preHandler: requireAuth }, async (request) => {
    const { id } = request.params as { id: string };
    const team = await getTeam(request.user!.id, id);
    return { success: true, data: team };
  });

  app.put('/:id', { preHandler: requirePermission('team:update') }, async (request) => {
    const { id } = request.params as { id: string };
    const input = updateTeamSchema.parse(request.body);
    const team = await updateTeam(request.user!.id, id, input);
    return { success: true, data: team };
  });

  app.delete('/:id', { preHandler: requirePermission('team:delete') }, async (request) => {
    const { id } = request.params as { id: string };
    await deleteTeam(request.user!.id, id);
    return { success: true };
  });

  app.get('/:id/members', { preHandler: requireAuth }, async (request) => {
    const { id } = request.params as { id: string };
    await getTeam(request.user!.id, id);
    const members = await listMembers(id);
    return { success: true, data: members };
  });

  app.post('/:id/invite', { preHandler: requirePermission('team:invite') }, async (request) => {
    const { id } = request.params as { id: string };
    const input = inviteMemberSchema.parse(request.body);
    const invite = await inviteMember(request.user!.id, id, input);
    return { success: true, data: invite };
  });

  app.post('/accept-invite/:token', { preHandler: requireAuth }, async (request) => {
    const { token } = request.params as { token: string };
    const team = await acceptInvite(request.user!.id, token);
    return { success: true, data: team };
  });

  app.delete('/:id/members/:userId', { preHandler: requirePermission('team:remove-member') }, async (request) => {
    const { id, userId } = request.params as { id: string; userId: string };
    await removeMember(request.user!.id, id, userId);
    return { success: true };
  });

  app.put('/:id/members/:userId', { preHandler: requirePermission('team:update-role') }, async (request) => {
    const { id, userId } = request.params as { id: string; userId: string };
    const input = updateMemberRoleSchema.parse(request.body);
    const member = await updateMemberRole(request.user!.id, id, userId, input);
    return { success: true, data: member };
  });
}
