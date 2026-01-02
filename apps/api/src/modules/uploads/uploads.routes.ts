import type { FastifyInstance, FastifyRequest } from 'fastify';
import multipart from '@fastify/multipart';
import { requireAuth, requireTeam, requirePermission } from '../auth/middleware/session';
import { uploadImage, deleteImage, isS3Configured } from './uploads.service';
import { MAX_FILE_SIZE_5MB } from './uploads.schema';

export async function uploadsRoutes(app: FastifyInstance) {
  await app.register(multipart, {
    limits: {
      fileSize: MAX_FILE_SIZE_5MB,
    },
  });

  app.get('/status', { preHandler: requireAuth }, async () => {
    return {
      success: true,
      data: { configured: isS3Configured() },
    };
  });

  app.post('/images', { preHandler: requirePermission('templates:update') }, async (request) => {
    const team = requireTeam(request);

    const data = await (request as FastifyRequest & { file: () => Promise<unknown> }).file();
    if (!data) {
      return { success: false, error: { code: 'NO_FILE', message: 'No file uploaded' } };
    }

    const fileData = data as {
      filename: string;
      mimetype: string;
      toBuffer: () => Promise<Buffer>;
    };
    const buffer = await fileData.toBuffer();
    const result = await uploadImage(team.teamId, {
      buffer,
      filename: fileData.filename,
      mimetype: fileData.mimetype,
    });

    return { success: true, data: result };
  });

  app.delete(
    '/images/*',
    { preHandler: requirePermission('templates:update') },
    async (request) => {
      const key = (request.params as { '*': string })['*'];
      await deleteImage(key);
      return { success: true };
    }
  );
}
