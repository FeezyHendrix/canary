import { env } from '../../../lib/env';

const GITHUB_AUTH_URL = 'https://github.com/login/oauth/authorize';
const GITHUB_TOKEN_URL = 'https://github.com/login/oauth/access_token';
const GITHUB_USER_URL = 'https://api.github.com/user';
const GITHUB_EMAILS_URL = 'https://api.github.com/user/emails';

export function getGitHubAuthUrl(state?: string): string {
  const params = new URLSearchParams({
    client_id: env.GITHUB_CLIENT_ID!,
    redirect_uri: `${env.API_URL}/api/auth/github/callback`,
    scope: 'user:email',
  });

  if (state) {
    params.set('state', state);
  }

  return `${GITHUB_AUTH_URL}?${params.toString()}`;
}

export async function getGitHubTokens(code: string) {
  const response = await fetch(GITHUB_TOKEN_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({
      client_id: env.GITHUB_CLIENT_ID,
      client_secret: env.GITHUB_CLIENT_SECRET,
      code,
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to get GitHub tokens');
  }

  return response.json() as Promise<{ access_token: string }>;
}

export async function getGitHubProfile(accessToken: string) {
  const [userResponse, emailsResponse] = await Promise.all([
    fetch(GITHUB_USER_URL, {
      headers: { Authorization: `Bearer ${accessToken}`, Accept: 'application/json' },
    }),
    fetch(GITHUB_EMAILS_URL, {
      headers: { Authorization: `Bearer ${accessToken}`, Accept: 'application/json' },
    }),
  ]);

  if (!userResponse.ok) {
    throw new Error('Failed to get GitHub profile');
  }

  const user = (await userResponse.json()) as {
    id: number;
    name: string | null;
    avatar_url: string;
    email: string | null;
  };

  let email = user.email;

  if (!email && emailsResponse.ok) {
    const emails = (await emailsResponse.json()) as Array<{
      email: string;
      primary: boolean;
      verified: boolean;
    }>;
    const primaryEmail = emails.find((e) => e.primary && e.verified);
    email = primaryEmail?.email || emails[0]?.email || null;
  }

  if (!email) {
    throw new Error('No email found in GitHub profile');
  }

  return {
    provider: 'github' as const,
    id: user.id.toString(),
    email,
    name: user.name,
    avatarUrl: user.avatar_url,
  };
}
