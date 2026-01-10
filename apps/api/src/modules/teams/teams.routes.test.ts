import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { getTestApp, closeTestApp, createTestUser, createTestTeam } from '../../test/utils';
import type { FastifyInstance } from 'fastify';

describe('teams routes', () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    app = await getTestApp();
  });

  afterAll(async () => {
    await closeTestApp();
  });

  describe('GET /api/teams', () => {
    it('should list user teams', async () => {
      const { sessionId } = await createTestUser();

      const response = await app.inject({
        method: 'GET',
        url: '/api/teams',
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
        url: '/api/teams',
      });

      expect(response.statusCode).toBe(401);
    });
  });

  describe('GET /api/teams/:id', () => {
    it('should get team by id', async () => {
      const { user, teamId, sessionId } = await createTestUser();

      const response = await app.inject({
        method: 'GET',
        url: `/api/teams/${teamId}`,
        cookies: { session: sessionId },
      });

      expect(response.statusCode).toBe(200);
      expect(response.json()).toMatchObject({
        success: true,
        data: {
          id: teamId,
          name: expect.any(String),
          slug: expect.any(String),
        },
      });
    });

    it('should return 404 for non-existent team', async () => {
      const { sessionId } = await createTestUser();

      const response = await app.inject({
        method: 'GET',
        url: '/api/teams/non-existent-id',
        cookies: { session: sessionId },
      });

      expect(response.statusCode).toBe(404);
    });

    it('should not return team from non-member', async () => {
      const { user: user1, teamId: teamId1, sessionId: sessionId1 } = await createTestUser();
      const { sessionId: sessionId2 } = await createTestUser();

      const response = await app.inject({
        method: 'GET',
        url: `/api/teams/${teamId1}`,
        cookies: { session: sessionId2 },
      });

      expect(response.statusCode).toBe(404);
    });
  });

  describe('PUT /api/teams/:id', () => {
    it('should update team name', async () => {
      const { teamId, sessionId } = await createTestUser();

      const response = await app.inject({
        method: 'PUT',
        url: `/api/teams/${teamId}`,
        cookies: { session: sessionId },
        payload: {
          name: 'Updated Team Name',
        },
      });

      expect(response.statusCode).toBe(200);
      expect(response.json()).toMatchObject({
        success: true,
        data: {
          name: 'Updated Team Name',
        },
      });
    });

    it('should return 404 for non-existent team', async () => {
      const { sessionId } = await createTestUser();

      const response = await app.inject({
        method: 'PUT',
        url: '/api/teams/non-existent-id',
        cookies: { session: sessionId },
        payload: {
          name: 'Updated Name',
        },
      });

      expect(response.statusCode).toBe(404);
    });
  });

  describe('GET /api/teams/:id/members', () => {
    it('should list team members', async () => {
      const { user, teamId, sessionId } = await createTestUser();

      const response = await app.inject({
        method: 'GET',
        url: `/api/teams/${teamId}/members`,
        cookies: { session: sessionId },
      });

      expect(response.statusCode).toBe(200);
      expect(response.json()).toMatchObject({
        success: true,
        data: expect.any(Array),
      });
      expect(response.json().data.length).toBeGreaterThanOrEqual(1);
      const owner = response.json().data.find((m: any) => m.userId === user.id);
      expect(owner).toBeDefined();
      expect(owner.role).toBe('owner');
    });

    it('should require authentication', async () => {
      const { teamId } = await createTestUser();

      const response = await app.inject({
        method: 'GET',
        url: `/api/teams/${teamId}/members`,
      });

      expect(response.statusCode).toBe(401);
    });
  });
});
