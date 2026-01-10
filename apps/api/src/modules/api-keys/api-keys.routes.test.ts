import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { getTestApp, closeTestApp, createTestUser } from '../../test/utils';
import type { FastifyInstance } from 'fastify';

describe('api-keys routes', () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    app = await getTestApp();
  });

  afterAll(async () => {
    await closeTestApp();
  });

  describe('GET /api/api-keys', () => {
    it('should list API keys', async () => {
      const { teamId, sessionId } = await createTestUser();
      const { createTestApiKey } = await import('../../test/utils');

      await createTestApiKey(teamId, { name: 'Key 1' });
      await createTestApiKey(teamId, { name: 'Key 2' });

      const response = await app.inject({
        method: 'GET',
        url: '/api/api-keys',
        cookies: { session: sessionId },
      });

      expect(response.statusCode).toBe(200);
      expect(response.json()).toMatchObject({
        success: true,
        data: expect.any(Array),
      });
      expect(response.json().data.length).toBeGreaterThanOrEqual(2);
    });

    it('should require authentication', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/api-keys',
      });

      expect(response.statusCode).toBe(401);
    });
  });

  describe('POST /api/api-keys', () => {
    it('should create API key', async () => {
      const { sessionId } = await createTestUser();

      const response = await app.inject({
        method: 'POST',
        url: '/api/api-keys',
        cookies: { session: sessionId },
        payload: {
          name: 'Test Key',
          scopes: ['send', 'read'],
          rateLimit: 1000,
        },
      });

      expect(response.statusCode).toBe(200);
      expect(response.json()).toMatchObject({
        success: true,
        data: {
          id: expect.any(String),
          name: 'Test Key',
          keyPrefix: 'cnry',
          scopes: ['send', 'read'],
          rateLimit: 1000,
        },
      });
      expect(response.json().data.apiKey).toBeDefined();
      expect(response.json().data.apiKey).toMatch(/^cnry_/);
    });

    it('should validate required fields', async () => {
      const { sessionId } = await createTestUser();

      const response = await app.inject({
        method: 'POST',
        url: '/api/api-keys',
        cookies: { session: sessionId },
        payload: {
          scopes: ['send'],
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

    it('should validate scopes', async () => {
      const { sessionId } = await createTestUser();

      const response = await app.inject({
        method: 'POST',
        url: '/api/api-keys',
        cookies: { session: sessionId },
        payload: {
          name: 'Test Key',
          scopes: ['invalid-scope'],
        },
      });

      expect(response.statusCode).toBe(400);
    });
  });

  describe('DELETE /api/api-keys/:id', () => {
    it('should delete API key', async () => {
      const { teamId, sessionId } = await createTestUser();
      const { createTestApiKey } = await import('../../test/utils');

      const { record } = await createTestApiKey(teamId, { name: 'Test Key' });

      const response = await app.inject({
        method: 'DELETE',
        url: `/api/api-keys/${record.id}`,
        cookies: { session: sessionId },
      });

      expect(response.statusCode).toBe(200);
      expect(response.json()).toMatchObject({
        success: true,
      });
    });

    it('should return 404 for non-existent key', async () => {
      const { sessionId } = await createTestUser();

      const response = await app.inject({
        method: 'DELETE',
        url: '/api/api-keys/non-existent-id',
        cookies: { session: sessionId },
      });

      expect(response.statusCode).toBe(404);
    });

    it('should not allow deletion from other team', async () => {
      const { teamId: teamId1, sessionId: sessionId1 } = await createTestUser();
      const { teamId: teamId2, sessionId: sessionId2 } = await createTestUser();
      const { createTestApiKey } = await import('../../test/utils');

      const { record } = await createTestApiKey(teamId1, { name: 'Team 1 Key' });

      const response = await app.inject({
        method: 'DELETE',
        url: `/api/api-keys/${record.id}`,
        cookies: { session: sessionId2 },
      });

      expect(response.statusCode).toBe(404);
    });
  });
});
