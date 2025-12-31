import { eq, and } from 'drizzle-orm';
import { db, apiKeys } from '../../db';
import { generateApiKey } from '../../lib/api-key';
import { NotFoundError } from '../../lib/errors';
import type { CreateApiKeyInput, UpdateApiKeyInput } from './api-keys.schema';

export async function listApiKeys(teamId: string) {
  return db.query.apiKeys.findMany({
    where: eq(apiKeys.teamId, teamId),
    orderBy: (apiKeys, { desc }) => [desc(apiKeys.createdAt)],
  });
}

export async function getApiKey(teamId: string, id: string) {
  const apiKey = await db.query.apiKeys.findFirst({
    where: and(eq(apiKeys.teamId, teamId), eq(apiKeys.id, id)),
  });

  if (!apiKey) {
    throw new NotFoundError('API Key');
  }

  return apiKey;
}

export async function createApiKeyRecord(teamId: string, userId: string, input: CreateApiKeyInput) {
  const { key, prefix, hash } = generateApiKey();

  const [apiKey] = await db
    .insert(apiKeys)
    .values({
      teamId,
      name: input.name,
      keyPrefix: prefix,
      keyHash: hash,
      scopes: input.scopes || ['send'],
      rateLimit: input.rateLimit || 100,
      expiresAt: input.expiresAt,
      createdBy: userId,
    })
    .returning();

  return { ...apiKey, key };
}

export async function updateApiKeyRecord(teamId: string, id: string, input: UpdateApiKeyInput) {
  await getApiKey(teamId, id);

  const updates: Record<string, unknown> = {};

  if (input.name !== undefined) updates.name = input.name;
  if (input.scopes !== undefined) updates.scopes = input.scopes;
  if (input.rateLimit !== undefined) updates.rateLimit = input.rateLimit;
  if (input.isActive !== undefined) updates.isActive = input.isActive;

  const [updated] = await db
    .update(apiKeys)
    .set(updates)
    .where(eq(apiKeys.id, id))
    .returning();

  return updated;
}

export async function deleteApiKeyRecord(teamId: string, id: string) {
  await getApiKey(teamId, id);
  await db.delete(apiKeys).where(eq(apiKeys.id, id));
}

export async function regenerateApiKey(teamId: string, id: string) {
  await getApiKey(teamId, id);

  const { key, prefix, hash } = generateApiKey();

  const [updated] = await db
    .update(apiKeys)
    .set({ keyPrefix: prefix, keyHash: hash })
    .where(eq(apiKeys.id, id))
    .returning();

  return { ...updated, key };
}
