import type { FastifyInstance } from 'fastify';
import { requireAuth, requireTeam, requirePermission } from '../auth/middleware/session';
import {
  listTemplates,
  getTemplate,
  createTemplate,
  updateTemplate,
  deleteTemplate,
  duplicateTemplate,
  createVersion,
  listVersions,
  restoreVersion,
  previewTemplate,
  testSendEmail,
} from './templates.service';
import {
  createTemplateSchema,
  updateTemplateSchema,
  templatePreviewSchema,
  testSendSchema,
  listTemplatesSchema,
} from './templates.schema';

export async function templatesRoutes(app: FastifyInstance) {
  app.get('/', { preHandler: requireAuth }, async (request) => {
    const team = requireTeam(request);
    const params = listTemplatesSchema.parse(request.query);
    const result = await listTemplates(team.teamId, params);
    return { success: true, data: result };
  });

  app.post('/', { preHandler: requirePermission('templates:create') }, async (request) => {
    const team = requireTeam(request);
    const input = createTemplateSchema.parse(request.body);
    const template = await createTemplate(team.teamId, request.user!.id, input);
    return { success: true, data: template };
  });

  app.get('/:id', { preHandler: requireAuth }, async (request) => {
    const team = requireTeam(request);
    const { id } = request.params as { id: string };
    const template = await getTemplate(team.teamId, id);
    return { success: true, data: template };
  });

  app.put('/:id', { preHandler: requirePermission('templates:update') }, async (request) => {
    const team = requireTeam(request);
    const { id } = request.params as { id: string };
    const input = updateTemplateSchema.parse(request.body);
    const template = await updateTemplate(team.teamId, id, request.user!.id, input);
    return { success: true, data: template };
  });

  app.delete('/:id', { preHandler: requirePermission('templates:delete') }, async (request) => {
    const team = requireTeam(request);
    const { id } = request.params as { id: string };
    await deleteTemplate(team.teamId, id);
    return { success: true };
  });

  app.post(
    '/:id/duplicate',
    { preHandler: requirePermission('templates:create') },
    async (request) => {
      const team = requireTeam(request);
      const { id } = request.params as { id: string };
      const template = await duplicateTemplate(team.teamId, id, request.user!.id);
      return { success: true, data: template };
    }
  );

  app.get('/:id/versions', { preHandler: requireAuth }, async (request) => {
    const team = requireTeam(request);
    const { id } = request.params as { id: string };
    const versions = await listVersions(team.teamId, id);
    return { success: true, data: versions };
  });

  app.post(
    '/:id/versions',
    { preHandler: requirePermission('templates:update') },
    async (request) => {
      const team = requireTeam(request);
      const { id } = request.params as { id: string };
      const { name } = (request.body as { name?: string }) || {};
      const version = await createVersion(team.teamId, id, request.user!.id, name);
      return { success: true, data: version };
    }
  );

  app.put(
    '/:id/versions/:versionId/restore',
    { preHandler: requirePermission('templates:update') },
    async (request) => {
      const team = requireTeam(request);
      const { id, versionId } = request.params as { id: string; versionId: string };
      const template = await restoreVersion(team.teamId, id, versionId, request.user!.id);
      return { success: true, data: template };
    }
  );

  app.post('/:id/preview', { preHandler: requireAuth }, async (request) => {
    const team = requireTeam(request);
    const { id } = request.params as { id: string };
    const { variables } = templatePreviewSchema.parse(request.body);
    const preview = await previewTemplate(team.teamId, id, variables);
    return { success: true, data: preview };
  });

  app.post(
    '/:id/test-send',
    { preHandler: requirePermission('templates:update') },
    async (request) => {
      const team = requireTeam(request);
      const { id } = request.params as { id: string };
      const input = testSendSchema.parse(request.body);
      const result = await testSendEmail(team.teamId, id, input);
      return { success: true, data: result };
    }
  );
}
