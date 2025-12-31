import type { FastifyRequest, FastifyReply } from 'fastify';
import { getSessionUser, getUserTeams } from '../auth.service';
import { UnauthorizedError, ForbiddenError } from '../../../lib/errors';
import type { SessionUser, TeamMembership, TeamRole, Permission } from '@canary/shared';
import { hasPermission } from '@canary/shared';

declare module 'fastify' {
  interface FastifyRequest {
    user?: SessionUser;
    teams?: TeamMembership[];
    currentTeam?: TeamMembership;
  }
}

export async function requireAuth(request: FastifyRequest, reply: FastifyReply) {
  const sessionId = request.cookies.session;

  if (!sessionId) {
    throw new UnauthorizedError('No session found');
  }

  const user = await getSessionUser(sessionId);

  if (!user) {
    throw new UnauthorizedError('Invalid or expired session');
  }

  const teams = await getUserTeams(user.id);

  request.user = user;
  request.teams = teams;

  if (user.activeTeamId) {
    request.currentTeam = teams.find((t) => t.teamId === user.activeTeamId);
  }
}

export function requireTeam(request: FastifyRequest) {
  if (!request.currentTeam) {
    throw new ForbiddenError('No team selected');
  }
  return request.currentTeam;
}

export function requirePermission(permission: Permission) {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    await requireAuth(request, reply);
    const team = requireTeam(request);

    if (!hasPermission(team.role as TeamRole, permission)) {
      throw new ForbiddenError(`Missing permission: ${permission}`);
    }
  };
}
