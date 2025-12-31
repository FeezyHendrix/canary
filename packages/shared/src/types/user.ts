import type { TeamRole } from '../constants/team-roles';

export interface User {
  id: string;
  email: string;
  name: string | null;
  avatarUrl: string | null;
  googleId: string | null;
  githubId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface SessionUser {
  id: string;
  email: string;
  name: string | null;
  avatarUrl: string | null;
  activeTeamId: string | null;
}

export interface AuthResponse {
  user: SessionUser;
  teams: TeamMembership[];
}

export interface TeamMembership {
  teamId: string;
  teamName: string;
  teamSlug: string;
  role: TeamRole;
}
