import type { FastifyInstance } from 'fastify';
import { env } from '../../lib/env';
import { getGoogleAuthUrl, getGoogleTokens, getGoogleProfile } from './oauth/google';
import { getGitHubAuthUrl, getGitHubTokens, getGitHubProfile } from './oauth/github';
import { findOrCreateUser, createSession, deleteSession, switchActiveTeam } from './auth.service';
import { requireAuth } from './middleware/session';
import { switchTeamSchema } from './auth.schema';
import { UnauthorizedError } from '../../lib/errors';

function parseRedirectFromState(state?: string): string {
  if (!state) return '/';
  try {
    const parsed = JSON.parse(Buffer.from(state, 'base64').toString());
    if (parsed.redirect && parsed.redirect.startsWith('/')) {
      return parsed.redirect;
    }
  } catch {
    return '/';
  }
  return '/';
}

function encodeRedirectState(redirect?: string): string | undefined {
  if (!redirect) return undefined;
  return Buffer.from(JSON.stringify({ redirect })).toString('base64');
}

export async function authRoutes(app: FastifyInstance) {
  app.get('/google', async (request, reply) => {
    if (!env.GOOGLE_CLIENT_ID) {
      return reply.status(501).send({ error: 'Google OAuth not configured' });
    }
    const { redirect } = request.query as { redirect?: string };
    const url = getGoogleAuthUrl(encodeRedirectState(redirect));
    return reply.redirect(url);
  });

  app.get('/google/callback', async (request, reply) => {
    const { code, state } = request.query as { code?: string; state?: string };

    if (!code) {
      return reply.redirect(`${env.APP_URL}/login?error=no_code`);
    }

    try {
      const tokens = await getGoogleTokens(code);
      const profile = await getGoogleProfile(tokens.access_token);
      const user = await findOrCreateUser(profile);
      const sessionId = await createSession(user.id);

      reply.setCookie('session', sessionId, {
        httpOnly: true,
        secure: env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 30 * 24 * 60 * 60,
      });

      return reply.redirect(`${env.APP_URL}${parseRedirectFromState(state)}`);
    } catch (error) {
      request.log.error(error);
      return reply.redirect(`${env.APP_URL}/login?error=oauth_failed`);
    }
  });

  app.get('/github', async (request, reply) => {
    if (!env.GITHUB_CLIENT_ID) {
      return reply.status(501).send({ error: 'GitHub OAuth not configured' });
    }
    const { redirect } = request.query as { redirect?: string };
    const url = getGitHubAuthUrl(encodeRedirectState(redirect));
    return reply.redirect(url);
  });

  app.get('/github/callback', async (request, reply) => {
    const { code, state } = request.query as { code?: string; state?: string };

    if (!code) {
      return reply.redirect(`${env.APP_URL}/login?error=no_code`);
    }

    try {
      const tokens = await getGitHubTokens(code);
      const profile = await getGitHubProfile(tokens.access_token);
      const user = await findOrCreateUser(profile);
      const sessionId = await createSession(user.id);

      reply.setCookie('session', sessionId, {
        httpOnly: true,
        secure: env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 30 * 24 * 60 * 60,
      });

      return reply.redirect(`${env.APP_URL}${parseRedirectFromState(state)}`);
    } catch (error) {
      request.log.error(error);
      return reply.redirect(`${env.APP_URL}/login?error=oauth_failed`);
    }
  });

  app.post('/logout', async (request, reply) => {
    const sessionId = request.cookies.session;

    if (sessionId) {
      await deleteSession(sessionId);
    }

    reply.clearCookie('session', { path: '/' });

    return { success: true };
  });

  app.get('/me', { preHandler: requireAuth }, async (request) => {
    return {
      success: true,
      data: {
        user: request.user,
        teams: request.teams,
      },
    };
  });

  app.post('/switch-team', { preHandler: requireAuth }, async (request, reply) => {
    const { teamId } = switchTeamSchema.parse(request.body);
    const sessionId = request.cookies.session;

    if (!sessionId) {
      throw new UnauthorizedError();
    }

    const switched = await switchActiveTeam(sessionId, teamId);

    if (!switched) {
      return reply.status(403).send({
        success: false,
        error: { code: 'FORBIDDEN', message: 'Cannot switch to this team' },
      });
    }

    return { success: true };
  });
}
