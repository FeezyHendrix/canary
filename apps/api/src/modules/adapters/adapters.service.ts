import { eq, and } from 'drizzle-orm';
import { db, adapters } from '../../db';
import { encryptJson, decryptJson } from '../../lib/encryption';
import { createAdapter, getAllAdapterTypes } from '../../adapters/adapter.factory';
import { NotFoundError } from '../../lib/errors';
import type { CreateAdapterInput, UpdateAdapterInput } from './adapters.schema';
import type { AdapterType } from '@canary/shared';

export async function listAdapters(teamId: string) {
  return db.query.adapters.findMany({
    where: eq(adapters.teamId, teamId),
    orderBy: (adapters, { desc }) => [desc(adapters.createdAt)],
  });
}

export async function getAdapter(teamId: string, id: string) {
  const adapter = await db.query.adapters.findFirst({
    where: and(eq(adapters.teamId, teamId), eq(adapters.id, id)),
  });

  if (!adapter) {
    throw new NotFoundError('Adapter');
  }

  return adapter;
}

export async function getAdapterWithConfig(teamId: string, id: string) {
  const adapter = await getAdapter(teamId, id);
  const config = decryptJson(adapter.configEncrypted);

  return { ...adapter, config };
}

export async function getDefaultAdapter(teamId: string) {
  const adapter = await db.query.adapters.findFirst({
    where: and(eq(adapters.teamId, teamId), eq(adapters.isDefault, true), eq(adapters.isActive, true)),
  });

  if (!adapter) {
    const anyAdapter = await db.query.adapters.findFirst({
      where: and(eq(adapters.teamId, teamId), eq(adapters.isActive, true)),
    });
    return anyAdapter || null;
  }

  return adapter;
}

export async function createAdapterRecord(teamId: string, input: CreateAdapterInput) {
  const configEncrypted = encryptJson(input.config);

  if (input.isDefault) {
    await db
      .update(adapters)
      .set({ isDefault: false })
      .where(eq(adapters.teamId, teamId));
  }

  const [adapter] = await db
    .insert(adapters)
    .values({
      teamId,
      name: input.name,
      type: input.type as AdapterType,
      configEncrypted,
      defaultFrom: input.defaultFrom,
      isDefault: input.isDefault || false,
    })
    .returning();

  return adapter;
}

export async function updateAdapterRecord(teamId: string, id: string, input: UpdateAdapterInput) {
  await getAdapter(teamId, id);

  const updates: Record<string, unknown> = { updatedAt: new Date() };

  if (input.name !== undefined) updates.name = input.name;
  if (input.defaultFrom !== undefined) updates.defaultFrom = input.defaultFrom;
  if (input.isActive !== undefined) updates.isActive = input.isActive;
  if (input.config !== undefined) updates.configEncrypted = encryptJson(input.config);

  if (input.isDefault === true) {
    await db
      .update(adapters)
      .set({ isDefault: false })
      .where(eq(adapters.teamId, teamId));
    updates.isDefault = true;
  }

  const [updated] = await db
    .update(adapters)
    .set(updates)
    .where(eq(adapters.id, id))
    .returning();

  return updated;
}

export async function deleteAdapterRecord(teamId: string, id: string) {
  await getAdapter(teamId, id);
  await db.delete(adapters).where(eq(adapters.id, id));
}

export async function testAdapter(teamId: string, id: string) {
  const adapter = await getAdapterWithConfig(teamId, id);
  const emailAdapter = createAdapter(adapter.type as AdapterType, adapter.config);

  const result = await emailAdapter.testConnection();

  await db
    .update(adapters)
    .set({
      lastTestedAt: new Date(),
      lastTestSuccess: result.success,
    })
    .where(eq(adapters.id, id));

  return result;
}

export function getAvailableAdapterTypes() {
  return getAllAdapterTypes();
}
