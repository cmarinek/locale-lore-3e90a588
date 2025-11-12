/**
 * Route Guards - SSOT
 * Centralized route protection logic
 */

import { type Role, type Permission, ROLES } from '@/config';
import { hasPermission, hasAnyPermission, hasAllPermissions, isRoleHigherThan } from './roles';

/**
 * Route protection configuration
 */
export interface RouteGuard {
  requiresAuth: boolean;
  requiredRole?: Role;
  requiredPermissions?: Permission[];
  requireAll?: boolean; // If true, requires ALL permissions, otherwise ANY
  allowPreview?: boolean; // If true, allows preview mode bypass (for development only)
}

/**
 * Check if user can access route based on guard configuration
 */
export function canAccessRoute(
  userRole: Role | null,
  guard: RouteGuard
): { allowed: boolean; reason?: string } {
  const isAuthenticated = !!userRole && userRole !== ROLES.PUBLIC;

  // Check auth requirement
  if (guard.requiresAuth && !isAuthenticated) {
    return {
      allowed: false,
      reason: 'Authentication required',
    };
  }

  // If route is public and has no additional requirements, allow immediately
  if (
    !guard.requiresAuth &&
    (!guard.requiredRole || guard.requiredRole === ROLES.PUBLIC) &&
    (!guard.requiredPermissions || guard.requiredPermissions.length === 0)
  ) {
    return { allowed: true };
  }

  if (!userRole) {
    return {
      allowed: false,
      reason: 'Role information unavailable',
    };
  }

  // Check role requirement
  if (guard.requiredRole && userRole) {
    const roleMatch = userRole === guard.requiredRole || isRoleHigherThan(userRole, guard.requiredRole);
    if (!roleMatch) {
      return {
        allowed: false,
        reason: `Required role: ${guard.requiredRole}`,
      };
    }
  }
  
  // Check permissions
  if (guard.requiredPermissions && guard.requiredPermissions.length > 0 && userRole) {
    const hasPermissions = guard.requireAll
      ? hasAllPermissions(userRole, guard.requiredPermissions)
      : hasAnyPermission(userRole, guard.requiredPermissions);
    
    if (!hasPermissions) {
      return {
        allowed: false,
        reason: `Missing required permissions`,
      };
    }
  }
  
  return { allowed: true };
}

/**
 * Create a guard configuration
 */
export function createGuard(config: Partial<RouteGuard>): RouteGuard {
  return {
    requiresAuth: false,
    requireAll: false,
    allowPreview: false,
    ...config,
  };
}

/**
 * Predefined guards for common scenarios
 */
export const GUARDS = {
  PUBLIC: createGuard({
    requiresAuth: false,
  }),
  
  AUTHENTICATED: createGuard({
    requiresAuth: true,
  }),
  
  ADMIN: createGuard({
    requiresAuth: true,
    requiredRole: 'admin' as Role,
    allowPreview: false, // Never allow preview bypass for admin
  }),
  
  CONTRIBUTOR: createGuard({
    requiresAuth: true,
    requiredRole: 'contributor' as Role,
  }),
  
  CONTENT_CREATE: createGuard({
    requiresAuth: true,
    requiredPermissions: ['content:create'] as Permission[],
  }),
  
  CONTENT_MODERATE: createGuard({
    requiresAuth: true,
    requiredPermissions: ['content:moderate'] as Permission[],
  }),
  
  BILLING_MANAGE: createGuard({
    requiresAuth: true,
    requiredPermissions: ['billing:manage'] as Permission[],
  }),
} as const;
