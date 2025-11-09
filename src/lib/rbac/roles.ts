/**
 * Role Definitions and Utilities - SSOT
 */

import { ROLES, ROLE_PERMISSIONS, ROLE_HIERARCHY, type Role, type Permission } from '@/config';

export { ROLES, ROLE_PERMISSIONS, ROLE_HIERARCHY, type Role };

/**
 * Get user role from Supabase user metadata
 */
export function getUserRole(user: any): Role {
  if (!user) return ROLES.PUBLIC;
  
  // Check user metadata for role
  const metadataRole = user.user_metadata?.role || user.app_metadata?.role;
  
  // Validate role
  if (metadataRole && Object.values(ROLES).includes(metadataRole)) {
    return metadataRole as Role;
  }
  
  // Default to authenticated if logged in
  return ROLES.AUTHENTICATED;
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
