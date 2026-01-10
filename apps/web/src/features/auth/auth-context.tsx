import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api-client';
import type { SessionUser, TeamMembership } from '@canary/shared';

interface AuthContextType {
  user: SessionUser | null;
  teams: TeamMembership[];
  currentTeam: TeamMembership | null;
  isLoading: boolean;
  isFirstTimeSetup: boolean | null;
  login: () => void;
  loginWithEmail: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  switchTeam: (teamId: string) => Promise<void>;
  refetch: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [teams, setTeams] = useState<TeamMembership[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFirstTimeSetup, setIsFirstTimeSetup] = useState<boolean | null>(null);

  const fetchUser = useCallback(async () => {
    try {
      const response = await api.get<{
        success: boolean;
        data: { user: SessionUser; teams: TeamMembership[] };
      }>('/api/auth/me');
      if (response.success) {
        setUser(response.data.user);
        setTeams(response.data.teams);
      }
    } catch {
      setUser(null);
      setTeams([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const checkSetupStatus = useCallback(async () => {
    try {
      const response = await api.get<{
        success: boolean;
        data: { isFirstTimeSetup: boolean };
      }>('/api/auth/setup-status');
      if (response.success) {
        setIsFirstTimeSetup(response.data.isFirstTimeSetup);
      }
    } catch {
      setIsFirstTimeSetup(false);
    }
  }, []);

  useEffect(() => {
    fetchUser();
    checkSetupStatus();
  }, [fetchUser, checkSetupStatus]);

  const login = () => {
    window.location.href = '/api/auth/google';
  };

  const loginWithEmail = async (email: string, password: string) => {
    await api.post('/api/auth/login', { email, password });
    await fetchUser();
  };

  const logout = async () => {
    await api.post('/api/auth/logout');
    setUser(null);
    setTeams([]);
    window.location.href = '/login';
  };

  const switchTeam = async (teamId: string) => {
    await api.post('/api/auth/switch-team', { teamId });
    await fetchUser();
  };

  const currentTeam = user?.activeTeamId
    ? (teams.find((t) => t.teamId === user.activeTeamId) ?? null)
    : (teams[0] ?? null);

  return (
    <AuthContext.Provider
      value={{
        user,
        teams,
        currentTeam,
        isLoading,
        isFirstTimeSetup,
        login,
        loginWithEmail,
        logout,
        switchTeam,
        refetch: fetchUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
