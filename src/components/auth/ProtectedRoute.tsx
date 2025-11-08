import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useUserRole } from '@/lib/rbac';
import { canAccessRoute, type RouteGuard } from '@/lib/rbac/guards';
import { ROLES } from '@/config';
import type { Permission } from '@/config';

interface ProtectedRouteProps {
  children: React.ReactNode;
  guard?: RouteGuard;
  // Legacy props for backward compatibility
  requiresAuth?: boolean;
  adminOnly?: boolean;
  contributorOnly?: boolean;
  requiredPermissions?: Permission[];
  requireAll?: boolean;
  fallbackPath?: string;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  guard,
  requiresAuth = false,
  adminOnly = false,
  contributorOnly = false,
  requiredPermissions,
  requireAll = false,
  fallbackPath = '/auth',
}) => {
  const location = useLocation();
  const userRole = useUserRole();

  // Build guard from legacy props if guard not provided
  const routeGuard: RouteGuard = guard || {
    requiresAuth: requiresAuth || adminOnly || contributorOnly,
    requiredRole: adminOnly 
      ? ROLES.ADMIN 
      : contributorOnly 
        ? ROLES.CONTRIBUTOR 
        : undefined,
    requiredPermissions,
    requireAll,
    allowPreview: false, // No preview bypass for security
  };

  // Check access
  const { allowed, reason } = canAccessRoute(userRole, routeGuard);

  if (!allowed) {
    console.warn(`Access denied to ${location.pathname}: ${reason}`);
    return (
      <Navigate
        to={fallbackPath}
        state={{ from: location, reason }}
        replace
      />
    );
  }

  return <>{children}</>;
};