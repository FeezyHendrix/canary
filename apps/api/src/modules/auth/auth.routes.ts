import type { FastifyInstance } from 'fastify';
import { env } from '../../lib/env';
import { getGoogleAuthUrl, getGoogleTokens, getGoogleProfile } from './oauth/google';
import { getGitHubAuthUrl, getGitHubTokens, getGitHubProfile } from './oauth/github';
import {
  findOrCreateUser,
  createSession,
  deleteSession,
  switchActiveTeam,
  registerWithPassword,
  loginWithPassword,
  setPasswordForOAuthUser,
} from './auth.service';
import { requireAuth } from './middleware/session';
import {
  switchTeamSchema,
  registerSchema,
  loginSchema,
  verifyEmailSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  setPasswordSchema,
} from './auth.schema';
import { UnauthorizedError, ValidationError } from '../../lib/errors';
import {
  validatePasswordStrength,
  verifyEmailToken,
  createPasswordResetToken,
  resetPasswordWithToken,
  createVerificationToken,
} from './password.service';
import { authRateLimiters } from './middleware/rate-limit';
import { db } from '../../db';
import { users } from '../../db/schema';
import { eq } from 'drizzle-orm';

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

      const isLocalhost = env.APP_URL.includes('localhost');
      reply.setCookie('session', sessionId, {
        httpOnly: true,
        secure: !isLocalhost,
        sameSite: isLocalhost ? 'none' : 'lax',
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

      const isLocalhost = env.APP_URL.includes('localhost');
      reply.setCookie('session', sessionId, {
        httpOnly: true,
        secure: !isLocalhost,
        sameSite: isLocalhost ? 'none' : 'lax',
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

  // Setup check - returns whether this is a fresh install
  app.get('/setup-status', async () => {
    const userCount = await db.select({ count: users.id }).from(users).limit(1);
    const hasUsers = userCount.length > 0;

    return {
      success: true,
      data: {
        isFirstTimeSetup: !hasUsers,
      },
    };
  });

  // Password authentication routes

  app.post('/register', { preHandler: authRateLimiters.register }, async (request) => {
    const input = registerSchema.parse(request.body);

    const { valid, errors } = validatePasswordStrength(input.password);
    if (!valid) {
      throw new ValidationError('Password does not meet requirements', { errors });
    }

    const { verificationToken } = await registerWithPassword(input);

    // TODO: Send verification email using adapters system
    // For development, log the token
    if (env.NODE_ENV === 'development') {
      request.log.info({ verificationToken }, 'Email verification token generated');
    }

    return {
      success: true,
      data: {
        message: 'Registration successful. Please check your email to verify your account.',
      },
    };
  });

  app.post('/login', { preHandler: authRateLimiters.login }, async (request, reply) => {
    const input = loginSchema.parse(request.body);

    const user = await loginWithPassword(input.email, input.password);
    const sessionId = await createSession(user.id);

    // For cross-origin cookies (development with different ports), use sameSite: 'none' with secure
    // In production, use sameSite: 'lax' for better security
    const isLocalhost = env.APP_URL.includes('localhost');
    reply.setCookie('session', sessionId, {
      httpOnly: true,
      secure: !isLocalhost,
      sameSite: isLocalhost ? 'none' : 'lax',
      path: '/',
      maxAge: 30 * 24 * 60 * 60,
    });

    return { success: true, data: { message: 'Login successful' } };
  });

  app.post('/verify-email', async (request) => {
    const { token } = verifyEmailSchema.parse(request.body);

    const result = await verifyEmailToken(token);

    if (!result.success) {
      throw new ValidationError('Invalid or expired verification token');
    }

    return { success: true, data: { message: 'Email verified successfully' } };
  });

  app.post(
    '/resend-verification',
    { preHandler: authRateLimiters.verification },
    async (request) => {
      const { email } = forgotPasswordSchema.parse(request.body);

      const user = await db.query.users.findFirst({
        where: eq(users.email, email),
      });

      if (user && !user.emailVerified) {
        const token = await createVerificationToken(user.id);
        // TODO: Send verification email
        if (env.NODE_ENV === 'development') {
          request.log.info({ verificationToken: token }, 'Verification token generated');
        }
      }

      // Always return success to prevent email enumeration
      return {
        success: true,
        data: { message: 'If an unverified account exists, a verification email has been sent.' },
      };
    }
  );

  app.post('/forgot-password', { preHandler: authRateLimiters.passwordReset }, async (request) => {
    const { email } = forgotPasswordSchema.parse(request.body);

    const token = await createPasswordResetToken(email);

    if (token && env.NODE_ENV === 'development') {
      request.log.info({ resetToken: token }, 'Password reset token generated');
    }

    // Always return success to prevent email enumeration
    return {
      success: true,
      data: {
        message: 'If an account exists with this email, a password reset link has been sent.',
      },
    };
  });

  app.post('/reset-password', async (request) => {
    const { token, password } = resetPasswordSchema.parse(request.body);

    const { valid, errors } = validatePasswordStrength(password);
    if (!valid) {
      throw new ValidationError('Password does not meet requirements', { errors });
    }

    const success = await resetPasswordWithToken(token, password);

    if (!success) {
      throw new ValidationError('Invalid or expired reset token');
    }

    return { success: true, data: { message: 'Password reset successfully' } };
  });

  app.post('/set-password', { preHandler: requireAuth }, async (request) => {
    const { password } = setPasswordSchema.parse(request.body);

    const { valid, errors } = validatePasswordStrength(password);
    if (!valid) {
      throw new ValidationError('Password does not meet requirements', { errors });
    }

    await setPasswordForOAuthUser(request.user!.id, password);

    return { success: true, data: { message: 'Password set successfully' } };
  });
}
