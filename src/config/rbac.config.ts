/**
 * Role-Based Access Control (RBAC) Configuration - SSOT
 * Centralized permission and role management
 */

/**
 * Application roles
 */
export const ROLES = {
  PUBLIC: 'public',
  AUTHENTICATED: 'authenticated',
  CONTRIBUTOR: 'contributor',
  ADMIN: 'admin',
} as const;

export type Role = typeof ROLES[keyof typeof ROLES];

/**
 * Permissions organized by domain
 */
export const PERMISSIONS = {
  // Content permissions
  CONTENT_VIEW: 'content:view',
  CONTENT_CREATE: 'content:create',
  CONTENT_EDIT_OWN: 'content:edit:own',
  CONTENT_EDIT_ANY: 'content:edit:any',
  CONTENT_DELETE_OWN: 'content:delete:own',
  CONTENT_DELETE_ANY: 'content:delete:any',
  CONTENT_MODERATE: 'content:moderate',
  
  // User permissions
  USER_VIEW_PUBLIC: 'user:view:public',
  USER_VIEW_PROFILE: 'user:view:profile',
  USER_EDIT_PROFILE: 'user:edit:profile',
  USER_MANAGE_ANY: 'user:manage:any',
  
  // Social permissions
  SOCIAL_COMMENT: 'social:comment',
  SOCIAL_LIKE: 'social:like',
  SOCIAL_SHARE: 'social:share',
  SOCIAL_FOLLOW: 'social:follow',
  SOCIAL_MESSAGE: 'social:message',
  
  // Gamification permissions
  GAMIFICATION_VIEW: 'gamification:view',
  GAMIFICATION_EARN: 'gamification:earn',
  GAMIFICATION_REDEEM: 'gamification:redeem',
  
  // Admin permissions
  ADMIN_DASHBOARD: 'admin:dashboard',
  ADMIN_USERS: 'admin:users',
  ADMIN_CONTENT: 'admin:content',
  ADMIN_ANALYTICS: 'admin:analytics',
  ADMIN_SETTINGS: 'admin:settings',
  ADMIN_SECURITY: 'admin:security',
  ADMIN_MONITORING: 'admin:monitoring',
  
  // Contributor permissions
  CONTRIBUTOR_APPLY: 'contributor:apply',
  CONTRIBUTOR_DASHBOARD: 'contributor:dashboard',
  CONTRIBUTOR_EARNINGS: 'contributor:earnings',
  CONTRIBUTOR_ANALYTICS: 'contributor:analytics',
  
  // Billing permissions
  BILLING_VIEW: 'billing:view',
  BILLING_MANAGE: 'billing:manage',
  BILLING_REFUND: 'billing:refund',
} as const;

export type Permission = typeof PERMISSIONS[keyof typeof PERMISSIONS];

/**
 * Role hierarchy - roles inherit permissions from lower roles
 */
export const ROLE_HIERARCHY: Record<Role, number> = {
  [ROLES.PUBLIC]: 0,
  [ROLES.AUTHENTICATED]: 1,
  [ROLES.CONTRIBUTOR]: 2,
  [ROLES.ADMIN]: 3,
};

/**
 * Permission matrix - maps roles to permissions
 */
const PUBLIC_PERMISSIONS: Permission[] = [
  PERMISSIONS.CONTENT_VIEW,
  PERMISSIONS.USER_VIEW_PUBLIC,
];

const AUTHENTICATED_PERMISSIONS: Permission[] = [
  // Inherits from PUBLIC
  ...PUBLIC_PERMISSIONS,
    
  // Additional permissions
  PERMISSIONS.CONTENT_CREATE,
  PERMISSIONS.CONTENT_EDIT_OWN,
  PERMISSIONS.CONTENT_DELETE_OWN,
  PERMISSIONS.USER_VIEW_PROFILE,
  PERMISSIONS.USER_EDIT_PROFILE,
  PERMISSIONS.SOCIAL_COMMENT,
  PERMISSIONS.SOCIAL_LIKE,
  PERMISSIONS.SOCIAL_SHARE,
  PERMISSIONS.SOCIAL_FOLLOW,
  PERMISSIONS.SOCIAL_MESSAGE,
  PERMISSIONS.GAMIFICATION_VIEW,
  PERMISSIONS.GAMIFICATION_EARN,
  PERMISSIONS.GAMIFICATION_REDEEM,
  PERMISSIONS.CONTRIBUTOR_APPLY,
  PERMISSIONS.BILLING_VIEW,
  PERMISSIONS.BILLING_MANAGE,
];

const CONTRIBUTOR_PERMISSIONS: Permission[] = [
  // Inherits from AUTHENTICATED
  ...AUTHENTICATED_PERMISSIONS,
  
  // Additional permissions
  PERMISSIONS.CONTRIBUTOR_DASHBOARD,
  PERMISSIONS.CONTRIBUTOR_EARNINGS,
  PERMISSIONS.CONTRIBUTOR_ANALYTICS,
];

const ADMIN_PERMISSIONS: Permission[] = [
  // Has ALL permissions
  ...Object.values(PERMISSIONS),
];

export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  [ROLES.PUBLIC]: PUBLIC_PERMISSIONS,
  [ROLES.AUTHENTICATED]: AUTHENTICATED_PERMISSIONS,
  [ROLES.CONTRIBUTOR]: CONTRIBUTOR_PERMISSIONS,
  [ROLES.ADMIN]: ADMIN_PERMISSIONS,
};

/**
 * Check if role has permission
 */
export function hasPermission(role: Role, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role]?.includes(permission) || false;
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
 * Route protection configuration
 */
export interface RouteProtection {
  requiresAuth: boolean;
  requiredRole?: Role;
  requiredPermissions?: Permission[];
  requireAll?: boolean; // If true, requires ALL permissions, otherwise ANY
}

/**
 * Helper to check if user can access route
 */
export function canAccessRoute(
  userRole: Role | null,
  protection: RouteProtection
): boolean {
  // Check auth requirement
  if (protection.requiresAuth && !userRole) {
    return false;
  }
  
  // Check role requirement
  if (protection.requiredRole && userRole) {
    if (!isRoleHigherThan(userRole, protection.requiredRole) && userRole !== protection.requiredRole) {
      return false;
    }
  }
  
  // Check permissions
  if (protection.requiredPermissions && userRole) {
    if (protection.requireAll) {
      return hasAllPermissions(userRole, protection.requiredPermissions);
    } else {
      return hasAnyPermission(userRole, protection.requiredPermissions);
    }
  }
  
  return true;
}
