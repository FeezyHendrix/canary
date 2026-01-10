import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  LayoutTemplate,
  Mail,
  TrendingUp,
  CheckCircle2,
  ArrowUpRight,
  ArrowDownRight,
  Search,
} from 'lucide-react';
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { api } from '@/lib/api-client';
import { cn } from '@/lib/utils';

interface KpiCardProps {
  title: string;
  value: string | number;
  trend?: { value: string; positive: boolean };
  icon: React.ElementType;
  iconBg: string;
  iconColor: string;
}

function KpiCard({ title, value, trend, icon: Icon, iconBg, iconColor }: KpiCardProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 relative overflow-hidden">
      <div
        className={cn(
          'absolute top-4 right-4 w-10 h-10 rounded-lg flex items-center justify-center',
          iconBg
        )}
      >
        <Icon className={cn('h-5 w-5', iconColor)} />
      </div>

      <div className="space-y-1">
        <p className="text-sm font-medium text-gray-500">{title}</p>
        <p className="text-3xl font-bold text-gray-900 tracking-tight">{value}</p>
      </div>

      {trend && (
        <div
          className={cn(
            'flex items-center gap-1 mt-3 text-sm font-medium',
            trend.positive ? 'text-emerald-600' : 'text-red-500'
          )}
        >
          {trend.positive ? (
            <ArrowUpRight className="h-4 w-4" />
          ) : (
            <ArrowDownRight className="h-4 w-4" />
          )}
          <span>{trend.value}</span>
          <span className="text-gray-400 font-normal">vs last period</span>
        </div>
      )}
    </div>
  );
}

interface StatusBadgeProps {
  status: string;
}

function StatusBadge({ status }: StatusBadgeProps) {
  const styles: Record<string, string> = {
    sent: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    delivered: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    failed: 'bg-red-50 text-red-700 border-red-200',
    pending: 'bg-amber-50 text-amber-700 border-amber-200',
    queued: 'bg-blue-50 text-blue-700 border-blue-200',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border',
        styles[status] || styles.pending
      )}
    >
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

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
          items: Array<{
            id: string;
            subject: string;
            status: string;
            createdAt: string;
            recipientEmail?: string;
            to?: string;
          }>;
        };
      }>('/api/logs', { params: { page: 1, pageSize: 100 } }),
  });

  const templateCount = templatesData?.data?.total ?? 0;
  const emailCount = logsData?.data?.total ?? 0;
  const recentEmails = logsData?.data?.items ?? [];

  const deliveredCount = recentEmails.filter(
    (e) => e.status === 'sent' || e.status === 'delivered'
  ).length;
  const deliveryRate =
    emailCount > 0
      ? ((deliveredCount / Math.min(emailCount, recentEmails.length)) * 100).toFixed(1)
      : '0';

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          title="Templates"
          value={templateCount}
          trend={{ value: '+12%', positive: true }}
          icon={LayoutTemplate}
          iconBg="bg-violet-100"
          iconColor="text-violet-600"
        />
        <KpiCard
          title="Emails Sent"
          value={emailCount.toLocaleString()}
          trend={{ value: '+23%', positive: true }}
          icon={Mail}
          iconBg="bg-blue-100"
          iconColor="text-blue-600"
        />
        <KpiCard
          title="Delivery Rate"
          value={emailCount > 0 ? `${deliveryRate}%` : '-'}
          trend={emailCount > 0 ? { value: '+2.4%', positive: true } : undefined}
          icon={TrendingUp}
          iconBg="bg-emerald-100"
          iconColor="text-emerald-600"
        />
        <KpiCard
          title="System Status"
          value="Healthy"
          icon={CheckCircle2}
          iconBg="bg-amber-100"
          iconColor="text-amber-600"
        />
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Email Delivery Trends</h2>
            <p className="text-sm text-gray-500">Daily email volume over the past week</p>
          </div>
        </div>
        <DeliveryChart emails={recentEmails} totalEmails={emailCount} />
      </div>

      <div className="bg-white rounded-xl border border-gray-200">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Recent Emails</h2>
              <p className="text-sm text-gray-500">Latest email activity and delivery status</p>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search emails..."
                className="pl-10 pr-4 py-2 text-sm border border-gray-200 rounded-lg bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent w-64 transition-colors"
              />
            </div>
          </div>
        </div>

        {recentEmails.length === 0 ? (
          <div className="p-12 text-center">
            <Mail className="mx-auto h-12 w-12 text-gray-300" />
            <p className="mt-4 text-sm font-medium text-gray-900">No emails sent yet</p>
            <p className="mt-1 text-sm text-gray-500">Send your first email to see activity here</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">
                    Email
                  </th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">
                    Recipient
                  </th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">
                    Date
                  </th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {recentEmails.slice(0, 10).map((email) => (
                  <tr key={email.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="text-sm font-medium text-gray-900 truncate max-w-xs">
                        {email.subject || 'No subject'}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-600">
                        {email.recipientEmail || email.to || 'Unknown'}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-500">
                        {new Date(email.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={email.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
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
    const today = new Date();

    if (totalEmails === 0) {
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
      <div className="h-[280px] flex items-center justify-center">
        <div className="text-center">
          <TrendingUp className="mx-auto h-10 w-10 text-gray-300" />
          <p className="mt-3 text-sm font-medium text-gray-900">No data yet</p>
          <p className="mt-1 text-sm text-gray-500">Send your first email to see delivery trends</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[280px]">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="emailGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.3} />
              <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <XAxis
            dataKey="date"
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 12, fill: '#9ca3af' }}
            dy={10}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 12, fill: '#9ca3af' }}
            allowDecimals={false}
            dx={-10}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#fff',
              border: '1px solid #e5e7eb',
              borderRadius: '12px',
              boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
              fontSize: '13px',
              padding: '10px 14px',
            }}
            labelStyle={{ fontWeight: 600, color: '#111827', marginBottom: '4px' }}
            itemStyle={{ color: '#6b7280' }}
          />
          <Area
            type="monotone"
            dataKey="emails"
            stroke="#8b5cf6"
            strokeWidth={2.5}
            fill="url(#emailGradient)"
            dot={false}
            activeDot={{ r: 6, fill: '#8b5cf6', stroke: '#fff', strokeWidth: 2 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
