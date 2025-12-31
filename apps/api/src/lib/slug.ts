import { nanoid } from 'nanoid';

export function generateSlug(name: string): string {
  const baseSlug = name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');

  const uniqueSuffix = nanoid(6);

  return `${baseSlug}-${uniqueSuffix}`;
}

export function generateTeamSlug(name: string): string {
  return generateSlug(name);
}

export function generateTemplateSlug(name: string): string {
  return generateSlug(name);
}
