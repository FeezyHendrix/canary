import {
  pgTable,
  uuid,
  text,
  timestamp,
  boolean,
  jsonb,
  integer,
  pgEnum,
  uniqueIndex,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

export const adapterTypeEnum = pgEnum('adapter_type', [
  'sendgrid',
  'resend',
  'mailgun',
  'ses',
  'postmark',
  'smtp',
]);

export const emailStatusEnum = pgEnum('email_status', [
  'queued',
  'sent',
  'delivered',
  'opened',
  'clicked',
  'bounced',
  'failed',
  'spam',
]);

export const teamRoleEnum = pgEnum('team_role', ['owner', 'admin', 'member', 'viewer']);

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: text('email').notNull().unique(),
  name: text('name'),
  avatarUrl: text('avatar_url'),
  googleId: text('google_id').unique(),
  githubId: text('github_id').unique(),
  // Password authentication fields
  passwordHash: text('password_hash'),
  emailVerified: boolean('email_verified').default(false),
  emailVerificationToken: text('email_verification_token'),
  emailVerificationExpiresAt: timestamp('email_verification_expires_at'),
  passwordResetToken: text('password_reset_token'),
  passwordResetExpiresAt: timestamp('password_reset_expires_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const teams = pgTable('teams', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  // Paid feature: remove "Made with Canary" branding from emails
  removeBranding: boolean('remove_branding').default(false),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const teamMembers = pgTable(
  'team_members',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    teamId: uuid('team_id')
      .references(() => teams.id, { onDelete: 'cascade' })
      .notNull(),
    userId: uuid('user_id')
      .references(() => users.id, { onDelete: 'cascade' })
      .notNull(),
    role: teamRoleEnum('role').notNull().default('member'),
    invitedAt: timestamp('invited_at').defaultNow().notNull(),
    joinedAt: timestamp('joined_at'),
  },
  (table) => ({
    teamUserUnique: uniqueIndex('team_user_unique').on(table.teamId, table.userId),
  })
);

export const teamInvites = pgTable('team_invites', {
  id: uuid('id').primaryKey().defaultRandom(),
  teamId: uuid('team_id')
    .references(() => teams.id, { onDelete: 'cascade' })
    .notNull(),
  email: text('email').notNull(),
  role: teamRoleEnum('role').notNull().default('member'),
  token: text('token').notNull().unique(),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const templates = pgTable(
  'templates',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    teamId: uuid('team_id')
      .references(() => teams.id, { onDelete: 'cascade' })
      .notNull(),
    name: text('name').notNull(),
    slug: text('slug').notNull(),
    description: text('description'),
    subject: text('subject').notNull(),
    designJson: jsonb('design_json').notNull(),
    compiledHtml: text('compiled_html'),
    variables: jsonb('variables').$type<string[]>().default([]),
    thumbnailUrl: text('thumbnail_url'),
    currentVersionId: uuid('current_version_id'),
    isActive: boolean('is_active').default(true),
    generatePdf: boolean('generate_pdf').default(false),
    pdfFilename: text('pdf_filename'),
    createdBy: uuid('created_by').references(() => users.id),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => ({
    teamSlugUnique: uniqueIndex('team_slug_unique').on(table.teamId, table.slug),
  })
);

export const templateVersions = pgTable('template_versions', {
  id: uuid('id').primaryKey().defaultRandom(),
  templateId: uuid('template_id')
    .references(() => templates.id, { onDelete: 'cascade' })
    .notNull(),
  version: integer('version').notNull(),
  name: text('name'),
  subject: text('subject').notNull(),
  designJson: jsonb('design_json').notNull(),
  compiledHtml: text('compiled_html'),
  variables: jsonb('variables').$type<string[]>().default([]),
  createdBy: uuid('created_by').references(() => users.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const adapters = pgTable('adapters', {
  id: uuid('id').primaryKey().defaultRandom(),
  teamId: uuid('team_id')
    .references(() => teams.id, { onDelete: 'cascade' })
    .notNull(),
  name: text('name').notNull(),
  type: adapterTypeEnum('type').notNull(),
  configEncrypted: text('config_encrypted').notNull(),
  defaultFrom: text('default_from'),
  isDefault: boolean('is_default').default(false),
  isActive: boolean('is_active').default(true),
  lastTestedAt: timestamp('last_tested_at'),
  lastTestSuccess: boolean('last_test_success'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const apiKeys = pgTable('api_keys', {
  id: uuid('id').primaryKey().defaultRandom(),
  teamId: uuid('team_id')
    .references(() => teams.id, { onDelete: 'cascade' })
    .notNull(),
  name: text('name').notNull(),
  keyPrefix: text('key_prefix').notNull(),
  keyHash: text('key_hash').notNull(),
  scopes: jsonb('scopes').$type<string[]>().default(['send']),
  rateLimit: integer('rate_limit').default(100),
  expiresAt: timestamp('expires_at'),
  lastUsedAt: timestamp('last_used_at'),
  isActive: boolean('is_active').default(true),
  createdBy: uuid('created_by').references(() => users.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const emailLogs = pgTable('email_logs', {
  id: uuid('id').primaryKey().defaultRandom(),
  teamId: uuid('team_id')
    .references(() => teams.id, { onDelete: 'cascade' })
    .notNull(),
  templateId: uuid('template_id').references(() => templates.id, { onDelete: 'set null' }),
  templateVersionId: uuid('template_version_id').references(() => templateVersions.id),
  adapterId: uuid('adapter_id').references(() => adapters.id, { onDelete: 'set null' }),
  apiKeyId: uuid('api_key_id').references(() => apiKeys.id, { onDelete: 'set null' }),
  jobId: text('job_id'),
  toAddresses: jsonb('to_addresses').$type<string[]>().notNull(),
  fromAddress: text('from_address').notNull(),
  subject: text('subject').notNull(),
  variables: jsonb('variables'),
  status: emailStatusEnum('status').default('queued').notNull(),
  hasPdfAttachment: boolean('has_pdf_attachment').default(false),
  providerMessageId: text('provider_message_id'),
  providerResponse: jsonb('provider_response'),
  errorMessage: text('error_message'),
  errorCode: text('error_code'),
  sentAt: timestamp('sent_at'),
  deliveredAt: timestamp('delivered_at'),
  openedAt: timestamp('opened_at'),
  clickedAt: timestamp('clicked_at'),
  bouncedAt: timestamp('bounced_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const webhooks = pgTable('webhooks', {
  id: uuid('id').primaryKey().defaultRandom(),
  teamId: uuid('team_id')
    .references(() => teams.id, { onDelete: 'cascade' })
    .notNull(),
  name: text('name').notNull(),
  url: text('url').notNull(),
  secret: text('secret').notNull(),
  events: jsonb('events').$type<string[]>().default([]),
  isActive: boolean('is_active').default(true),
  lastTriggeredAt: timestamp('last_triggered_at'),
  lastSuccessAt: timestamp('last_success_at'),
  consecutiveFailures: integer('consecutive_failures').default(0),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const webhookDeliveries = pgTable('webhook_deliveries', {
  id: uuid('id').primaryKey().defaultRandom(),
  webhookId: uuid('webhook_id')
    .references(() => webhooks.id, { onDelete: 'cascade' })
    .notNull(),
  event: text('event').notNull(),
  payload: jsonb('payload').notNull(),
  responseStatus: integer('response_status'),
  responseBody: text('response_body'),
  success: boolean('success').notNull(),
  attemptCount: integer('attempt_count').default(1),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const sessions = pgTable('sessions', {
  id: text('id').primaryKey(),
  userId: uuid('user_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull(),
  activeTeamId: uuid('active_team_id').references(() => teams.id),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const usersRelations = relations(users, ({ many }) => ({
  teamMembers: many(teamMembers),
  sessions: many(sessions),
}));

export const teamsRelations = relations(teams, ({ many }) => ({
  members: many(teamMembers),
  templates: many(templates),
  adapters: many(adapters),
  apiKeys: many(apiKeys),
  webhooks: many(webhooks),
  emailLogs: many(emailLogs),
}));

export const teamMembersRelations = relations(teamMembers, ({ one }) => ({
  team: one(teams, {
    fields: [teamMembers.teamId],
    references: [teams.id],
  }),
  user: one(users, {
    fields: [teamMembers.userId],
    references: [users.id],
  }),
}));

export const templatesRelations = relations(templates, ({ one, many }) => ({
  team: one(teams, {
    fields: [templates.teamId],
    references: [teams.id],
  }),
  versions: many(templateVersions),
  emailLogs: many(emailLogs),
}));

export const templateVersionsRelations = relations(templateVersions, ({ one }) => ({
  template: one(templates, {
    fields: [templateVersions.templateId],
    references: [templates.id],
  }),
}));

export const adaptersRelations = relations(adapters, ({ one, many }) => ({
  team: one(teams, {
    fields: [adapters.teamId],
    references: [teams.id],
  }),
  emailLogs: many(emailLogs),
}));

export const webhooksRelations = relations(webhooks, ({ one, many }) => ({
  team: one(teams, {
    fields: [webhooks.teamId],
    references: [teams.id],
  }),
  deliveries: many(webhookDeliveries),
}));

export const webhookDeliveriesRelations = relations(webhookDeliveries, ({ one }) => ({
  webhook: one(webhooks, {
    fields: [webhookDeliveries.webhookId],
    references: [webhooks.id],
  }),
}));
