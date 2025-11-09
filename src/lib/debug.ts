/**
 * Debug utilities that only show messages to admin users
 */

import { toast } from '@/hooks/use-toast';

let isAdminUser = false;

/**
 * Initialize debug mode based on user role
 * Should be called when user auth state changes
 */
export function setDebugMode(isAdmin: boolean) {
  isAdminUser = isAdmin;
}

/**
 * Console log that only shows for admins
 */
export function debugLog(...args: any[]) {
  if (isAdminUser && process.env.NODE_ENV === 'development') {
    console.log('[DEBUG]', ...args);
  }
}

/**
 * Console warn that only shows for admins
 */
export function debugWarn(...args: any[]) {
  if (isAdminUser) {
    console.warn('[DEBUG]', ...args);
  }
}

/**
 * Console error that only shows for admins
 */
export function debugError(...args: any[]) {
  if (isAdminUser) {
    console.error('[DEBUG]', ...args);
  }
}

/**
 * Toast that only shows for admins (for debugging)
 */
export function debugToast(message: string, type: 'info' | 'warning' | 'error' = 'info') {
  if (!isAdminUser) return;

  const variants = {
    info: { variant: 'default' as const },
    warning: { variant: 'default' as const },
    error: { variant: 'destructive' as const },
  };

  toast({
    title: `[Admin Debug] ${type.toUpperCase()}`,
    description: message,
    ...variants[type],
  });
}

/**
 * Check if debug mode is enabled
 */
export function isDebugMode(): boolean {
  return isAdminUser;
}
