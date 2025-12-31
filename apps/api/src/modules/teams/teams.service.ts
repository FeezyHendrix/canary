import { eq, and } from 'drizzle-orm';
import { nanoid } from 'nanoid';
import { db, teams, teamMembers, teamInvites, users } from '../../db';
import { generateTeamSlug } from '../../lib/slug';
import { NotFoundError, ForbiddenError, ConflictError } from '../../lib/errors';
import type { CreateTeamInput, UpdateTeamInput, InviteMemberInput, UpdateMemberRoleInput } from './teams.schema';
import type { TeamRole } from '@canary/shared';

export async function createTeam(userId: string, input: CreateTeamInput) {
  const slug = generateTeamSlug(input.name);

  const [team] = await db
    .insert(teams)
    .values({
      name: input.name,
      slug,
    })
    .returning();

  await db.insert(teamMembers).values({
    teamId: team.id,
    userId,
    role: 'owner',
    joinedAt: new Date(),
  });

  return team;
}

export async function getTeam(userId: string, teamId: string) {
  const membership = await db.query.teamMembers.findFirst({
    where: and(eq(teamMembers.userId, userId), eq(teamMembers.teamId, teamId)),
    with: { team: true },
  });

  if (!membership) {
    throw new NotFoundError('Team');
  }

  return membership.team;
}

export async function updateTeam(userId: string, teamId: string, input: UpdateTeamInput) {
  const membership = await getMembership(userId, teamId);

  if (membership.role !== 'owner' && membership.role !== 'admin') {
    throw new ForbiddenError('Only owners and admins can update team');
  }

  const [updated] = await db
    .update(teams)
    .set({ ...input, updatedAt: new Date() })
    .where(eq(teams.id, teamId))
    .returning();

  return updated;
}

export async function deleteTeam(userId: string, teamId: string) {
  const membership = await getMembership(userId, teamId);

  if (membership.role !== 'owner') {
    throw new ForbiddenError('Only owners can delete team');
  }

  await db.delete(teams).where(eq(teams.id, teamId));
}

export async function listMembers(teamId: string) {
  const members = await db.query.teamMembers.findMany({
    where: eq(teamMembers.teamId, teamId),
    with: { user: true },
  });

  return members.map((m) => ({
    id: m.id,
    userId: m.userId,
    role: m.role,
    joinedAt: m.joinedAt,
    user: m.user
      ? {
          id: m.user.id,
          email: m.user.email,
          name: m.user.name,
          avatarUrl: m.user.avatarUrl,
        }
      : null,
  }));
}

export async function inviteMember(userId: string, teamId: string, input: InviteMemberInput) {
  const membership = await getMembership(userId, teamId);

  if (membership.role !== 'owner' && membership.role !== 'admin') {
    throw new ForbiddenError('Only owners and admins can invite members');
  }

  if (input.role === 'owner') {
    throw new ForbiddenError('Cannot invite as owner');
  }

  const existingUser = await db.query.users.findFirst({
    where: eq(users.email, input.email),
  });

  if (existingUser) {
    const existingMember = await db.query.teamMembers.findFirst({
      where: and(eq(teamMembers.teamId, teamId), eq(teamMembers.userId, existingUser.id)),
    });

    if (existingMember) {
      throw new ConflictError('User is already a member of this team');
    }
  }

  const existingInvite = await db.query.teamInvites.findFirst({
    where: and(eq(teamInvites.teamId, teamId), eq(teamInvites.email, input.email)),
  });

  if (existingInvite) {
    throw new ConflictError('Invite already sent to this email');
  }

  const token = nanoid(32);
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  const [invite] = await db
    .insert(teamInvites)
    .values({
      teamId,
      email: input.email,
      role: input.role as TeamRole,
      token,
      expiresAt,
    })
    .returning();

  return invite;
}

export async function acceptInvite(userId: string, token: string) {
  const invite = await db.query.teamInvites.findFirst({
    where: eq(teamInvites.token, token),
  });

  if (!invite) {
    throw new NotFoundError('Invite');
  }

  if (invite.expiresAt < new Date()) {
    await db.delete(teamInvites).where(eq(teamInvites.id, invite.id));
    throw new ForbiddenError('Invite has expired');
  }

  const user = await db.query.users.findFirst({
    where: eq(users.id, userId),
  });

  if (!user || user.email !== invite.email) {
    throw new ForbiddenError('Invite is for a different email address');
  }

  await db.insert(teamMembers).values({
    teamId: invite.teamId,
    userId,
    role: invite.role,
    joinedAt: new Date(),
  });

  await db.delete(teamInvites).where(eq(teamInvites.id, invite.id));

  return db.query.teams.findFirst({
    where: eq(teams.id, invite.teamId),
  });
}

export async function removeMember(userId: string, teamId: string, memberUserId: string) {
  const membership = await getMembership(userId, teamId);

  if (membership.role !== 'owner' && membership.role !== 'admin') {
    throw new ForbiddenError('Only owners and admins can remove members');
  }

  if (userId === memberUserId) {
    throw new ForbiddenError('Cannot remove yourself');
  }

  const targetMembership = await db.query.teamMembers.findFirst({
    where: and(eq(teamMembers.teamId, teamId), eq(teamMembers.userId, memberUserId)),
  });

  if (!targetMembership) {
    throw new NotFoundError('Member');
  }

  if (targetMembership.role === 'owner') {
    throw new ForbiddenError('Cannot remove owner');
  }

  await db
    .delete(teamMembers)
    .where(and(eq(teamMembers.teamId, teamId), eq(teamMembers.userId, memberUserId)));
}

export async function updateMemberRole(
  userId: string,
  teamId: string,
  memberUserId: string,
  input: UpdateMemberRoleInput
) {
  const membership = await getMembership(userId, teamId);

  if (membership.role !== 'owner') {
    throw new ForbiddenError('Only owners can change roles');
  }

  if (userId === memberUserId) {
    throw new ForbiddenError('Cannot change your own role');
  }

  const [updated] = await db
    .update(teamMembers)
    .set({ role: input.role as TeamRole })
    .where(and(eq(teamMembers.teamId, teamId), eq(teamMembers.userId, memberUserId)))
    .returning();

  return updated;
}

async function getMembership(userId: string, teamId: string) {
  const membership = await db.query.teamMembers.findFirst({
    where: and(eq(teamMembers.userId, userId), eq(teamMembers.teamId, teamId)),
  });

  if (!membership) {
    throw new NotFoundError('Team');
  }

  return membership;
}
