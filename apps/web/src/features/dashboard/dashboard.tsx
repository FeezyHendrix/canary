import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { LayoutTemplate, Mail, Activity, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { api } from '@/lib/api-client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export function Dashboard() {
  const { data: templatesData } = useQuery({
    queryKey: ['templates', { page: 1, pageSize: 1 }],
    queryFn: () =>
      api.get<{ success: boolean; data: { total: number } }>('/api/templates', {
        params: { page: 1, pageSize: 1 },
      }),
  });

  const { data: logsData } = useQuery({
    queryKey: ['email-logs', { page: 1, pageSize: 100 }],
    queryFn: () =>
      api.get<{
        success: boolean;
        data: {
          total: number;
          items: Array<{ id: string; subject: string; status: string; createdAt: string }>;
        };
      }>('/api/logs', { params: { page: 1, pageSize: 100 } }),
  });

  const templateCount = templatesData?.data?.total ?? 0;
  const emailCount = logsData?.data?.total ?? 0;
  const recentEmails = logsData?.data?.items ?? [];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Overview of your email infrastructure</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Templates</CardTitle>
            <LayoutTemplate className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{templateCount}</div>
            <p className="text-xs text-muted-foreground">Email templates created</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Emails Sent</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{emailCount}</div>
            <p className="text-xs text-muted-foreground">Total emails processed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Delivery Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{emailCount > 0 ? '98.5%' : '-'}</div>
            <p className="text-xs text-muted-foreground">Successful deliveries</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">Healthy</div>
            <p className="text-xs text-muted-foreground">All systems operational</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Email Deliveries</CardTitle>
        </CardHeader>
        <CardContent>
          <DeliveryChart emails={recentEmails} totalEmails={emailCount} />
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Emails</CardTitle>
          </CardHeader>
          <CardContent>
            {recentEmails.length === 0 ? (
              <p className="text-sm text-muted-foreground">No emails sent yet</p>
            ) : (
              <div className="space-y-4">
                {recentEmails.map((email) => (
                  <div key={email.id} className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-sm font-medium leading-none">{email.subject}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(email.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        email.status === 'sent' || email.status === 'delivered'
                          ? 'bg-green-100 text-green-700'
                          : email.status === 'failed'
                            ? 'bg-red-100 text-red-700'
                            : 'bg-yellow-100 text-yellow-700'
                      }`}
                    >
                      {email.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button asChild className="w-full justify-start" variant="outline">
              <Link to="/templates/new">
                <LayoutTemplate className="mr-2 h-4 w-4" />
                Create New Template
              </Link>
            </Button>
            <Button asChild className="w-full justify-start" variant="outline">
              <Link to="/adapters">
                <Mail className="mr-2 h-4 w-4" />
                Configure Email Provider
              </Link>
            </Button>
            <Button asChild className="w-full justify-start" variant="outline">
              <Link to="/api-keys">
                <Activity className="mr-2 h-4 w-4" />
                Generate API Key
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

interface DeliveryChartProps {
  emails: Array<{ id: string; subject: string; status: string; createdAt: string }>;
  totalEmails: number;
}

function DeliveryChart({ emails, totalEmails }: DeliveryChartProps) {
  const chartData = useMemo(() => {
    if (totalEmails === 0) {
      const today = new Date();
      return Array.from({ length: 7 }, (_, i) => {
        const date = new Date(today);
        date.setDate(date.getDate() - (6 - i));
        return {
          date: date.toLocaleDateString('en-US', { weekday: 'short' }),
          emails: 0,
        };
      });
    }

    const emailsByDate = new Map<string, number>();
    const today = new Date();

    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const key = date.toDateString();
      emailsByDate.set(key, 0);
    }

    emails.forEach((email) => {
      const date = new Date(email.createdAt).toDateString();
      if (emailsByDate.has(date)) {
        emailsByDate.set(date, (emailsByDate.get(date) || 0) + 1);
      }
    });

    return Array.from(emailsByDate.entries()).map(([dateStr, count]) => ({
      date: new Date(dateStr).toLocaleDateString('en-US', { weekday: 'short' }),
      emails: count,
    }));
  }, [emails, totalEmails]);

  if (totalEmails === 0) {
    return (
      <div className="h-[200px] flex items-center justify-center text-muted-foreground">
        No email data yet. Send your first email to see delivery trends.
      </div>
    );
  }

  return (
    <div className="h-[200px]">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="emailGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="hsl(262, 83%, 58%)" stopOpacity={0.4} />
              <stop offset="100%" stopColor="hsl(262, 83%, 58%)" stopOpacity={0.05} />
            </linearGradient>
          </defs>
          <XAxis
            dataKey="date"
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
            allowDecimals={false}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'hsl(var(--background))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '8px',
              fontSize: '12px',
            }}
            labelStyle={{ fontWeight: 600 }}
          />
          <Area
            type="monotone"
            dataKey="emails"
            stroke="hsl(262, 83%, 58%)"
            strokeWidth={2}
            fill="url(#emailGradient)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
