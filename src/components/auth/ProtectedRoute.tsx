import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useUserRole } from '@/hooks/useUserRole';
import { Card, CardContent } from '@/components/ui/card';
import { Shield, Lock, AlertTriangle } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiresAuth?: boolean;
  adminOnly?: boolean;
  contributorOnly?: boolean;
  fallbackPath?: string;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiresAuth = false,
  adminOnly = false,
  contributorOnly = false,
  fallbackPath = '/auth'
}) => {
  const { role, isAdmin, isContributor, isAuthenticated, loading } = useUserRole();
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

  // Check authentication requirement
  if (requiresAuth && !isAuthenticated) {
    return <Navigate to={fallbackPath} state={{ from: location }} replace />;
  }

  // Check admin requirement
  if (adminOnly && !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <Shield className="w-12 h-12 text-destructive mx-auto" />
              <h2 className="text-2xl font-bold">Admin Access Required</h2>
              <p className="text-muted-foreground">
                This page requires administrator privileges. Contact an admin if you believe this is an error.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Check contributor requirement
  if (contributorOnly && !isContributor) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <Lock className="w-12 h-12 text-yellow-600 mx-auto" />
              <h2 className="text-2xl font-bold">Contributor Access Required</h2>
              <p className="text-muted-foreground">
                This feature is available to contributors. Upgrade your account to access premium features.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
};