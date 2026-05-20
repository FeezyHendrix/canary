import crypto from 'node:crypto';
import { eq, and } from 'drizzle-orm';
import { db, webhooks, webhookDeliveries, emailLogs } from '../../db';
import type { WebhookEvent, WebhookPayload } from '@canary/shared';

function signPayload(payload: string, secret: string): string {
  return crypto.createHmac('sha256', secret).update(payload).digest('hex');
}

interface TriggerOptions {
  teamId: string;
  event: WebhookEvent;
  data: WebhookPayload['data'];
}

export async function triggerWebhooks(options: TriggerOptions): Promise<void> {
  const { teamId, event, data } = options;

  const activeWebhooks = await db.query.webhooks.findMany({
    where: and(eq(webhooks.teamId, teamId), eq(webhooks.isActive, true)),
  });

  const matching = activeWebhooks.filter((wh) => {
    const events = wh.events as string[] | null;
    return events && events.includes(event);
  });

  if (matching.length === 0) return;

  const payload: WebhookPayload = {
    event,
    timestamp: new Date().toISOString(),
    data,
  };

  const body = JSON.stringify(payload);

  await Promise.allSettled(
    matching.map((wh) => deliverWebhook(wh.id, wh.url, wh.secret, event, body))
  );
}

async function deliverWebhook(
  webhookId: string,
  url: string,
  secret: string,
  event: string,
  body: string
): Promise<void> {
  const signature = signPayload(body, secret);
  let responseStatus: number | null = null;
  let responseBody: string | null = null;
  let success = false;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Canary-Signature': signature,
        'X-Canary-Event': event,
      },
      body,
      signal: AbortSignal.timeout(10_000),
    });

    responseStatus = response.status;
    responseBody = await response.text().catch(() => null);
    success = response.ok;
  } catch (err) {
    responseBody = err instanceof Error ? err.message : 'Unknown error';
  }

  await db.insert(webhookDeliveries).values({
    webhookId,
    event,
    payload: JSON.parse(body),
    responseStatus,
    responseBody,
    success,
    attemptCount: 1,
  });

  await db
    .update(webhooks)
    .set({
      lastTriggeredAt: new Date(),
      ...(success
        ? { lastSuccessAt: new Date(), consecutiveFailures: 0 }
        : { consecutiveFailures: (await getConsecutiveFailures(webhookId)) + 1 }),
    })
    .where(eq(webhooks.id, webhookId));
}

async function getConsecutiveFailures(webhookId: string): Promise<number> {
  const wh = await db.query.webhooks.findFirst({
    where: eq(webhooks.id, webhookId),
    columns: { consecutiveFailures: true },
  });
  return wh?.consecutiveFailures ?? 0;
}

export async function buildEmailEventPayload(
  emailLogId: string
): Promise<{ teamId: string; data: WebhookPayload['data'] } | null> {
  const log = await db.query.emailLogs.findFirst({
    where: eq(emailLogs.id, emailLogId),
  });

  if (!log) return null;

  return {
    teamId: log.teamId,
    data: {
      emailId: log.id,
      templateId: log.templateId ?? undefined,
      to: log.toAddresses,
      subject: log.subject,
      status: log.status,
    },
  };
}
