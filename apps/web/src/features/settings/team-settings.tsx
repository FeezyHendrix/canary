import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { useAuth } from '@/features/auth/auth-context';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { UserPlus, X, Trash2, Loader2 } from 'lucide-react';
import { TEAM_ROLE_LABELS, type TeamRole } from '@canary/shared';
import { toast } from '@/components/ui/toaster';

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

interface TeamInvite {
  id: string;
  email: string;
  role: TeamRole;
  expiresAt: string;
  createdAt: string;
}

export function TeamSettings() {
  const { user, currentTeam } = useAuth();
  const queryClient = useQueryClient();
  const [showInviteModal, setShowInviteModal] = useState(false);

  const { data: membersData, isLoading } = useQuery({
    queryKey: ['team-members', currentTeam?.teamId],
    queryFn: () =>
      api.get<{ success: boolean; data: TeamMember[] }>(
        `/api/teams/${currentTeam?.teamId}/members`
      ),
    enabled: !!currentTeam?.teamId,
  });

  const { data: invitesData } = useQuery({
    queryKey: ['team-invites', currentTeam?.teamId],
    queryFn: () =>
      api.get<{ success: boolean; data: TeamInvite[] }>(
        `/api/teams/${currentTeam?.teamId}/invites`
      ),
    enabled: !!currentTeam?.teamId,
  });

  const removeMemberMutation = useMutation({
    mutationFn: (userId: string) =>
      api.delete(`/api/teams/${currentTeam?.teamId}/members/${userId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team-members'] });
      toast({ title: 'Member removed' });
    },
    onError: () => {
      toast({ title: 'Failed to remove member', variant: 'destructive' });
    },
  });

  const cancelInviteMutation = useMutation({
    mutationFn: (inviteId: string) =>
      api.delete(`/api/teams/${currentTeam?.teamId}/invites/${inviteId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team-invites'] });
      toast({ title: 'Invite cancelled' });
    },
    onError: () => {
      toast({ title: 'Failed to cancel invite', variant: 'destructive' });
    },
  });

  const members = membersData?.data || [];
  const pendingInvites = invitesData?.data || [];
  const isOwnerOrAdmin = currentTeam?.role === 'owner' || currentTeam?.role === 'admin';

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
          {isOwnerOrAdmin && (
            <Button onClick={() => setShowInviteModal(true)}>
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
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-muted-foreground">
                        {TEAM_ROLE_LABELS[member.role]}
                      </span>
                      {isOwnerOrAdmin && member.userId !== user?.id && member.role !== 'owner' && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-destructive"
                          onClick={() => removeMemberMutation.mutate(member.userId)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {pendingInvites.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Pending Invites</CardTitle>
            <CardDescription>Invitations waiting to be accepted</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {pendingInvites.map((invite) => (
                <div key={invite.id} className="flex items-center justify-between py-2">
                  <div>
                    <p className="font-medium">{invite.email}</p>
                    <p className="text-sm text-muted-foreground">
                      Invited as {TEAM_ROLE_LABELS[invite.role]} · Expires{' '}
                      {new Date(invite.expiresAt).toLocaleDateString()}
                    </p>
                  </div>
                  {isOwnerOrAdmin && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => cancelInviteMutation.mutate(invite.id)}
                    >
                      Cancel
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {showInviteModal && (
        <InviteModal teamId={currentTeam?.teamId || ''} onClose={() => setShowInviteModal(false)} />
      )}
    </div>
  );
}

interface InviteModalProps {
  teamId: string;
  onClose: () => void;
}

interface InviteResponse {
  id: string;
  email: string;
  emailSent: boolean;
  inviteUrl: string;
}

function InviteModal({ teamId, onClose }: InviteModalProps) {
  const queryClient = useQueryClient();
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'admin' | 'member' | 'viewer'>('member');
  const [inviteResult, setInviteResult] = useState<InviteResponse | null>(null);

  const inviteMutation = useMutation({
    mutationFn: () =>
      api.post<{ success: boolean; data: InviteResponse }>(`/api/teams/${teamId}/invite`, {
        email,
        role,
      }),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['team-invites'] });
      if (response.data.emailSent) {
        toast({ title: 'Invite sent', description: `Invitation emailed to ${email}` });
        onClose();
      } else {
        setInviteResult(response.data);
      }
    },
    onError: (error: Error & { response?: { data?: { error?: string } } }) => {
      const message = error.response?.data?.error || 'Failed to send invite';
      toast({ title: message, variant: 'destructive' });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    inviteMutation.mutate();
  };

  const copyToClipboard = () => {
    if (inviteResult?.inviteUrl) {
      navigator.clipboard.writeText(inviteResult.inviteUrl);
      toast({ title: 'Link copied to clipboard' });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-background rounded-lg shadow-lg w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">
            {inviteResult ? 'Share Invite Link' : 'Invite Team Member'}
          </h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        {inviteResult ? (
          <div className="space-y-4">
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                No email adapter configured. Share this link manually with{' '}
                <strong>{inviteResult.email}</strong>:
              </p>
            </div>
            <div className="flex gap-2">
              <Input value={inviteResult.inviteUrl} readOnly className="font-mono text-sm" />
              <Button onClick={copyToClipboard} variant="outline">
                Copy
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              This invite expires in 7 days. Configure an email adapter in Settings → Adapters to
              send invites automatically.
            </p>
            <Button onClick={onClose} className="w-full">
              Done
            </Button>
          </div>
        ) : (
          <>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="colleague@company.com"
                  required
                />
              </div>

              <div>
                <Label htmlFor="role">Role</Label>
                <select
                  id="role"
                  value={role}
                  onChange={(e) => setRole(e.target.value as 'admin' | 'member' | 'viewer')}
                  className="w-full mt-1 border rounded-md px-3 py-2 bg-background"
                >
                  <option value="viewer">Viewer - Read-only access to templates and logs</option>
                  <option value="member">Member - Can view and edit templates</option>
                  <option value="admin">Admin - Can manage team settings</option>
                </select>
              </div>

              <div className="flex gap-3 pt-2">
                <Button type="button" variant="outline" className="flex-1" onClick={onClose}>
                  Cancel
                </Button>
                <Button type="submit" className="flex-1" disabled={inviteMutation.isPending}>
                  {inviteMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    'Send Invite'
                  )}
                </Button>
              </div>
            </form>

            <p className="text-sm text-muted-foreground mt-4">
              An email will be sent with a link to join your team. The invite expires in 7 days.
            </p>
          </>
        )}
      </div>
    </div>
  );
}
