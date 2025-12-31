import type { FastifyRequest, FastifyReply } from 'fastify';
import { eq, and } from 'drizzle-orm';
import { db, apiKeys, teams } from '../../../db';
import { hashApiKey, isValidApiKeyFormat } from '../../../lib/api-key';
import { UnauthorizedError, RateLimitError } from '../../../lib/errors';

declare module 'fastify' {
  interface FastifyRequest {
    apiKey?: {
      id: string;
      teamId: string;
      scopes: string[];
      rateLimit: number;
    };
  }
}

export async function requireApiKey(request: FastifyRequest, reply: FastifyReply) {
  const authHeader = request.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new UnauthorizedError('Missing API key');
  }

  const key = authHeader.substring(7);

  if (!isValidApiKeyFormat(key)) {
    throw new UnauthorizedError('Invalid API key format');
  }

  const keyHash = hashApiKey(key);

  const apiKey = await db.query.apiKeys.findFirst({
    where: and(eq(apiKeys.keyHash, keyHash), eq(apiKeys.isActive, true)),
  });

  if (!apiKey) {
    throw new UnauthorizedError('Invalid API key');
  }

  if (apiKey.expiresAt && apiKey.expiresAt < new Date()) {
    throw new UnauthorizedError('API key expired');
  }

  await db
    .update(apiKeys)
    .set({ lastUsedAt: new Date() })
    .where(eq(apiKeys.id, apiKey.id));

  request.apiKey = {
    id: apiKey.id,
    teamId: apiKey.teamId,
    scopes: apiKey.scopes || ['send'],
    rateLimit: apiKey.rateLimit || 100,
  };
}

export function requireScope(scope: string) {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    await requireApiKey(request, reply);

    if (!request.apiKey?.scopes.includes(scope)) {
      throw new UnauthorizedError(`Missing required scope: ${scope}`);
    }
  };
}
