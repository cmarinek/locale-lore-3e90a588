/**
 * Application Routes - SSOT
 * All route paths defined in one place
 */

export const ROUTES = {
  // Public routes
  HOME: '/',
  NOT_FOUND: '*',
  
  // Content routes
  EXPLORE: '/explore',
  MAP: '/map',
  HYBRID: '/hybrid',
  STORIES: '/stories',
  SEARCH: '/search',
  FACT: '/fact',
  
  // Auth routes
  AUTH: '/auth',
  AUTH_CALLBACK: '/auth/callback',
  AUTH_CONFIRM: '/auth/confirm',
  AUTH_RESET_PASSWORD: '/auth/reset-password',
  
  // User routes (require auth)
  SUBMIT: '/submit',
  PROFILE: '/profile',
  GAMIFICATION: '/gamification',
  SOCIAL: '/social',
  BILLING: '/billing',
  CONTRIBUTOR: '/contributor',
  
  // Admin routes (admin only)
  ADMIN: '/admin',
  MONITORING: '/monitoring',
  SECURITY_AUDIT: '/security-audit',
  
  // Legal/Support routes
  HELP: '/help',
  PRIVACY: '/privacy',
  TERMS: '/terms',
  SUPPORT: '/support',
  CONTENT_GUIDELINES: '/content-guidelines',
  
  // Development routes
  PRODUCTION_READINESS: '/production-readiness',
  TRANSLATION_TEST: '/translation-test',
  SHOWCASE: '/showcase',
} as const;

/**
 * Route metadata for navigation and access control
 */
export interface RouteMetadata {
  path: string;
  requiresAuth: boolean;
  adminOnly: boolean;
  contributorOnly: boolean;
  feature: string;
  category: 'public' | 'auth' | 'user' | 'admin' | 'legal' | 'dev';
  showPreview?: boolean;
  graceful?: boolean;
}

/**
 * Complete route configuration with access control
 */
export const ROUTE_CONFIG: Record<string, RouteMetadata> = {
  HOME: {
    path: ROUTES.HOME,
    requiresAuth: false,
    adminOnly: false,
    contributorOnly: false,
    feature: 'home',
    category: 'public',
  },
  EXPLORE: {
    path: ROUTES.EXPLORE,
    requiresAuth: false,
    adminOnly: false,
    contributorOnly: false,
    feature: 'explore',
    category: 'public',
  },
  MAP: {
    path: ROUTES.MAP,
    requiresAuth: false,
    adminOnly: false,
    contributorOnly: false,
    feature: 'map',
    category: 'public',
  },
  HYBRID: {
    path: ROUTES.HYBRID,
    requiresAuth: false,
    adminOnly: false,
    contributorOnly: false,
    feature: 'hybrid view',
    category: 'public',
  },
  STORIES: {
    path: ROUTES.STORIES,
    requiresAuth: false,
    adminOnly: false,
    contributorOnly: false,
    feature: 'stories',
    category: 'public',
  },
  SEARCH: {
    path: ROUTES.SEARCH,
    requiresAuth: false,
    adminOnly: false,
    contributorOnly: false,
    feature: 'search',
    category: 'public',
  },
  FACT: {
    path: ROUTES.FACT,
    requiresAuth: false,
    adminOnly: false,
    contributorOnly: false,
    feature: 'fact details',
    category: 'public',
  },
  SUBMIT: {
    path: ROUTES.SUBMIT,
    requiresAuth: true,
    adminOnly: false,
    contributorOnly: false,
    feature: 'content submission',
    category: 'user',
    showPreview: true,
  },
  PROFILE: {
    path: ROUTES.PROFILE,
    requiresAuth: true,
    adminOnly: false,
    contributorOnly: false,
    feature: 'user profile',
    category: 'user',
    graceful: false,
  },
  GAMIFICATION: {
    path: ROUTES.GAMIFICATION,
    requiresAuth: true,
    adminOnly: false,
    contributorOnly: false,
    feature: 'challenges and rewards',
    category: 'user',
    showPreview: true,
  },
  BILLING: {
    path: ROUTES.BILLING,
    requiresAuth: true,
    adminOnly: false,
    contributorOnly: false,
    feature: 'billing and subscriptions',
    category: 'user',
    graceful: false,
  },
  SOCIAL: {
    path: ROUTES.SOCIAL,
    requiresAuth: true,
    adminOnly: false,
    contributorOnly: false,
    feature: 'social features',
    category: 'user',
    showPreview: true,
  },
  CONTRIBUTOR: {
    path: ROUTES.CONTRIBUTOR,
    requiresAuth: true,
    adminOnly: false,
    contributorOnly: false,
    feature: 'contributor program',
    category: 'user',
    showPreview: true,
  },
  ADMIN: {
    path: ROUTES.ADMIN,
    requiresAuth: true,
    adminOnly: true,
    contributorOnly: false,
    feature: 'admin dashboard',
    category: 'admin',
    graceful: false,
  },
  MONITORING: {
    path: ROUTES.MONITORING,
    requiresAuth: true,
    adminOnly: true,
    contributorOnly: false,
    feature: 'monitoring dashboard',
    category: 'admin',
    graceful: false,
  },
  SECURITY_AUDIT: {
    path: ROUTES.SECURITY_AUDIT,
    requiresAuth: true,
    adminOnly: true,
    contributorOnly: false,
    feature: 'security audit',
    category: 'admin',
    graceful: false,
  },
} as const;
