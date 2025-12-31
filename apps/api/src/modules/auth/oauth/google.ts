import { env } from '../../../lib/env';

const GOOGLE_AUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth';
const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token';
const GOOGLE_USERINFO_URL = 'https://www.googleapis.com/oauth2/v2/userinfo';

export function getGoogleAuthUrl(state?: string): string {
  const params = new URLSearchParams({
    client_id: env.GOOGLE_CLIENT_ID!,
    redirect_uri: `${env.API_URL}/api/auth/google/callback`,
    response_type: 'code',
    scope: 'email profile',
    access_type: 'offline',
    prompt: 'consent',
  });

  if (state) {
    params.set('state', state);
  }

  return `${GOOGLE_AUTH_URL}?${params.toString()}`;
}

export async function getGoogleTokens(code: string) {
  const response = await fetch(GOOGLE_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: env.GOOGLE_CLIENT_ID!,
      client_secret: env.GOOGLE_CLIENT_SECRET!,
      code,
      grant_type: 'authorization_code',
      redirect_uri: `${env.API_URL}/api/auth/google/callback`,
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to get Google tokens');
  }

  return response.json() as Promise<{ access_token: string; refresh_token?: string }>;
}

export async function getGoogleProfile(accessToken: string) {
  const response = await fetch(GOOGLE_USERINFO_URL, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!response.ok) {
    throw new Error('Failed to get Google profile');
  }

  const data = (await response.json()) as {
    id: string;
    email: string;
    name: string;
    picture: string;
  };

  return {
    provider: 'google' as const,
    id: data.id,
    email: data.email,
    name: data.name,
    avatarUrl: data.picture,
  };
}
