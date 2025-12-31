import { eq, and, desc } from 'drizzle-orm';
import { nanoid } from 'nanoid';
import { db, webhooks, webhookDeliveries } from '../../db';
import { NotFoundError } from '../../lib/errors';
import type { CreateWebhookInput, UpdateWebhookInput } from './webhooks.schema';

export async function listWebhooks(teamId: string) {
  return db.query.webhooks.findMany({
    where: eq(webhooks.teamId, teamId),
    orderBy: (webhooks, { desc }) => [desc(webhooks.createdAt)],
  });
}

export async function getWebhook(teamId: string, id: string) {
  const webhook = await db.query.webhooks.findFirst({
    where: and(eq(webhooks.teamId, teamId), eq(webhooks.id, id)),
  });

  if (!webhook) {
    throw new NotFoundError('Webhook');
  }

  return webhook;
}

export async function createWebhookRecord(teamId: string, input: CreateWebhookInput) {
  const secret = nanoid(32);

  const [webhook] = await db
    .insert(webhooks)
    .values({
      teamId,
      name: input.name,
      url: input.url,
      secret,
      events: input.events,
    })
    .returning();

  return { ...webhook, secret };
}

export async function updateWebhookRecord(teamId: string, id: string, input: UpdateWebhookInput) {
  await getWebhook(teamId, id);

  const updates: Record<string, unknown> = { updatedAt: new Date() };

  if (input.name !== undefined) updates.name = input.name;
  if (input.url !== undefined) updates.url = input.url;
  if (input.events !== undefined) updates.events = input.events;
  if (input.isActive !== undefined) updates.isActive = input.isActive;

  const [updated] = await db
    .update(webhooks)
    .set(updates)
    .where(eq(webhooks.id, id))
    .returning();

  return updated;
}

export async function deleteWebhookRecord(teamId: string, id: string) {
  await getWebhook(teamId, id);
  await db.delete(webhooks).where(eq(webhooks.id, id));
}

export async function listWebhookDeliveries(teamId: string, webhookId: string) {
  await getWebhook(teamId, webhookId);

  return db.query.webhookDeliveries.findMany({
    where: eq(webhookDeliveries.webhookId, webhookId),
    orderBy: [desc(webhookDeliveries.createdAt)],
    limit: 50,
  });
}
