import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useUserRole } from '@/hooks/useUserRole';
import { GracefulFallback } from './GracefulFallback';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiresAuth?: boolean;
  adminOnly?: boolean;
  contributorOnly?: boolean;
  fallbackPath?: string;
  feature?: string;
  showPreview?: boolean;
  graceful?: boolean;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiresAuth = false,
  adminOnly = false,
  contributorOnly = false,
  fallbackPath = '/auth',
  feature = "feature",
  showPreview = true,
  graceful = true
}) => {
  const { loading } = useUserRole();
  const location = useLocation();

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Checking permissions...</p>
        </div>
      </div>
    );
  }

  // Use graceful fallback by default, hard redirect as fallback
  if (graceful) {
    return (
      <GracefulFallback
        requiresAuth={requiresAuth}
        adminOnly={adminOnly}
        contributorOnly={contributorOnly}
        feature={feature}
        previewMode={showPreview}
      >
        {children}
      </GracefulFallback>
    );
  }

  // Legacy hard redirect for specific cases
  if (requiresAuth) {
    return <Navigate to={fallbackPath} state={{ from: location }} replace />;
  }

  return <>{children}</>;
};