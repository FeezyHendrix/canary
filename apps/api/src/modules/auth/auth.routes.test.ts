import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { getTestApp, closeTestApp, createTestUser, createTestTeam } from '../../test/utils';
import type { FastifyInstance } from 'fastify';

describe('auth routes', () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    app = await getTestApp();
  });

  afterAll(async () => {
    await closeTestApp();
  });

  describe('POST /api/auth/register', () => {
    it('should register new user', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/auth/register',
        payload: {
          email: 'newuser@example.com',
          password: 'TestPassword123!',
          name: 'New User',
        },
      });

      expect(response.statusCode).toBe(200);
      expect(response.json()).toMatchObject({
        success: true,
        data: {
          message: expect.stringContaining('registration successful'),
        },
      });
    });

    it('should reject weak password', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/auth/register',
        payload: {
          email: 'weak@example.com',
          password: 'weak',
          name: 'Weak User',
        },
      });

      expect(response.statusCode).toBe(400);
      expect(response.json()).toMatchObject({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
        },
      });
    });

    it('should reject invalid email', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/auth/register',
        payload: {
          email: 'invalid-email',
          password: 'TestPassword123!',
          name: 'Invalid User',
        },
      });

      expect(response.statusCode).toBe(400);
    });

    it('should reject duplicate email', async () => {
      const { user } = await createTestUser({ email: 'duplicate@example.com' });

      const response = await app.inject({
        method: 'POST',
        url: '/api/auth/register',
        payload: {
          email: 'duplicate@example.com',
          password: 'TestPassword123!',
          name: 'Duplicate User',
        },
      });

      expect(response.statusCode).toBe(409);
      expect(response.json()).toMatchObject({
        success: false,
        error: {
          code: 'CONFLICT',
        },
      });
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login with valid credentials', async () => {
      const { user, plainPassword } = await createTestUser();

      const response = await app.inject({
        method: 'POST',
        url: '/api/auth/login',
        payload: {
          email: user.email,
          password: plainPassword,
        },
      });

      expect(response.statusCode).toBe(200);
      expect(response.json()).toMatchObject({
        success: true,
        data: {
          message: expect.stringContaining('successful'),
        },
      });
      expect(response.headers['set-cookie']).toBeDefined();
    });

    it('should reject invalid email', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/auth/login',
        payload: {
          email: 'nonexistent@example.com',
          password: 'TestPassword123!',
        },
      });

      expect(response.statusCode).toBe(401);
      expect(response.json()).toMatchObject({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
        },
      });
    });

    it('should reject invalid password', async () => {
      const { user } = await createTestUser();

      const response = await app.inject({
        method: 'POST',
        url: '/api/auth/login',
        payload: {
          email: user.email,
          password: 'WrongPassword123!',
        },
      });

      expect(response.statusCode).toBe(401);
      expect(response.json()).toMatchObject({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
        },
      });
    });

    it('should reject unverified email', async () => {
      const { user, plainPassword } = await createTestUser({ password: undefined });

      const response = await app.inject({
        method: 'POST',
        url: '/api/auth/login',
        payload: {
          email: user.email,
          password: plainPassword,
        },
      });

      expect(response.statusCode).toBe(401);
      expect(response.json()).toMatchObject({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: expect.stringContaining('verify'),
        },
      });
    });
  });

  describe('POST /api/auth/logout', () => {
    it('should logout authenticated user', async () => {
      const { sessionId } = await createTestUser();

      const response = await app.inject({
        method: 'POST',
        url: '/api/auth/logout',
        cookies: {
          session: sessionId,
        },
      });

      expect(response.statusCode).toBe(200);
      expect(response.json()).toMatchObject({
        success: true,
      });
    });

    it('should handle logout without session', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/auth/logout',
      });

      expect(response.statusCode).toBe(200);
      expect(response.json()).toMatchObject({
        success: true,
      });
    });
  });

  describe('GET /api/auth/me', () => {
    it('should return authenticated user', async () => {
      const { user: testUser, sessionId } = await createTestUser();

      const response = await app.inject({
        method: 'GET',
        url: '/api/auth/me',
        cookies: {
          session: sessionId,
        },
      });

      expect(response.statusCode).toBe(200);
      expect(response.json()).toMatchObject({
        success: true,
        data: {
          user: {
            id: testUser.id,
            email: testUser.email,
            name: testUser.name,
          },
          teams: expect.arrayContaining([
            expect.objectContaining({
              teamId: testUser.activeTeamId,
              role: 'owner',
            }),
          ]),
        },
      });
    });

    it('should reject unauthenticated request', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/auth/me',
      });

      expect(response.statusCode).toBe(401);
      expect(response.json()).toMatchObject({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
        },
      });
    });

    it('should reject invalid session', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/auth/me',
        cookies: {
          session: 'invalid-session-id',
        },
      });

      expect(response.statusCode).toBe(401);
      expect(response.json()).toMatchObject({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
        },
      });
    });
  });

  describe('POST /api/auth/switch-team', () => {
    it('should switch active team', async () => {
      const { user, sessionId } = await createTestUser();
      const newTeam = await (await import('../../test/utils')).createTestTeam(user.id, 'New Team');

      const response = await app.inject({
        method: 'POST',
        url: '/api/auth/switch-team',
        cookies: {
          session: sessionId,
        },
        payload: {
          teamId: newTeam.id,
        },
      });

      expect(response.statusCode).toBe(200);
      expect(response.json()).toMatchObject({
        success: true,
      });

      const meResponse = await app.inject({
        method: 'GET',
        url: '/api/auth/me',
        cookies: {
          session: sessionId,
        },
      });

      expect(meResponse.json().data.user.activeTeamId).toBe(newTeam.id);
    });

    it('should reject unauthorized team switch', async () => {
      const { sessionId } = await createTestUser();
      const { createTestUser: createOtherUser } = await import('../../test/utils');
      const { user: otherUser } = await createOtherUser();

      const otherTeam = await createTestTeam(otherUser.id);

      const response = await app.inject({
        method: 'POST',
        url: '/api/auth/switch-team',
        cookies: {
          session: sessionId,
        },
        payload: {
          teamId: otherTeam.id,
        },
      });

      expect(response.statusCode).toBe(403);
      expect(response.json()).toMatchObject({
        success: false,
        error: {
          code: 'FORBIDDEN',
        },
      });
    });
  });

  describe('POST /api/auth/forgot-password', () => {
    it('should initiate password reset for existing user', async () => {
      const { user } = await createTestUser();

      const response = await app.inject({
        method: 'POST',
        url: '/api/auth/forgot-password',
        payload: {
          email: user.email,
        },
      });

      expect(response.statusCode).toBe(200);
      expect(response.json()).toMatchObject({
        success: true,
        data: {
          message: expect.stringContaining('password reset'),
        },
      });
    });

    it('should not reveal email existence', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/auth/forgot-password',
        payload: {
          email: 'nonexistent@example.com',
        },
      });

      expect(response.statusCode).toBe(200);
      expect(response.json()).toMatchObject({
        success: true,
      });
    });
  });

  describe('POST /api/auth/reset-password', () => {
    it('should reset password with valid token', async () => {
      const { user } = await createTestUser();
      const { createPasswordResetToken } = await import('./password.service');
      const token = await createPasswordResetToken(user.email);

      if (!token) {
        throw new Error('Token should not be null');
      }

      const response = await app.inject({
        method: 'POST',
        url: '/api/auth/reset-password',
        payload: {
          token,
          password: 'NewPassword456!',
        },
      });

      expect(response.statusCode).toBe(200);
      expect(response.json()).toMatchObject({
        success: true,
        data: {
          message: expect.stringContaining('Password reset'),
        },
      });
    });

    it('should reject invalid token', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/auth/reset-password',
        payload: {
          token: 'invalid-token',
          password: 'NewPassword456!',
        },
      });

      expect(response.statusCode).toBe(400);
      expect(response.json()).toMatchObject({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
        },
      });
    });
  });

  describe('POST /api/auth/verify-email', () => {
    it('should verify email with valid token', async () => {
      const { user } = await createTestUser({ password: undefined });
      const { createVerificationToken } = await import('./password.service');
      const token = await createVerificationToken(user.id);

      const response = await app.inject({
        method: 'POST',
        url: '/api/auth/verify-email',
        payload: {
          token,
        },
      });

      expect(response.statusCode).toBe(200);
      expect(response.json()).toMatchObject({
        success: true,
        data: {
          message: expect.stringContaining('verified'),
        },
      });
    });

    it('should reject invalid verification token', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/auth/verify-email',
        payload: {
          token: 'invalid-token',
        },
      });

      expect(response.statusCode).toBe(400);
      expect(response.json()).toMatchObject({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
        },
      });
    });
  });
});
