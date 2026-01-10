import { eq, and } from 'drizzle-orm';
import { nanoid } from 'nanoid';
import { db, users, teams, teamMembers, sessions } from '../../db';
import { generateTeamSlug } from '../../lib/slug';
import type { SessionUser, TeamMembership } from '@canary/shared';
import { hashPassword, verifyPassword, createVerificationToken } from './password.service';
import { ConflictError, UnauthorizedError, NotFoundError } from '../../lib/errors';

interface OAuthProfile {
  provider: 'google' | 'github';
  id: string;
  email: string;
  name: string | null;
  avatarUrl: string | null;
}

export async function findOrCreateUser(profile: OAuthProfile) {
  const providerIdField = profile.provider === 'google' ? 'googleId' : 'githubId';

  let user = await db.query.users.findFirst({
    where: eq(users[providerIdField], profile.id),
  });

  if (!user) {
    user = await db.query.users.findFirst({
      where: eq(users.email, profile.email),
    });

    if (user) {
      const [updated] = await db
        .update(users)
        .set({ [providerIdField]: profile.id, avatarUrl: profile.avatarUrl || user.avatarUrl })
        .where(eq(users.id, user.id))
        .returning();
      user = updated;
    }
  }

  if (!user) {
    const [newUser] = await db
      .insert(users)
      .values({
        email: profile.email,
        name: profile.name,
        avatarUrl: profile.avatarUrl,
        [providerIdField]: profile.id,
      })
      .returning();

    user = newUser;

    const teamName = profile.name ? `${profile.name}'s Team` : 'My Team';
    const [team] = await db
      .insert(teams)
      .values({
        name: teamName,
        slug: generateTeamSlug(teamName),
      })
      .returning();

    await db.insert(teamMembers).values({
      teamId: team.id,
      userId: user.id,
      role: 'owner',
      joinedAt: new Date(),
    });
  }

  return user;
}

export async function createSession(userId: string, teamId?: string): Promise<string> {
  const sessionId = nanoid(32);
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

  let activeTeamId = teamId;
  if (!activeTeamId) {
    const membership = await db.query.teamMembers.findFirst({
      where: eq(teamMembers.userId, userId),
    });
    activeTeamId = membership?.teamId;
  }

  await db.insert(sessions).values({
    id: sessionId,
    userId,
    activeTeamId,
    expiresAt,
  });

  return sessionId;
}

export async function getSession(sessionId: string) {
  const session = await db.query.sessions.findFirst({
    where: and(eq(sessions.id, sessionId)),
  });

  if (!session || session.expiresAt < new Date()) {
    if (session) {
      await db.delete(sessions).where(eq(sessions.id, sessionId));
    }
    return null;
  }

  return session;
}

export async function deleteSession(sessionId: string) {
  await db.delete(sessions).where(eq(sessions.id, sessionId));
}

export async function getSessionUser(sessionId: string): Promise<SessionUser | null> {
  const session = await getSession(sessionId);
  if (!session) return null;

  const user = await db.query.users.findFirst({
    where: eq(users.id, session.userId),
  });

  if (!user) return null;

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    avatarUrl: user.avatarUrl,
    activeTeamId: session.activeTeamId,
    emailVerified: user.emailVerified ?? false,
    hasPassword: !!user.passwordHash,
  };
}

export async function getUserTeams(userId: string): Promise<TeamMembership[]> {
  const memberships = await db.query.teamMembers.findMany({
    where: eq(teamMembers.userId, userId),
    with: {
      team: true,
    },
  });

  return memberships.map((m) => ({
    teamId: m.team.id,
    teamName: m.team.name,
    teamSlug: m.team.slug,
    role: m.role,
  }));
}

export async function switchActiveTeam(sessionId: string, teamId: string) {
  const session = await getSession(sessionId);
  if (!session) return false;

  const membership = await db.query.teamMembers.findFirst({
    where: and(eq(teamMembers.userId, session.userId), eq(teamMembers.teamId, teamId)),
  });

  if (!membership) return false;

  await db.update(sessions).set({ activeTeamId: teamId }).where(eq(sessions.id, sessionId));

  return true;
}

// Password authentication functions

interface RegisterInput {
  email: string;
  password: string;
  name?: string;
}

export async function registerWithPassword(input: RegisterInput) {
  const existingUser = await db.query.users.findFirst({
    where: eq(users.email, input.email),
  });

  if (existingUser) {
    throw new ConflictError('An account with this email already exists');
  }

  const passwordHash = await hashPassword(input.password);

  const [newUser] = await db
    .insert(users)
    .values({
      email: input.email,
      name: input.name || null,
      passwordHash,
      emailVerified: false,
    })
    .returning();

  const teamName = input.name ? `${input.name}'s Team` : 'My Team';
  const [team] = await db
    .insert(teams)
    .values({
      name: teamName,
      slug: generateTeamSlug(teamName),
    })
    .returning();

  await db.insert(teamMembers).values({
    teamId: team.id,
    userId: newUser.id,
    role: 'owner',
    joinedAt: new Date(),
  });

  const verificationToken = await createVerificationToken(newUser.id);

  return { user: newUser, verificationToken };
}

export async function loginWithPassword(email: string, password: string) {
  const user = await db.query.users.findFirst({
    where: eq(users.email, email),
  });

  if (!user || !user.passwordHash) {
    throw new UnauthorizedError('Invalid email or password');
  }

  const validPassword = await verifyPassword(user.passwordHash, password);

  if (!validPassword) {
    throw new UnauthorizedError('Invalid email or password');
  }

  if (!user.emailVerified) {
    throw new UnauthorizedError('Please verify your email before logging in');
  }

  return user;
}

export async function setPasswordForOAuthUser(userId: string, password: string) {
  const user = await db.query.users.findFirst({
    where: eq(users.id, userId),
  });

  if (!user) {
    throw new NotFoundError('User');
  }

  if (user.passwordHash) {
    throw new ConflictError('User already has a password set');
  }

  const passwordHash = await hashPassword(password);

  await db
    .update(users)
    .set({
      passwordHash,
      updatedAt: new Date(),
    })
    .where(eq(users.id, userId));
}
