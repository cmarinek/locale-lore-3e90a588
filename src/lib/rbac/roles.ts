/**
 * Role Definitions and Utilities - SSOT
 */

import { ROLES, ROLE_PERMISSIONS, ROLE_HIERARCHY, type Role, type Permission } from '@/config';

export { ROLES, ROLE_PERMISSIONS, ROLE_HIERARCHY, type Role };

/**
 * Get user role from Supabase user metadata
 *
 * ⚠️ SECURITY WARNING: This function should NOT be used for authorization decisions!
 * User metadata can be manipulated by clients. Use server-side role checks instead.
 *
 * For server-side authorization, query the user_roles table directly:
 * ```sql
 * SELECT role FROM public.user_roles WHERE user_id = auth.uid()
 * ```
 *
 * This function is only safe for UI hints (showing/hiding features), never for access control.
 */
export function getUserRole(user: any): Role {
  if (!user) return ROLES.PUBLIC;

  // ⚠️ DEPRECATED: Client metadata is NOT secure for authorization
  // This is only used for UI hints. Server-side checks use user_roles table.
  const metadataRole = user.user_metadata?.role || user.app_metadata?.role;

  // Validate role
  if (metadataRole && Object.values(ROLES).includes(metadataRole)) {
    return metadataRole as Role;
  }

  // Default to authenticated if logged in
  return ROLES.AUTHENTICATED;
}

/**
 * Server-side function to get user role from database
 * Use this for actual authorization decisions
 *
 * @param supabase - Supabase client instance
 * @param userId - User ID to check
 * @returns User's role from user_roles table
 */
export async function getUserRoleSecure(supabase: any, userId: string): Promise<Role> {
  if (!userId) return ROLES.PUBLIC;

  try {
    const { data, error } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error) {
      console.error('Failed to get user role:', error);
      return ROLES.AUTHENTICATED; // Fail closed, not open
    }

    if (data?.role && Object.values(ROLES).includes(data.role)) {
      return data.role as Role;
    }

    return ROLES.AUTHENTICATED;
  } catch (error) {
    console.error('Error in getUserRoleSecure:', error);
    return ROLES.AUTHENTICATED; // Fail closed
  }
}

/**
 * Check if role has permission
 */
export function hasPermission(role: Role, permission: Permission): boolean {
  const permissions = ROLE_PERMISSIONS[role];
  return permissions ? permissions.includes(permission) : false;
}

/**
 * Check if role has any of the permissions
 */
export function hasAnyPermission(role: Role, permissions: Permission[]): boolean {
  return permissions.some(permission => hasPermission(role, permission));
}

/**
 * Check if role has all permissions
 */
export function hasAllPermissions(role: Role, permissions: Permission[]): boolean {
  return permissions.every(permission => hasPermission(role, permission));
}

/**
 * Get all permissions for a role
 */
export function getRolePermissions(role: Role): Permission[] {
  return ROLE_PERMISSIONS[role] || [];
}

/**
 * Check if role is higher in hierarchy
 */
export function isRoleHigherThan(role1: Role, role2: Role): boolean {
  return ROLE_HIERARCHY[role1] > ROLE_HIERARCHY[role2];
}

/**
 * Check if role is admin
 */
export function isAdmin(role: Role): boolean {
  return role === ROLES.ADMIN;
}

/**
 * Check if role is contributor or higher
 */
export function isContributor(role: Role): boolean {
  return isRoleHigherThan(role, ROLES.AUTHENTICATED) || role === ROLES.CONTRIBUTOR;
}

/**
 * Check if role is authenticated (not public)
 */
export function isAuthenticated(role: Role): boolean {
  return role !== ROLES.PUBLIC;
}
