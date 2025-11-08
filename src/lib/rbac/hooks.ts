/**
 * RBAC React Hooks - SSOT
 * Hooks for accessing role and permission information
 */

import { useMemo } from 'react';
import { useAuth } from '@/contexts/AuthProvider';
import { type Role, type Permission } from '@/config';
import { getUserRole, hasPermission, hasAnyPermission, hasAllPermissions, isAdmin, isContributor } from './roles';
import { canAccessRoute, type RouteGuard } from './guards';

/**
 * Get current user's role
 */
export function useUserRole(): Role {
  const { user } = useAuth();
  return useMemo(() => getUserRole(user), [user]);
}

/**
 * Check if user has a specific permission
 */
export function usePermission(permission: Permission): boolean {
  const role = useUserRole();
  return useMemo(() => hasPermission(role, permission), [role, permission]);
}

/**
 * Check if user has any of the specified permissions
 */
export function useAnyPermission(permissions: Permission[]): boolean {
  const role = useUserRole();
  return useMemo(() => hasAnyPermission(role, permissions), [role, permissions]);
}

/**
 * Check if user has all specified permissions
 */
export function useAllPermissions(permissions: Permission[]): boolean {
  const role = useUserRole();
  return useMemo(() => hasAllPermissions(role, permissions), [role, permissions]);
}

/**
 * Check if user is admin
 */
export function useIsAdmin(): boolean {
  const role = useUserRole();
  return useMemo(() => isAdmin(role), [role]);
}

/**
 * Check if user is contributor
 */
export function useIsContributor(): boolean {
  const role = useUserRole();
  return useMemo(() => isContributor(role), [role]);
}

/**
 * Check if user can access route with guard
 */
export function useCanAccessRoute(guard: RouteGuard): { allowed: boolean; reason?: string } {
  const role = useUserRole();
  return useMemo(() => canAccessRoute(role, guard), [role, guard]);
}

/**
 * Get all user permissions
 */
export function useUserPermissions(): Permission[] {
  const role = useUserRole();
  const { ROLE_PERMISSIONS } = require('@/config');
  return useMemo(() => ROLE_PERMISSIONS[role] || [], [role]);
}
