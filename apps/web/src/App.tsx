import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './features/auth/auth-context';
import { Toaster } from './components/ui/toaster';
import { AppShell } from './components/layout/app-shell';
import { LoginPage } from './features/auth/login';
import { RegisterPage } from './features/auth/register';
import { ForgotPasswordPage } from './features/auth/forgot-password';
import { ResetPasswordPage } from './features/auth/reset-password';
import { VerifyEmailPage } from './features/auth/verify-email';
import { AcceptInvite } from './features/auth/accept-invite';
import { Dashboard } from './features/dashboard/dashboard';
import { TemplatesList } from './features/templates/templates-list';
import { TemplateDesigner } from './features/templates/template-designer';
import { AdaptersList } from './features/adapters/adapters-list';
import { EmailLogs } from './features/logs/email-logs';
import { ApiKeysList } from './features/api-keys/api-keys-list';
import { WebhooksList } from './features/webhooks/webhooks-list';
import { TeamSettings } from './features/settings/team-settings';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      <Route path="/verify-email" element={<VerifyEmailPage />} />
      <Route path="/invite" element={<AcceptInvite />} />
      <Route
        path="/*"
        element={
          <ProtectedRoute>
            <AppShell>
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/templates" element={<TemplatesList />} />
                <Route path="/templates/new" element={<TemplateDesigner />} />
                <Route path="/templates/:id" element={<TemplateDesigner />} />
                <Route path="/adapters" element={<AdaptersList />} />
                <Route path="/logs" element={<EmailLogs />} />
                <Route path="/api-keys" element={<ApiKeysList />} />
                <Route path="/webhooks" element={<WebhooksList />} />
                <Route path="/settings" element={<TeamSettings />} />
              </Routes>
            </AppShell>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
      <Toaster />
    </AuthProvider>
  );
}
