import type { FastifyInstance } from 'fastify';
import { requireApiKey, requireScope } from '../auth/middleware/api-key';
import { sendEmail } from './emails.service';
import { sendEmailSchema } from './emails.schema';

export async function emailsRoutes(app: FastifyInstance) {
  app.post('/send', { preHandler: requireScope('send') }, async (request) => {
    const input = sendEmailSchema.parse(request.body);
    const result = await sendEmail(
      request.apiKey!.teamId,
      request.apiKey!.id,
      input
    );
    return { success: true, data: result };
  });
}
