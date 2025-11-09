/**
 * RBAC Cache Utilities
 * Helpers for managing role cache invalidation
 */

import { useQueryClient } from '@tanstack/react-query';
import { roleQueryKeys } from './hooks';

/**
 * Hook to get role cache invalidation functions
 */
export function useRoleCache() {
  const queryClient = useQueryClient();

  return {
    /**
     * Invalidate a specific user's role cache
     */
    invalidateUserRole: (userId: string) => {
      return queryClient.invalidateQueries({
        queryKey: roleQueryKeys.user(userId),
      });
    },

    /**
     * Invalidate all role caches
     */
    invalidateAllRoles: () => {
      return queryClient.invalidateQueries({
        queryKey: roleQueryKeys.all,
      });
    },

    /**
     * Refetch a specific user's role
     */
    refetchUserRole: (userId: string) => {
      return queryClient.refetchQueries({
        queryKey: roleQueryKeys.user(userId),
      });
    },

    /**
     * Set user role in cache without refetching
     */
    setUserRole: (userId: string, role: string) => {
      queryClient.setQueryData(roleQueryKeys.user(userId), role);
    },

    /**
     * Get cached user role without triggering a fetch
     */
    getCachedUserRole: (userId: string) => {
      return queryClient.getQueryData(roleQueryKeys.user(userId));
    },
  };
}

/**
 * Helper to invalidate role cache on sign out
 */
export function clearRoleCache(queryClient: any) {
  queryClient.removeQueries({
    queryKey: roleQueryKeys.all,
  });
}
