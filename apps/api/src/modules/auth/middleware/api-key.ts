import type { FastifyRequest, FastifyReply } from 'fastify';
import { eq, and } from 'drizzle-orm';
import { db, apiKeys } from '../../../db';
import { hashApiKey } from '../../../lib/api-key';

declare module 'fastify' {
  interface FastifyRequest {
    apiKey?: {
      id: string;
      teamId: string;
      scopes: string[];
    };
  }
}

export async function validateApiKey(request: FastifyRequest) {
  const authHeader = request.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return null;
  }

  const key = authHeader.substring(7);
  const keyHash = hashApiKey(key);

  const apiKey = await db.query.apiKeys.findFirst({
    where: and(eq(apiKeys.keyHash, keyHash), eq(apiKeys.isActive, true)),
  });

  if (!apiKey) {
    return null;
  }

  request.apiKey = {
    id: apiKey.id,
    teamId: apiKey.teamId,
    scopes: apiKey.scopes || ['send'],
  };

  return apiKey;
}

export async function requireApiKey(request: FastifyRequest, reply: FastifyReply) {
  const apiKey = await validateApiKey(request);
  if (!apiKey) {
    reply.code(401).send({ error: 'Invalid API key' });
  }
}

export function requireScope(scope: string) {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    await requireApiKey(request, reply);
    if (!request.apiKey?.scopes.includes(scope)) {
      reply.code(403).send({ error: `Missing required scope: ${scope}` });
    }
  };
}
