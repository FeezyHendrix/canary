import { randomBytes, createHash } from 'crypto';

const KEY_PREFIX_LIVE = 'canary_live_';
const KEY_PREFIX_TEST = 'canary_test_';
const KEY_LENGTH = 32;

export function generateApiKey(isTest = false): { key: string; prefix: string; hash: string } {
  const prefix = isTest ? KEY_PREFIX_TEST : KEY_PREFIX_LIVE;
  const randomPart = randomBytes(KEY_LENGTH).toString('base64url');
  const key = `${prefix}${randomPart}`;

  return {
    key,
    prefix: key.substring(0, 16),
    hash: hashApiKey(key),
  };
}

export function hashApiKey(key: string): string {
  return createHash('sha256').update(key).digest('hex');
}

export function isValidApiKeyFormat(key: string): boolean {
  return key.startsWith(KEY_PREFIX_LIVE) || key.startsWith(KEY_PREFIX_TEST);
}
