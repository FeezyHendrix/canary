import type { FastifyInstance } from 'fastify';
import { requireAuth, requireTeam, requirePermission } from '../auth/middleware/session';
import {
  getSubscriptionWithUsage,
  createCheckoutSession,
  createCustomerPortalSession,
} from './billing.service';
import { checkoutSchema } from './billing.schema';

export async function billingRoutes(app: FastifyInstance) {
  app.get(
    '/subscription',
    { preHandler: [requireAuth, requireTeam] },
    async (request) => {
      const subscription = await getSubscriptionWithUsage(request.teamId!);
      return { success: true, data: subscription };
    }
  );

  app.post(
    '/checkout',
    { preHandler: [requireAuth, requireTeam, requirePermission('team:update')] },
    async (request) => {
      const input = checkoutSchema.parse(request.body);
      const result = await createCheckoutSession(
        request.teamId!,
        request.user!.id,
        request.user!.email,
        input
      );
      return { success: true, data: result };
    }
  );

  app.post(
    '/portal',
    { preHandler: [requireAuth, requireTeam, requirePermission('team:update')] },
    async (request) => {
      const result = await createCustomerPortalSession(request.teamId!);
      return { success: true, data: result };
    }
  );
}
