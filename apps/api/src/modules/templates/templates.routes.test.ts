import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { getTestApp, closeTestApp, createTestUser } from '../../test/utils';
import type { FastifyInstance } from 'fastify';

describe('templates routes', () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    app = await getTestApp();
  });

  afterAll(async () => {
    await closeTestApp();
  });

  describe('GET /api/templates', () => {
    it('should list templates', async () => {
      const { user, teamId, sessionId } = await createTestUser();
      const { createTemplate } = await import('./templates.service');

      await createTemplate(teamId, user.id, {
        name: 'Test Template',
        subject: 'Subject',
        designJson: { blocks: [] },
      });

      const response = await app.inject({
        method: 'GET',
        url: '/api/templates',
        cookies: { session: sessionId },
      });

      expect(response.statusCode).toBe(200);
      expect(response.json()).toMatchObject({
        success: true,
        data: {
          items: expect.any(Array),
          total: expect.any(Number),
          page: expect.any(Number),
          pageSize: expect.any(Number),
          totalPages: expect.any(Number),
        },
      });
    });

    it('should require authentication', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/templates',
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

  describe('POST /api/templates', () => {
    it('should create template', async () => {
      const { sessionId } = await createTestUser();

      const response = await app.inject({
        method: 'POST',
        url: '/api/templates',
        cookies: { session: sessionId },
        payload: {
          name: 'New Template',
          subject: 'New Subject',
          designJson: { blocks: [] },
        },
      });

      expect(response.statusCode).toBe(200);
      expect(response.json()).toMatchObject({
        success: true,
        data: {
          name: 'New Template',
          subject: 'New Subject',
          id: expect.any(String),
        },
      });
    });

    it('should validate required fields', async () => {
      const { sessionId } = await createTestUser();

      const response = await app.inject({
        method: 'POST',
        url: '/api/templates',
        cookies: { session: sessionId },
        payload: {
          name: 'Template',
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

  describe('GET /api/templates/:id', () => {
    it('should get template by id', async () => {
      const { user, teamId, sessionId } = await createTestUser();
      const { createTemplate } = await import('./templates.service');

      const created = await createTemplate(teamId, user.id, {
        name: 'Test Template',
        subject: 'Subject',
        designJson: { blocks: [] },
      });

      const response = await app.inject({
        method: 'GET',
        url: `/api/templates/${created.id}`,
        cookies: { session: sessionId },
      });

      expect(response.statusCode).toBe(200);
      expect(response.json()).toMatchObject({
        success: true,
        data: {
          id: created.id,
          name: 'Test Template',
        },
      });
    });

    it('should return 404 for non-existent template', async () => {
      const { sessionId } = await createTestUser();

      const response = await app.inject({
        method: 'GET',
        url: '/api/templates/non-existent-id',
        cookies: { session: sessionId },
      });

      expect(response.statusCode).toBe(404);
      expect(response.json()).toMatchObject({
        success: false,
        error: {
          code: 'NOT_FOUND',
        },
      });
    });

    it('should not return template from other team', async () => {
      const { user: user1, teamId: teamId1, sessionId: sessionId1 } = await createTestUser();
      const { user: user2, teamId: teamId2, sessionId: sessionId2 } = await createTestUser();
      const { createTemplate } = await import('./templates.service');

      const created = await createTemplate(teamId1, user1.id, {
        name: 'Team 1 Template',
        subject: 'Subject',
        designJson: { blocks: [] },
      });

      const response = await app.inject({
        method: 'GET',
        url: `/api/templates/${created.id}`,
        cookies: { session: sessionId2 },
      });

      expect(response.statusCode).toBe(404);
    });
  });

  describe('PUT /api/templates/:id', () => {
    it('should update template', async () => {
      const { user, teamId, sessionId } = await createTestUser();
      const { createTemplate } = await import('./templates.service');

      const created = await createTemplate(teamId, user.id, {
        name: 'Original Name',
        subject: 'Subject',
        designJson: { blocks: [] },
      });

      const response = await app.inject({
        method: 'PUT',
        url: `/api/templates/${created.id}`,
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

    it('should return 404 for non-existent template', async () => {
      const { sessionId } = await createTestUser();

      const response = await app.inject({
        method: 'PUT',
        url: '/api/templates/non-existent-id',
        cookies: { session: sessionId },
        payload: {
          name: 'Updated Name',
        },
      });

      expect(response.statusCode).toBe(404);
    });
  });

  describe('DELETE /api/templates/:id', () => {
    it('should delete template', async () => {
      const { user, teamId, sessionId } = await createTestUser();
      const { createTemplate } = await import('./templates.service');

      const created = await createTemplate(teamId, user.id, {
        name: 'Test Template',
        subject: 'Subject',
        designJson: { blocks: [] },
      });

      const response = await app.inject({
        method: 'DELETE',
        url: `/api/templates/${created.id}`,
        cookies: { session: sessionId },
      });

      expect(response.statusCode).toBe(200);
      expect(response.json()).toMatchObject({
        success: true,
      });
    });

    it('should return 404 for non-existent template', async () => {
      const { sessionId } = await createTestUser();

      const response = await app.inject({
        method: 'DELETE',
        url: '/api/templates/non-existent-id',
        cookies: { session: sessionId },
      });

      expect(response.statusCode).toBe(404);
    });
  });

  describe('POST /api/templates/:id/duplicate', () => {
    it('should duplicate template', async () => {
      const { user, teamId, sessionId } = await createTestUser();
      const { createTemplate } = await import('./templates.service');

      const created = await createTemplate(teamId, user.id, {
        name: 'Original Template',
        subject: 'Subject',
        designJson: { blocks: [] },
      });

      const response = await app.inject({
        method: 'POST',
        url: `/api/templates/${created.id}/duplicate`,
        cookies: { session: sessionId },
      });

      expect(response.statusCode).toBe(200);
      expect(response.json()).toMatchObject({
        success: true,
        data: {
          name: 'Original Template (Copy)',
          slug: expect.stringContaining('copy'),
        },
      });
    });
  });

  describe('GET /api/templates/:id/versions', () => {
    it('should list template versions', async () => {
      const { user, teamId, sessionId } = await createTestUser();
      const { createTemplate, createVersion } = await import('./templates.service');

      const created = await createTemplate(teamId, user.id, {
        name: 'Test Template',
        subject: 'Subject',
        designJson: { blocks: [] },
      });

      await createVersion(teamId, created.id, user.id);
      await createVersion(teamId, created.id, user.id);

      const response = await app.inject({
        method: 'GET',
        url: `/api/templates/${created.id}/versions`,
        cookies: { session: sessionId },
      });

      expect(response.statusCode).toBe(200);
      expect(response.json()).toMatchObject({
        success: true,
        data: expect.any(Array),
      });
      expect(response.json().data.length).toBeGreaterThanOrEqual(3);
    });
  });
});
