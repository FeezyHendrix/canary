import type { FastifyInstance } from 'fastify';
import { requireAuth, requireTeam, requirePermission } from '../auth/middleware/session';
import {
  listWebhooks,
  getWebhook,
  createWebhookRecord,
  updateWebhookRecord,
  deleteWebhookRecord,
  listWebhookDeliveries,
} from './webhooks.service';
import { createWebhookSchema, updateWebhookSchema } from './webhooks.schema';

export async function webhooksRoutes(app: FastifyInstance) {
  app.get('/', { preHandler: requirePermission('webhooks:create') }, async (request) => {
    const team = requireTeam(request);
    const webhooksList = await listWebhooks(team.teamId);
    return { success: true, data: webhooksList };
  });

  app.post('/', { preHandler: requirePermission('webhooks:create') }, async (request) => {
    const team = requireTeam(request);
    const input = createWebhookSchema.parse(request.body);
    const webhook = await createWebhookRecord(team.teamId, input);
    return { success: true, data: webhook };
  });

  app.get('/:id', { preHandler: requirePermission('webhooks:create') }, async (request) => {
    const team = requireTeam(request);
    const { id } = request.params as { id: string };
    const webhook = await getWebhook(team.teamId, id);
    return { success: true, data: webhook };
  });

  app.put('/:id', { preHandler: requirePermission('webhooks:update') }, async (request) => {
    const team = requireTeam(request);
    const { id } = request.params as { id: string };
    const input = updateWebhookSchema.parse(request.body);
    const webhook = await updateWebhookRecord(team.teamId, id, input);
    return { success: true, data: webhook };
  });

  app.delete('/:id', { preHandler: requirePermission('webhooks:delete') }, async (request) => {
    const team = requireTeam(request);
    const { id } = request.params as { id: string };
    await deleteWebhookRecord(team.teamId, id);
    return { success: true };
  });

  app.get('/:id/deliveries', { preHandler: requirePermission('webhooks:create') }, async (request) => {
    const team = requireTeam(request);
    const { id } = request.params as { id: string };
    const deliveries = await listWebhookDeliveries(team.teamId, id);
    return { success: true, data: deliveries };
  });
}
