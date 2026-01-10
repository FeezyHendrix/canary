import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { getTestApp, closeTestApp, createTestUser } from '../../test/utils';
import type { FastifyInstance } from 'fastify';

describe('adapters routes', () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    app = await getTestApp();
  });

  afterAll(async () => {
    await closeTestApp();
  });

  describe('GET /api/adapters', () => {
    it('should list adapters', async () => {
      const { sessionId } = await createTestUser();

      const response = await app.inject({
        method: 'GET',
        url: '/api/adapters',
        cookies: { session: sessionId },
      });

      expect(response.statusCode).toBe(200);
      expect(response.json()).toMatchObject({
        success: true,
        data: expect.any(Array),
      });
    });

    it('should require authentication', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/adapters',
      });

      expect(response.statusCode).toBe(401);
    });
  });

  describe('POST /api/adapters', () => {
    it('should create SMTP adapter', async () => {
      const { sessionId } = await createTestUser();

      const response = await app.inject({
        method: 'POST',
        url: '/api/adapters',
        cookies: { session: sessionId },
        payload: {
          name: 'Test SMTP',
          type: 'smtp',
          config: {
            host: 'smtp.example.com',
            port: 587,
            username: 'test@example.com',
            password: 'password',
          },
          defaultFrom: 'noreply@example.com',
        },
      });

      expect(response.statusCode).toBe(200);
      expect(response.json()).toMatchObject({
        success: true,
        data: {
          name: 'Test SMTP',
          type: 'smtp',
          id: expect.any(String),
        },
      });
    });

    it('should validate required fields', async () => {
      const { sessionId } = await createTestUser();

      const response = await app.inject({
        method: 'POST',
        url: '/api/adapters',
        cookies: { session: sessionId },
        payload: {
          name: 'Test Adapter',
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

    it('should validate adapter type', async () => {
      const { sessionId } = await createTestUser();

      const response = await app.inject({
        method: 'POST',
        url: '/api/adapters',
        cookies: { session: sessionId },
        payload: {
          name: 'Test Adapter',
          type: 'invalid-type',
          config: {},
        },
      });

      expect(response.statusCode).toBe(400);
    });
  });

  describe('POST /api/adapters/:id/test', () => {
    it('should test adapter', async () => {
      const { sessionId } = await createTestUser();

      const createResponse = await app.inject({
        method: 'POST',
        url: '/api/adapters',
        cookies: { session: sessionId },
        payload: {
          name: 'Test Adapter',
          type: 'smtp',
          config: {
            host: 'smtp.example.com',
            port: 587,
            username: 'test@example.com',
            password: 'password',
          },
          defaultFrom: 'noreply@example.com',
        },
      });

      const { id: adapterId } = createResponse.json().data;

      const response = await app.inject({
        method: 'POST',
        url: `/api/adapters/${adapterId}/test`,
        cookies: { session: sessionId },
        payload: {
          to: 'test@example.com',
        },
      });

      expect(response.statusCode).toBe(200);
      expect(response.json()).toMatchObject({
        success: true,
        data: {
          success: expect.any(Boolean),
        },
      });
    });

    it('should validate recipient email', async () => {
      const { sessionId } = await createTestUser();

      const createResponse = await app.inject({
        method: 'POST',
        url: '/api/adapters',
        cookies: { session: sessionId },
        payload: {
          name: 'Test Adapter',
          type: 'smtp',
          config: {
            host: 'smtp.example.com',
            port: 587,
            username: 'test@example.com',
            password: 'password',
          },
          defaultFrom: 'noreply@example.com',
        },
      });

      const { id: adapterId } = createResponse.json().data;

      const response = await app.inject({
        method: 'POST',
        url: `/api/adapters/${adapterId}/test`,
        cookies: { session: sessionId },
        payload: {
          to: 'invalid-email',
        },
      });

      expect(response.statusCode).toBe(400);
    });
  });
});
