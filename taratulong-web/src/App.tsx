import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './auth/AuthContext';
import { ProtectedRoute } from './auth/ProtectedRoute';
import { ToastProvider } from './components/ui/Toast';
import { Navbar } from './components/layout/Navbar';
import { LoginPage } from './pages/LoginPage';
import { SignupPage } from './pages/SignupPage';
import { VolunteerDashboard } from './pages/VolunteerDashboard';
import { OrgDashboard } from './pages/OrgDashboard';
import { AdminDashboard } from './pages/AdminDashboard';
import { ProfilePage } from './pages/ProfilePage';

function DashboardRouter() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" />;

  switch (user.role) {
    case 'volunteer':
      return <VolunteerDashboard />;
    case 'organization':
      return <OrgDashboard />;
    case 'admin':
      return <AdminDashboard />;
    default:
      return <Navigate to="/login" />;
  }
}

function AppRoutes() {
  const { isAuthenticated } = useAuth();

  return (
    <>
      {isAuthenticated && <Navbar />}
      <Routes>
        <Route path="/login" element={isAuthenticated ? <Navigate to="/dashboard" /> : <LoginPage />} />
        <Route path="/signup" element={isAuthenticated ? <Navigate to="/dashboard" /> : <SignupPage />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardRouter />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to={isAuthenticated ? '/dashboard' : '/login'} />} />
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <AppRoutes />
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
