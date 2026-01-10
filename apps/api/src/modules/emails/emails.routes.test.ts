import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import {
  getTestApp,
  closeTestApp,
  createTestUser,
  createTestApiKey,
  createTestTeam,
} from '../../test/utils';
import type { FastifyInstance } from 'fastify';

describe('emails routes', () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    app = await getTestApp();
  });

  afterAll(async () => {
    await closeTestApp();
  });

  describe('POST /api/v1/send', () => {
    it('should send email with API key', async () => {
      const { teamId, sessionId } = await createTestUser();
      const { apiKey } = await createTestApiKey(teamId);

      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/send',
        headers: {
          'X-API-Key': apiKey,
        },
        payload: {
          to: 'recipient@example.com',
          subject: 'Test Email',
          content: 'This is a test email.',
        },
      });

      expect(response.statusCode).toBe(200);
      expect(response.json()).toMatchObject({
        success: true,
        data: {
          id: expect.any(String),
          status: 'queued',
        },
      });
    });

    it('should reject invalid API key', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/send',
        headers: {
          'X-API-Key': 'invalid-api-key',
        },
        payload: {
          to: 'recipient@example.com',
          subject: 'Test Email',
          content: 'This is a test email.',
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

    it('should reject without API key', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/send',
        payload: {
          to: 'recipient@example.com',
          subject: 'Test Email',
          content: 'This is a test email.',
        },
      });

      expect(response.statusCode).toBe(401);
    });

    it('should validate required fields', async () => {
      const { teamId } = await createTestUser();
      const { apiKey } = await createTestApiKey(teamId);

      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/send',
        headers: {
          'X-API-Key': apiKey,
        },
        payload: {
          to: 'recipient@example.com',
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

    it('should validate email format', async () => {
      const { teamId } = await createTestUser();
      const { apiKey } = await createTestApiKey(teamId);

      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/send',
        headers: {
          'X-API-Key': apiKey,
        },
        payload: {
          to: 'invalid-email',
          subject: 'Test Email',
          content: 'Content',
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

  describe('GET /api/v1/:emailId/status', () => {
    it('should get email status', async () => {
      const { teamId } = await createTestUser();
      const { apiKey } = await createTestApiKey(teamId);

      const sendResponse = await app.inject({
        method: 'POST',
        url: '/api/v1/send',
        headers: {
          'X-API-Key': apiKey,
        },
        payload: {
          to: 'recipient@example.com',
          subject: 'Test Email',
          content: 'This is a test email.',
        },
      });

      const { id: emailId } = sendResponse.json().data;

      const response = await app.inject({
        method: 'GET',
        url: `/api/v1/${emailId}/status`,
        headers: {
          'X-API-Key': apiKey,
        },
      });

      expect(response.statusCode).toBe(200);
      expect(response.json()).toMatchObject({
        success: true,
        data: {
          id: emailId,
          status: expect.any(String),
        },
      });
    });

    it('should return 404 for non-existent email', async () => {
      const { teamId } = await createTestUser();
      const { apiKey } = await createTestApiKey(teamId);

      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/non-existent-email-id/status',
        headers: {
          'X-API-Key': apiKey,
        },
      });

      expect(response.statusCode).toBe(404);
      expect(response.json()).toMatchObject({
        success: false,
        error: {
          code: 'NOT_FOUND',
        },
      });
    });

    it('should not allow access from other team', async () => {
      const { teamId: teamId1 } = await createTestUser();
      const { apiKey: apiKey1 } = await createTestApiKey(teamId1);
      const { teamId: teamId2 } = await createTestUser();
      const { apiKey: apiKey2 } = await createTestApiKey(teamId2);

      const sendResponse = await app.inject({
        method: 'POST',
        url: '/api/v1/send',
        headers: {
          'X-API-Key': apiKey1,
        },
        payload: {
          to: 'recipient@example.com',
          subject: 'Test Email',
          content: 'This is a test email.',
        },
      });

      const { id: emailId } = sendResponse.json().data;

      const response = await app.inject({
        method: 'GET',
        url: `/api/v1/${emailId}/status`,
        headers: {
          'X-API-Key': apiKey2,
        },
      });

      expect(response.statusCode).toBe(404);
    });
  });
});
