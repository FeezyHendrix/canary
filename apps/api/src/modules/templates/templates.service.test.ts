import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { getTestApp, closeTestApp, createTestUser } from '../../test/utils';
import {
  createTemplate,
  getTemplate,
  listTemplates,
  updateTemplate,
  deleteTemplate,
} from './templates.service';
import { templates } from '../../db/schema';
import { eq } from 'drizzle-orm';
import type { FastifyInstance } from 'fastify';

describe('templates service', () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    app = await getTestApp();
  });

  afterAll(async () => {
    await closeTestApp();
  });

  describe('createTemplate', () => {
    it('should create template with valid data', async () => {
      const { user, teamId } = await createTestUser();

      const template = await createTemplate(teamId, user.id, {
        name: 'Test Template',
        subject: 'Test Subject',
        designJson: { blocks: [] },
      });

      expect(template.id).toBeDefined();
      expect(template.name).toBe('Test Template');
      expect(template.teamId).toBe(teamId);
      expect(template.currentVersionId).toBeDefined();
    });

    it('should extract variables from design', async () => {
      const { user, teamId } = await createTestUser();

      const template = await createTemplate(teamId, user.id, {
        name: 'Template with Variables',
        subject: 'Hello {{name}}',
        designJson: {
          blocks: [
            {
              type: 'text',
              content: 'Dear {{name}}, thank you for your purchase of {{product}}.',
            },
          ],
        },
      });

      expect(template.variables).toContain('name');
      expect(template.variables).toContain('product');
    });

    it('should reject duplicate slug', async () => {
      const { user, teamId } = await createTestUser();

      await createTemplate(teamId, user.id, {
        name: 'Template 1',
        subject: 'Subject 1',
        designJson: { blocks: [] },
      });

      await expect(
        createTemplate(teamId, user.id, {
          name: 'Template 2',
          slug: 'template-1',
          subject: 'Subject 2',
          designJson: { blocks: [] },
        })
      ).rejects.toThrow();
    });
  });

  describe('getTemplate', () => {
    it('should get existing template', async () => {
      const { user, teamId } = await createTestUser();
      const created = await createTemplate(teamId, user.id, {
        name: 'Test Template',
        subject: 'Test Subject',
        designJson: { blocks: [] },
      });

      const template = await getTemplate(teamId, created.id);

      expect(template).toBeDefined();
      expect(template?.id).toBe(created.id);
      expect(template?.name).toBe('Test Template');
    });

    it('should throw NotFoundError for non-existent template', async () => {
      const { teamId } = await createTestUser();

      await expect(getTemplate(teamId, 'non-existent-id')).rejects.toThrow('Template not found');
    });

    it('should not return template from other team', async () => {
      const { user: user1, teamId: teamId1 } = await createTestUser();
      const { teamId: teamId2 } = await createTestUser();

      const created = await createTemplate(teamId1, user1.id, {
        name: 'Team 1 Template',
        subject: 'Subject',
        designJson: { blocks: [] },
      });

      await expect(getTemplate(teamId2, created.id)).rejects.toThrow('Template not found');
    });
  });

  describe('listTemplates', () => {
    it('should list all templates for team', async () => {
      const { user, teamId } = await createTestUser();

      await createTemplate(teamId, user.id, {
        name: 'Template 1',
        subject: 'Subject 1',
        designJson: { blocks: [] },
      });

      await createTemplate(teamId, user.id, {
        name: 'Template 2',
        subject: 'Subject 2',
        designJson: { blocks: [] },
      });

      const result = await listTemplates(teamId, {
        page: 1,
        pageSize: 10,
      });

      expect(result.items).toHaveLength(2);
      expect(result.total).toBe(2);
      expect(result.totalPages).toBe(1);
    });

    it('should paginate templates', async () => {
      const { user, teamId } = await createTestUser();

      for (let i = 1; i <= 15; i++) {
        await createTemplate(teamId, user.id, {
          name: `Template ${i}`,
          subject: `Subject ${i}`,
          designJson: { blocks: [] },
        });
      }

      const page1 = await listTemplates(teamId, { page: 1, pageSize: 10 });
      const page2 = await listTemplates(teamId, { page: 2, pageSize: 10 });

      expect(page1.items).toHaveLength(10);
      expect(page2.items).toHaveLength(5);
      expect(page1.total).toBe(15);
      expect(page2.total).toBe(15);
    });

    it('should filter by search term', async () => {
      const { user, teamId } = await createTestUser();

      await createTemplate(teamId, user.id, {
        name: 'Welcome Email',
        subject: 'Subject',
        designJson: { blocks: [] },
      });

      await createTemplate(teamId, user.id, {
        name: 'Reset Password',
        subject: 'Subject',
        designJson: { blocks: [] },
      });

      const result = await listTemplates(teamId, {
        page: 1,
        pageSize: 10,
        search: 'Welcome',
      });

      expect(result.items).toHaveLength(1);
      expect(result.items[0].name).toBe('Welcome Email');
    });

    it('should filter by active status', async () => {
      const { user, teamId } = await createTestUser();

      const active = await createTemplate(teamId, user.id, {
        name: 'Active Template',
        subject: 'Subject',
        designJson: { blocks: [] },
      });

      await updateTemplate(teamId, active.id, user.id, { isActive: false });

      const activeResult = await listTemplates(teamId, {
        page: 1,
        pageSize: 10,
        isActive: true,
      });

      const inactiveResult = await listTemplates(teamId, {
        page: 1,
        pageSize: 10,
        isActive: false,
      });

      expect(activeResult.items).toHaveLength(0);
      expect(inactiveResult.items).toHaveLength(1);
    });
  });

  describe('updateTemplate', () => {
    it('should update template fields', async () => {
      const { user, teamId } = await createTestUser();

      const created = await createTemplate(teamId, user.id, {
        name: 'Original Name',
        subject: 'Original Subject',
        designJson: { blocks: [] },
      });

      const updated = await updateTemplate(teamId, created.id, user.id, {
        name: 'Updated Name',
        subject: 'Updated Subject',
      });

      expect(updated.name).toBe('Updated Name');
      expect(updated.subject).toBe('Updated Subject');
    });

    it('should update design and variables', async () => {
      const { user, teamId } = await createTestUser();

      const created = await createTemplate(teamId, user.id, {
        name: 'Template',
        subject: 'Subject',
        designJson: { blocks: [{ type: 'text', content: 'Hello' }] },
      });

      const updated = await updateTemplate(teamId, created.id, user.id, {
        designJson: {
          blocks: [{ type: 'text', content: 'Hello {{name}}, your order {{orderId}} is ready.' }],
        },
      });

      expect(updated.variables).toContain('name');
      expect(updated.variables).toContain('orderId');
    });

    it('should reject duplicate slug on update', async () => {
      const { user, teamId } = await createTestUser();

      const template1 = await createTemplate(teamId, user.id, {
        name: 'Template 1',
        subject: 'Subject 1',
        designJson: { blocks: [] },
      });

      await createTemplate(teamId, user.id, {
        name: 'Template 2',
        subject: 'Subject 2',
        designJson: { blocks: [] },
      });

      await expect(
        updateTemplate(teamId, template1.id, user.id, {
          slug: 'template-2',
        })
      ).rejects.toThrow();
    });
  });

  describe('deleteTemplate', () => {
    it('should delete template', async () => {
      const { user, teamId } = await createTestUser();

      const created = await createTemplate(teamId, user.id, {
        name: 'Template',
        subject: 'Subject',
        designJson: { blocks: [] },
      });

      const deleted = await deleteTemplate(teamId, created.id);

      expect(deleted.id).toBe(created.id);

      const found = await getTemplate(teamId, created.id);
      expect(found).toBeUndefined();
    });

    it('should throw NotFoundError for non-existent template', async () => {
      const { teamId } = await createTestUser();

      await expect(deleteTemplate(teamId, 'non-existent-id')).rejects.toThrow('Template not found');
    });
  });
});
