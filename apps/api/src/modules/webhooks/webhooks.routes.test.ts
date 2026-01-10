import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { getTestApp, closeTestApp, createTestUser } from '../../test/utils';
import type { FastifyInstance } from 'fastify';

describe('webhooks routes', () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    app = await getTestApp();
  });

  afterAll(async () => {
    await closeTestApp();
  });

  describe('GET /api/webhooks', () => {
    it('should list webhooks', async () => {
      const { teamId, sessionId } = await createTestUser();

      const createResponse = await app.inject({
        method: 'POST',
        url: '/api/webhooks',
        cookies: { session: sessionId },
        payload: {
          name: 'Test Webhook',
          url: 'https://example.com/webhook',
          events: ['email.sent', 'email.delivered'],
          secret: 'test-secret',
        },
      });

      expect(createResponse.statusCode).toBe(200);

      const response = await app.inject({
        method: 'GET',
        url: '/api/webhooks',
        cookies: { session: sessionId },
      });

      expect(response.statusCode).toBe(200);
      expect(response.json()).toMatchObject({
        success: true,
        data: expect.any(Array),
      });
      expect(response.json().data.length).toBeGreaterThanOrEqual(1);
    });

    it('should require authentication', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/webhooks',
      });

      expect(response.statusCode).toBe(401);
    });
  });

  describe('POST /api/webhooks', () => {
    it('should create webhook', async () => {
      const { sessionId } = await createTestUser();

      const response = await app.inject({
        method: 'POST',
        url: '/api/webhooks',
        cookies: { session: sessionId },
        payload: {
          name: 'Test Webhook',
          url: 'https://example.com/webhook',
          events: ['email.sent', 'email.delivered'],
          secret: 'test-secret',
        },
      });

      expect(response.statusCode).toBe(200);
      expect(response.json()).toMatchObject({
        success: true,
        data: {
          name: 'Test Webhook',
          url: 'https://example.com/webhook',
          events: ['email.sent', 'email.delivered'],
          id: expect.any(String),
        },
      });
    });

    it('should validate required fields', async () => {
      const { sessionId } = await createTestUser();

      const response = await app.inject({
        method: 'POST',
        url: '/api/webhooks',
        cookies: { session: sessionId },
        payload: {
          name: 'Test Webhook',
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

    it('should validate URL format', async () => {
      const { sessionId } = await createTestUser();

      const response = await app.inject({
        method: 'POST',
        url: '/api/webhooks',
        cookies: { session: sessionId },
        payload: {
          name: 'Test Webhook',
          url: 'not-a-valid-url',
          events: ['email.sent'],
          secret: 'test-secret',
        },
      });

      expect(response.statusCode).toBe(400);
    });

    it('should validate events', async () => {
      const { sessionId } = await createTestUser();

      const response = await app.inject({
        method: 'POST',
        url: '/api/webhooks',
        cookies: { session: sessionId },
        payload: {
          name: 'Test Webhook',
          url: 'https://example.com/webhook',
          events: ['invalid-event'],
          secret: 'test-secret',
        },
      });

      expect(response.statusCode).toBe(400);
    });
  });

  describe('PUT /api/webhooks/:id', () => {
    it('should update webhook', async () => {
      const { sessionId } = await createTestUser();

      const createResponse = await app.inject({
        method: 'POST',
        url: '/api/webhooks',
        cookies: { session: sessionId },
        payload: {
          name: 'Original Name',
          url: 'https://example.com/webhook',
          events: ['email.sent'],
          secret: 'test-secret',
        },
      });

      const { id: webhookId } = createResponse.json().data;

      const response = await app.inject({
        method: 'PUT',
        url: `/api/webhooks/${webhookId}`,
        cookies: { session: sessionId },
        payload: {
          name: 'Updated Name',
        },
      });

      expect(response.statusCode).toBe(200);
      expect(response.json()).toMatchObject({
        success: true,
        data: {
          name: 'Updated Name',
        },
      });
    });

    it('should return 404 for non-existent webhook', async () => {
      const { sessionId } = await createTestUser();

      const response = await app.inject({
        method: 'PUT',
        url: '/api/webhooks/non-existent-id',
        cookies: { session: sessionId },
        payload: {
          name: 'Updated Name',
        },
      });

      expect(response.statusCode).toBe(404);
    });
  });

  describe('DELETE /api/webhooks/:id', () => {
    it('should delete webhook', async () => {
      const { sessionId } = await createTestUser();

      const createResponse = await app.inject({
        method: 'POST',
        url: '/api/webhooks',
        cookies: { session: sessionId },
        payload: {
          name: 'Test Webhook',
          url: 'https://example.com/webhook',
          events: ['email.sent'],
          secret: 'test-secret',
        },
      });

      const { id: webhookId } = createResponse.json().data;

      const response = await app.inject({
        method: 'DELETE',
        url: `/api/webhooks/${webhookId}`,
        cookies: { session: sessionId },
      });

      expect(response.statusCode).toBe(200);
      expect(response.json()).toMatchObject({
        success: true,
      });
    });

    it('should return 404 for non-existent webhook', async () => {
      const { sessionId } = await createTestUser();

      const response = await app.inject({
        method: 'DELETE',
        url: '/api/webhooks/non-existent-id',
        cookies: { session: sessionId },
      });

      expect(response.statusCode).toBe(404);
    });
  });
});
