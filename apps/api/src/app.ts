import Fastify from 'fastify';
import cors from '@fastify/cors';
import cookie from '@fastify/cookie';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import { env } from './lib/env';
import { AppError } from './lib/errors';
import { authRoutes } from './modules/auth/auth.routes';
import { templatesRoutes } from './modules/templates/templates.routes';
import { adaptersRoutes } from './modules/adapters/adapters.routes';
import { emailsRoutes } from './modules/emails/emails.routes';
import { logsRoutes } from './modules/logs/logs.routes';
import { apiKeysRoutes } from './modules/api-keys/api-keys.routes';
import { webhooksRoutes } from './modules/webhooks/webhooks.routes';
import { teamsRoutes } from './modules/teams/teams.routes';
import { uploadsRoutes } from './modules/uploads/uploads.routes';

export async function buildApp() {
  const app = Fastify({
    logger: {
      level: env.NODE_ENV === 'production' ? 'info' : 'debug',
      transport:
        env.NODE_ENV === 'development'
          ? {
              target: 'pino-pretty',
              options: { colorize: true },
            }
          : undefined,
    },
  });

  await app.register(cors, {
    origin: env.APP_URL,
    credentials: true,
  });

  await app.register(cookie, {
    secret: env.SESSION_SECRET,
  });

  await app.register(swagger, {
    openapi: {
      info: {
        title: 'Canary API',
        description: 'Email template designer and sending API',
        version: '0.1.0',
      },
      servers: [{ url: env.API_URL }],
      components: {
        securitySchemes: {
          bearerAuth: {
            type: 'http',
            scheme: 'bearer',
            description: 'API key authentication',
          },
          cookieAuth: {
            type: 'apiKey',
            in: 'cookie',
            name: 'session',
            description: 'Session cookie authentication',
          },
        },
      },
    },
  });

  await app.register(swaggerUi, {
    routePrefix: '/docs',
  });

  app.setErrorHandler((error, request, reply) => {
    request.log.error(error);

    if (error instanceof AppError) {
      return reply.status(error.statusCode).send(error.toJSON());
    }

    const fastifyError = error as { validation?: unknown; message?: string };

    if (fastifyError.validation) {
      return reply.status(400).send({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid request',
          details: fastifyError.validation,
        },
      });
    }

    return reply.status(500).send({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message:
          env.NODE_ENV === 'production'
            ? 'Internal server error'
            : fastifyError.message || 'Unknown error',
      },
    });
  });

  app.get('/health', async () => ({ status: 'ok', timestamp: new Date().toISOString() }));

  await app.register(authRoutes, { prefix: '/api/auth' });
  await app.register(templatesRoutes, { prefix: '/api/templates' });
  await app.register(adaptersRoutes, { prefix: '/api/adapters' });
  await app.register(emailsRoutes, { prefix: '/api/v1' });
  await app.register(logsRoutes, { prefix: '/api/logs' });
  await app.register(apiKeysRoutes, { prefix: '/api/api-keys' });
  await app.register(webhooksRoutes, { prefix: '/api/webhooks' });
  await app.register(teamsRoutes, { prefix: '/api/teams' });
  await app.register(uploadsRoutes, { prefix: '/api/uploads' });

  return app;
}
