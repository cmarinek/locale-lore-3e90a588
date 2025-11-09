/**
 * RBAC React Hooks - SSOT
 * Hooks for accessing role and permission information
 */

import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthProvider';
import { type Role, type Permission } from '@/config';
import { ROLES, hasPermission, hasAnyPermission, hasAllPermissions, isAdmin, isContributor } from './roles';
import { canAccessRoute, type RouteGuard } from './guards';
import { supabase } from '@/integrations/supabase/client';

/**
 * Query key factory for role-related queries
 */
export const roleQueryKeys = {
  all: ['roles'] as const,
  user: (userId: string | undefined) => [...roleQueryKeys.all, 'user', userId] as const,
};

/**
 * Fetch user role from database
 */
async function fetchUserRole(userId: string | undefined): Promise<Role> {
  if (!userId) {
    return ROLES.PUBLIC;
  }

  const { data, error } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', userId)
    .single();

  if (error) {
    // If no role found (not an error in many cases), default to authenticated
    if (error.code === 'PGRST116') {
      return ROLES.AUTHENTICATED;
    }
    console.error('Error fetching user role:', error);
    return ROLES.AUTHENTICATED;
  }

  return (data?.role as Role) || ROLES.AUTHENTICATED;
}

/**
 * Get current user's role from database with React Query caching
 */
export function useUserRole(): Role {
  const { user } = useAuth();
  
  const { data: role } = useQuery({
    queryKey: roleQueryKeys.user(user?.id),
    queryFn: () => fetchUserRole(user?.id),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
    enabled: true, // Always fetch, will return ROLES.PUBLIC if no user
  });

  return role || ROLES.PUBLIC;
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
