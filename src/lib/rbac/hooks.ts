/**
 * RBAC React Hooks - SSOT
 * Hooks for accessing role and permission information
 */

import { useMemo, useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthProvider';
import { type Role, type Permission } from '@/config';
import { ROLES, hasPermission, hasAnyPermission, hasAllPermissions, isAdmin, isContributor } from './roles';
import { canAccessRoute, type RouteGuard } from './guards';
import { supabase } from '@/integrations/supabase/client';

/**
 * Get current user's role from database
 */
export function useUserRole(): Role {
  const { user } = useAuth();
  const [role, setRole] = useState<Role>(ROLES.PUBLIC);

  useEffect(() => {
    if (!user) {
      setRole(ROLES.PUBLIC);
      return;
    }

    // Fetch role from user_roles table
    const fetchRole = async () => {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .single();

      if (error) {
        console.error('Error fetching user role:', error);
        // Default to authenticated if user exists but no role found
        setRole(ROLES.AUTHENTICATED);
        return;
      }

      // Map the role or default to authenticated
      setRole((data?.role as Role) || ROLES.AUTHENTICATED);
    };

    fetchRole();
  }, [user]);

  return role;
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
