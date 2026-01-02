import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { api } from '@/lib/api-client';
import { useAuth } from './auth-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

interface Team {
  id: string;
  name: string;
  slug: string;
}

export function AcceptInvite() {
  const [searchParams] = useSearchParams();
  const { user, isLoading: authLoading, refetch } = useAuth();
  const token = searchParams.get('token');

  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'not-logged-in'>(
    'loading'
  );
  const [team, setTeam] = useState<Team | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

  const acceptMutation = useMutation({
    mutationFn: () =>
      api.post<{ success: boolean; data: Team }>(`/api/teams/accept-invite/${token}`),
    onSuccess: (response) => {
      setTeam(response.data);
      setStatus('success');
      refetch();
    },
    onError: (error: Error & { response?: { data?: { error?: string } } }) => {
      setErrorMessage(error.response?.data?.error || 'Failed to accept invitation');
      setStatus('error');
    },
  });

  useEffect(() => {
    if (!token) {
      setErrorMessage('Invalid invitation link');
      setStatus('error');
      return;
    }

    if (authLoading) return;

    if (!user) {
      setStatus('not-logged-in');
      return;
    }

    acceptMutation.mutate();
  }, [token, user, authLoading]);

  if (authLoading || status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="mt-4 text-muted-foreground">Processing invitation...</p>
        </div>
      </div>
    );
  }

  if (status === 'not-logged-in') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle>Sign in to Accept Invite</CardTitle>
            <CardDescription>You need to sign in to accept this team invitation</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground text-center">
              Please sign in with the email address the invitation was sent to.
            </p>
            <Button asChild className="w-full">
              <Link to={`/login?redirect=${encodeURIComponent(`/invite?token=${token}`)}`}>
                Sign In to Continue
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (status === 'success' && team) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircle2 className="h-6 w-6 text-green-600" />
            </div>
            <CardTitle>Welcome to {team.name}!</CardTitle>
            <CardDescription>You've successfully joined the team</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link to="/">Go to Dashboard</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
            <XCircle className="h-6 w-6 text-red-600" />
          </div>
          <CardTitle>Invitation Error</CardTitle>
          <CardDescription>{errorMessage}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground text-center">
            The invitation may have expired or already been used. Please contact the team
            administrator for a new invitation.
          </p>
          <Button asChild variant="outline" className="w-full">
            <Link to="/">Go to Dashboard</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
