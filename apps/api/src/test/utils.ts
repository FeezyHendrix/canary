import { FastifyInstance } from 'fastify';
import { buildApp } from '../app';
import { db } from '../db';
import { users, teams, teamMembers, sessions, apiKeys } from '../db/schema';
import { nanoid } from 'nanoid';
import { hashPassword } from '../modules/auth/password.service';
import type { SessionUser } from '@canary/shared';

let appInstance: FastifyInstance | null = null;

export async function getTestApp(): Promise<FastifyInstance> {
  if (!appInstance) {
    appInstance = await buildApp();
    await appInstance.ready();
  }
  return appInstance;
}

export async function closeTestApp(): Promise<void> {
  if (appInstance) {
    await appInstance.close();
    appInstance = null;
  }
}

export interface TestUser {
  user: SessionUser;
  teamId: string;
  sessionId: string;
  plainPassword?: string;
}

export async function createTestUser(
  overrides: Partial<{ email: string; name: string; password: string }> = {}
): Promise<TestUser> {
  const email = overrides.email || `test-${nanoid(8)}@example.com`;
  const name = overrides.name || 'Test User';
  const plainPassword = overrides.password || 'TestPassword123!';
  const passwordHash = await hashPassword(plainPassword);

  const [user] = await db
    .insert(users)
    .values({
      email,
      name,
      passwordHash,
      emailVerified: true,
    })
    .returning();

  const [team] = await db
    .insert(teams)
    .values({
      name: `${name}'s Team`,
      slug: `${name.toLowerCase().replace(/\s+/g, '-')}-${nanoid(4)}`,
    })
    .returning();

  await db.insert(teamMembers).values({
    teamId: team.id,
    userId: user.id,
    role: 'owner',
    joinedAt: new Date(),
  });

  const sessionId = nanoid(32);
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  await db.insert(sessions).values({
    id: sessionId,
    userId: user.id,
    activeTeamId: team.id,
    expiresAt,
  });

  return {
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      avatarUrl: user.avatarUrl,
      activeTeamId: team.id,
      emailVerified: user.emailVerified ?? false,
      hasPassword: !!user.passwordHash,
    },
    teamId: team.id,
    sessionId,
    plainPassword,
  };
}

export async function createTestApiKey(
  teamId: string,
  overrides: Partial<{ name: string; scopes: string[] }> = {}
) {
  const name = overrides.name || 'Test API Key';
  const keyPrefix = 'cnry_test';
  const apiKey = `${keyPrefix}_${nanoid(32)}`;
  const keyHash = apiKey;

  const [apiKeyRecord] = await db
    .insert(apiKeys)
    .values({
      teamId,
      name,
      keyPrefix,
      keyHash,
      scopes: overrides.scopes || ['send'],
      isActive: true,
    })
    .returning();

  return {
    apiKey,
    record: apiKeyRecord,
  };
}

export async function createTestTeam(userId: string, name: string = 'Test Team') {
  const slug = name.toLowerCase().replace(/\s+/g, '-');
  const [team] = await db
    .insert(teams)
    .values({
      name,
      slug: `${slug}-${nanoid(4)}`,
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
