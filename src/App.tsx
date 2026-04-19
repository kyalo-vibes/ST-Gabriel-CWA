import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from './components/ui/sonner';
import { useStore } from './store/useStore';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Layout } from './components/Layout';
import { LoginPage } from './pages/LoginPage';
import { SignupPage } from './pages/SignupPage';
import { DashboardPage } from './pages/DashboardPage';
import { MemberDashboardPage } from './pages/MemberDashboardPage';
import { MemberProfilePage } from './pages/MemberProfilePage';
import { MembersPage } from './pages/MembersPage';
import { MemberDetailPage } from './pages/MemberDetailPage';
import { ContributionsPage } from './pages/ContributionsPage';
import { ReportsPage } from './pages/ReportsPage';
import { NotificationsPage } from './pages/NotificationsPage';
import { SettingsPage } from './pages/SettingsPage';
import { EventsPage } from './pages/EventsPage';
import { EventDetailPage } from './pages/EventDetailPage';
import { DebtManagementPage } from './pages/DebtManagementPage';
import { useEffect } from 'react';

function getRoleFromToken(token: string | null): string | null {
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.role ?? null;
  } catch {
    return null;
  }
}

export default function App() {
  const theme = useStore((state) => state.theme);
  const isAuthenticated = useStore((state) => state.isAuthenticated);
  const token = useStore((state) => state.token);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const role = getRoleFromToken(token);
  const isAdmin = role === 'Administrator';

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route 
            path="dashboard" 
            element={isAdmin ? <DashboardPage /> : <MemberDashboardPage />} 
          />
          <Route path="profile" element={<MemberProfilePage />} />
          <Route path="reports" element={<ReportsPage />} />
          
          {/* Admin-only routes */}
          {isAdmin && (
            <>
              <Route path="members" element={<MembersPage />} />
              <Route path="members/:id" element={<MemberDetailPage />} />
              <Route path="contributions" element={<ContributionsPage />} />
              <Route path="events" element={<EventsPage />} />
              <Route path="events/:id" element={<EventDetailPage />} />
              <Route path="debt" element={<DebtManagementPage />} />
              <Route path="notifications" element={<NotificationsPage />} />
              <Route path="settings" element={<SettingsPage />} />
            </>
          )}
        </Route>
        {/* Catch-all route for any unmatched paths */}
        <Route path="*" element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />} />
      </Routes>
      <Toaster />
    </BrowserRouter>
  );
}