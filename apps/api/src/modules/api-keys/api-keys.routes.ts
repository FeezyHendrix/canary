import type { FastifyInstance } from 'fastify';
import { requireAuth, requireTeam, requirePermission } from '../auth/middleware/session';
import {
  listApiKeys,
  getApiKey,
  createApiKeyRecord,
  updateApiKeyRecord,
  deleteApiKeyRecord,
  regenerateApiKey,
} from './api-keys.service';
import { createApiKeySchema, updateApiKeySchema } from './api-keys.schema';

export async function apiKeysRoutes(app: FastifyInstance) {
  app.get('/', { preHandler: requirePermission('api-keys:view') }, async (request) => {
    const team = requireTeam(request);
    const keys = await listApiKeys(team.teamId);
    return { success: true, data: keys };
  });

  app.post('/', { preHandler: requirePermission('api-keys:create') }, async (request) => {
    const team = requireTeam(request);
    const input = createApiKeySchema.parse(request.body);
    const apiKey = await createApiKeyRecord(team.teamId, request.user!.id, input);
    return { success: true, data: apiKey };
  });

  app.get('/:id', { preHandler: requirePermission('api-keys:view') }, async (request) => {
    const team = requireTeam(request);
    const { id } = request.params as { id: string };
    const apiKey = await getApiKey(team.teamId, id);
    return { success: true, data: apiKey };
  });

  app.put('/:id', { preHandler: requirePermission('api-keys:create') }, async (request) => {
    const team = requireTeam(request);
    const { id } = request.params as { id: string };
    const input = updateApiKeySchema.parse(request.body);
    const apiKey = await updateApiKeyRecord(team.teamId, id, input);
    return { success: true, data: apiKey };
  });

  app.delete('/:id', { preHandler: requirePermission('api-keys:delete') }, async (request) => {
    const team = requireTeam(request);
    const { id } = request.params as { id: string };
    await deleteApiKeyRecord(team.teamId, id);
    return { success: true };
  });

  app.post('/:id/regenerate', { preHandler: requirePermission('api-keys:create') }, async (request) => {
    const team = requireTeam(request);
    const { id } = request.params as { id: string };
    const apiKey = await regenerateApiKey(team.teamId, id);
    return { success: true, data: apiKey };
  });
}
