import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext';
import type { ReactNode } from 'react';

interface Props {
  children: ReactNode;
  roles?: string[];
}

export function ProtectedRoute({ children, roles }: Props) {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (roles && user && !roles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}
