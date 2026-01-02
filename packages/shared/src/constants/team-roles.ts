export const TEAM_ROLES = {
  OWNER: 'owner',
  ADMIN: 'admin',
  MEMBER: 'member',
} as const;

export type TeamRole = (typeof TEAM_ROLES)[keyof typeof TEAM_ROLES];

export const TEAM_ROLE_LIST: TeamRole[] = ['owner', 'admin', 'member'];

export const TEAM_ROLE_LABELS: Record<TeamRole, string> = {
  owner: 'Owner',
  admin: 'Admin',
  member: 'Member',
};

export const TEAM_ROLE_DESCRIPTIONS: Record<TeamRole, string> = {
  owner: 'Full access, can delete team and manage billing',
  admin: 'Can manage members, templates, and adapters',
  member: 'Can view and edit templates',
};

export const TEAM_PERMISSIONS = {
  'team:delete': ['owner'],
  'team:update': ['owner', 'admin'],
  'team:invite': ['owner', 'admin'],
  'team:remove-member': ['owner', 'admin'],
  'team:update-role': ['owner'],
  'templates:create': ['owner', 'admin', 'member'],
  'templates:update': ['owner', 'admin', 'member'],
  'templates:delete': ['owner', 'admin'],
  'adapters:create': ['owner', 'admin'],
  'adapters:update': ['owner', 'admin'],
  'adapters:delete': ['owner', 'admin'],
  'adapters:view-config': ['owner', 'admin'],
  'api-keys:create': ['owner', 'admin'],
  'api-keys:delete': ['owner', 'admin'],
  'api-keys:view': ['owner', 'admin'],
  'webhooks:create': ['owner', 'admin'],
  'webhooks:update': ['owner', 'admin'],
  'webhooks:delete': ['owner', 'admin'],
  'logs:view': ['owner', 'admin', 'member'],
  'logs:resend': ['owner', 'admin'],
} as const;

export type Permission = keyof typeof TEAM_PERMISSIONS;

export function hasPermission(role: TeamRole, permission: Permission): boolean {
  const allowedRoles = TEAM_PERMISSIONS[permission];
  return (allowedRoles as readonly string[]).includes(role);
}
