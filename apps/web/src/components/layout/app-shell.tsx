import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  LayoutTemplate,
  Key,
  Webhook,
  Settings,
  LogOut,
  Plug,
  ScrollText,
  ChevronLeft,
  ChevronRight,
  Mail,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/features/auth/auth-context';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const mainNavigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Templates', href: '/templates', icon: LayoutTemplate },
  { name: 'Adapters', href: '/adapters', icon: Plug },
  { name: 'Email Logs', href: '/logs', icon: ScrollText },
  { name: 'API Keys', href: '/api-keys', icon: Key },
  { name: 'Webhooks', href: '/webhooks', icon: Webhook },
];

const pageInfo: Record<string, { title: string; subtitle: string }> = {
  '/': { title: 'Dashboard', subtitle: 'Real-time insights and performance overview' },
  '/templates': { title: 'Templates', subtitle: 'Manage your email and PDF templates' },
  '/adapters': { title: 'Adapters', subtitle: 'Configure email service providers' },
  '/logs': { title: 'Email Logs', subtitle: 'Track sent emails and delivery status' },
  '/api-keys': { title: 'API Keys', subtitle: 'Manage API access credentials' },
  '/webhooks': { title: 'Webhooks', subtitle: 'Configure event notifications' },
  '/settings': { title: 'Settings', subtitle: 'Team and account preferences' },
};

function getPageInfo(pathname: string): { title: string; subtitle: string } {
  const exactMatch = pageInfo[pathname];
  if (exactMatch) return exactMatch;

  const matchingKey = Object.keys(pageInfo).find((key) => key !== '/' && pathname.startsWith(key));
  return matchingKey
    ? pageInfo[matchingKey]
    : { title: 'Canary', subtitle: 'Email infrastructure platform' };
}

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const location = useLocation();
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const { title, subtitle } = getPageInfo(location.pathname);

  const initials =
    user?.name
      ?.split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase() ||
    user?.email?.[0]?.toUpperCase() ||
    '?';

  const NavLink = ({ item }: { item: { name: string; href: string; icon: React.ElementType } }) => {
    const isActive =
      item.href === '/'
        ? location.pathname === '/'
        : location.pathname === item.href || location.pathname.startsWith(item.href + '/');

    return (
      <Link
        to={item.href}
        className={cn(
          'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
          isActive
            ? 'bg-gray-100 text-gray-900'
            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
        )}
        title={!sidebarOpen ? item.name : undefined}
      >
        <item.icon
          className={cn(
            'h-[18px] w-[18px] flex-shrink-0',
            isActive ? 'text-gray-900' : 'text-gray-500'
          )}
        />
        {sidebarOpen && <span>{item.name}</span>}
      </Link>
    );
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <aside
        className={cn(
          'bg-white border-r border-gray-200 flex flex-col transition-all duration-300 ease-in-out relative',
          sidebarOpen ? 'w-64' : 'w-[72px]'
        )}
      >
        <div
          className={cn(
            'h-16 flex items-center border-b border-gray-200',
            sidebarOpen ? 'px-5' : 'px-4 justify-center'
          )}
        >
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-gradient-to-br from-violet-500 to-purple-600 rounded-lg flex items-center justify-center shadow-sm">
              <Mail className="h-4 w-4 text-white" />
            </div>
            {sidebarOpen && (
              <span className="font-semibold text-lg text-gray-900 tracking-tight">Canary</span>
            )}
          </Link>
        </div>

        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="absolute -right-3 top-20 w-6 h-6 bg-white border border-gray-200 rounded-full flex items-center justify-center text-gray-500 hover:text-gray-700 hover:bg-gray-50 shadow-sm transition-colors z-10"
        >
          {sidebarOpen ? (
            <ChevronLeft className="h-3.5 w-3.5" />
          ) : (
            <ChevronRight className="h-3.5 w-3.5" />
          )}
        </button>

        <nav className="flex-1 p-3 overflow-y-auto">
          {sidebarOpen && (
            <h3 className="px-3 mb-2 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
              Main Menu
            </h3>
          )}
          <div className="space-y-1">
            {mainNavigation.map((item) => (
              <NavLink key={item.name} item={item} />
            ))}
          </div>
        </nav>

        <div className={cn('border-t border-gray-200 p-3 space-y-1')}>
          <Link
            to="/settings"
            className={cn(
              'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
              location.pathname === '/settings'
                ? 'bg-gray-100 text-gray-900'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            )}
            title={!sidebarOpen ? 'Settings' : undefined}
          >
            <Settings
              className={cn(
                'h-[18px] w-[18px] flex-shrink-0',
                location.pathname === '/settings' ? 'text-gray-900' : 'text-gray-500'
              )}
            />
            {sidebarOpen && <span>Settings</span>}
          </Link>
          <button
            onClick={logout}
            className={cn(
              'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 w-full',
              'text-red-600 hover:bg-red-50'
            )}
            title={!sidebarOpen ? 'Log out' : undefined}
          >
            <LogOut className="h-[18px] w-[18px] flex-shrink-0" />
            {sidebarOpen && <span>Log out</span>}
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 flex-shrink-0">
          <div>
            <h1 className="text-lg font-semibold text-gray-900">{title}</h1>
            <p className="text-sm text-gray-500">{subtitle}</p>
          </div>
          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-3 px-2 hover:bg-gray-100">
                  <div className="flex flex-col items-end text-right">
                    <span className="text-sm font-medium text-gray-900">
                      {user?.name || 'User'}
                    </span>
                    <span className="text-xs text-gray-500">{user?.email}</span>
                  </div>
                  <Avatar className="h-9 w-9">
                    <AvatarImage src={user?.avatarUrl || undefined} />
                    <AvatarFallback className="bg-gradient-to-br from-violet-500 to-purple-600 text-white text-sm font-medium">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium">{user?.name || 'User'}</p>
                    <p className="text-xs text-gray-500">{user?.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/settings" className="flex items-center">
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={logout}
                  className="text-red-600 focus:text-red-600 focus:bg-red-50"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <main className="flex-1 overflow-auto">
          <div className="p-6">{children}</div>
        </main>
      </div>
    </div>
  );
}
