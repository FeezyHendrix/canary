import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { useAuth } from '@/features/auth/auth-context';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { UserPlus } from 'lucide-react';
import { TEAM_ROLE_LABELS, type TeamRole } from '@canary/shared';

interface TeamMember {
  id: string;
  userId: string;
  role: TeamRole;
  joinedAt: Date | null;
  user: {
    id: string;
    email: string;
    name: string | null;
    avatarUrl: string | null;
  } | null;
}

export function TeamSettings() {
  const { user, currentTeam } = useAuth();

  const { data: membersData, isLoading } = useQuery({
    queryKey: ['team-members', currentTeam?.teamId],
    queryFn: () =>
      api.get<{ success: boolean; data: TeamMember[] }>(
        `/api/teams/${currentTeam?.teamId}/members`
      ),
    enabled: !!currentTeam?.teamId,
  });

  const members = membersData?.data || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Team Settings</h1>
        <p className="text-muted-foreground">Manage your team and members</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Team Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div>
              <span className="text-sm text-muted-foreground">Team Name</span>
              <p className="font-medium">{currentTeam?.teamName || 'N/A'}</p>
            </div>
            <div>
              <span className="text-sm text-muted-foreground">Team Slug</span>
              <p className="font-mono text-sm">{currentTeam?.teamSlug || 'N/A'}</p>
            </div>
            <div>
              <span className="text-sm text-muted-foreground">Your Role</span>
              <p className="font-medium">
                {TEAM_ROLE_LABELS[currentTeam?.role as TeamRole] || 'N/A'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Team Members</CardTitle>
            <CardDescription>People who have access to this team</CardDescription>
          </div>
          {(currentTeam?.role === 'owner' || currentTeam?.role === 'admin') && (
            <Button>
              <UserPlus className="mr-2 h-4 w-4" />
              Invite Member
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
          ) : (
            <div className="space-y-3">
              {members.map((member) => {
                const initials =
                  member.user?.name
                    ?.split(' ')
                    .map((n) => n[0])
                    .join('')
                    .toUpperCase() ||
                  member.user?.email?.[0]?.toUpperCase() ||
                  '?';

                return (
                  <div key={member.id} className="flex items-center justify-between py-2">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9">
                        <AvatarImage src={member.user?.avatarUrl || undefined} />
                        <AvatarFallback>{initials}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">
                          {member.user?.name || member.user?.email}
                          {member.userId === user?.id && (
                            <span className="text-xs text-muted-foreground ml-2">(you)</span>
                          )}
                        </p>
                        <p className="text-sm text-muted-foreground">{member.user?.email}</p>
                      </div>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {TEAM_ROLE_LABELS[member.role]}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
