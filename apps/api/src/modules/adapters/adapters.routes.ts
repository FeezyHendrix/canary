import type { FastifyInstance } from 'fastify';
import { requireAuth, requireTeam, requirePermission } from '../auth/middleware/session';
import {
  listAdapters,
  getAdapter,
  createAdapterRecord,
  updateAdapterRecord,
  deleteAdapterRecord,
  testAdapter,
  getAvailableAdapterTypes,
} from './adapters.service';
import { createAdapterSchema, updateAdapterSchema } from './adapters.schema';

export async function adaptersRoutes(app: FastifyInstance) {
  app.get('/types', async () => {
    const types = getAvailableAdapterTypes();
    return { success: true, data: types };
  });

  app.get('/', { preHandler: requireAuth }, async (request) => {
    const team = requireTeam(request);
    const adaptersList = await listAdapters(team.teamId);
    return { success: true, data: adaptersList };
  });

  app.post('/', { preHandler: requirePermission('adapters:create') }, async (request) => {
    const team = requireTeam(request);
    const input = createAdapterSchema.parse(request.body);
    const adapter = await createAdapterRecord(team.teamId, input);
    return { success: true, data: adapter };
  });

  app.get('/:id', { preHandler: requirePermission('adapters:view-config') }, async (request) => {
    const team = requireTeam(request);
    const { id } = request.params as { id: string };
    const adapter = await getAdapter(team.teamId, id);
    return { success: true, data: adapter };
  });

  app.put('/:id', { preHandler: requirePermission('adapters:update') }, async (request) => {
    const team = requireTeam(request);
    const { id } = request.params as { id: string };
    const input = updateAdapterSchema.parse(request.body);
    const adapter = await updateAdapterRecord(team.teamId, id, input);
    return { success: true, data: adapter };
  });

  app.delete('/:id', { preHandler: requirePermission('adapters:delete') }, async (request) => {
    const team = requireTeam(request);
    const { id } = request.params as { id: string };
    await deleteAdapterRecord(team.teamId, id);
    return { success: true };
  });

  app.post('/:id/test', { preHandler: requirePermission('adapters:update') }, async (request) => {
    const team = requireTeam(request);
    const { id } = request.params as { id: string };
    const result = await testAdapter(team.teamId, id);
    return { success: true, data: result };
  });
}
