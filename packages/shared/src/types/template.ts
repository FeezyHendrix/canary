export interface Template {
  id: string;
  teamId: string;
  name: string;
  slug: string;
  description: string | null;
  subject: string;
  designJson: Record<string, unknown>;
  compiledHtml: string | null;
  variables: string[];
  thumbnailUrl: string | null;
  currentVersionId: string | null;
  isActive: boolean;
  createdBy: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface TemplateVersion {
  id: string;
  templateId: string;
  version: number;
  name: string | null;
  subject: string;
  designJson: Record<string, unknown>;
  compiledHtml: string | null;
  variables: string[];
  createdBy: string | null;
  createdAt: Date;
}

export interface CreateTemplateInput {
  name: string;
  slug?: string;
  description?: string;
  subject: string;
  designJson: Record<string, unknown>;
}

export interface UpdateTemplateInput {
  name?: string;
  slug?: string;
  description?: string;
  subject?: string;
  designJson?: Record<string, unknown>;
  isActive?: boolean;
}

export interface TemplatePreviewInput {
  variables: Record<string, unknown>;
}

export interface TemplatePreviewResponse {
  subject: string;
  html: string;
  text: string;
}

export interface TemplateListItem {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  subject: string;
  thumbnailUrl: string | null;
  isActive: boolean;
  updatedAt: Date;
  variables: string[];
}
