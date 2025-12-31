export interface ApiKey {
  id: string;
  teamId: string;
  name: string;
  keyPrefix: string;
  scopes: string[];
  rateLimit: number;
  expiresAt: Date | null;
  lastUsedAt: Date | null;
  isActive: boolean;
  createdBy: string | null;
  createdAt: Date;
}

export interface ApiKeyWithFullKey extends ApiKey {
  key: string; // Only returned on creation
}

export interface CreateApiKeyInput {
  name: string;
  scopes?: string[];
  rateLimit?: number;
  expiresAt?: Date;
}

export interface UpdateApiKeyInput {
  name?: string;
  scopes?: string[];
  rateLimit?: number;
  isActive?: boolean;
}

export const API_KEY_SCOPES = ['send', 'templates:read', 'templates:write', 'logs:read'] as const;
export type ApiKeyScope = (typeof API_KEY_SCOPES)[number];
