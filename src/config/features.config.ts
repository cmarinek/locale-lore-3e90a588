/**
 * Feature Flags - SSOT
 * Central control for all feature toggles
 */

export const FEATURES = {
  // Core features
  STORIES: true,
  GAMIFICATION: true,
  SOCIAL_FEATURES: true,
  AI_RECOMMENDATIONS: true,
  OFFLINE_MODE: true,
  REAL_TIME_UPDATES: true,
  ADVANCED_SEARCH: true,
  
  // Content features
  USER_SUBMISSIONS: true,
  CONTENT_MODERATION: true,
  AUTO_CATEGORIZATION: true,
  
  // Social features
  COMMENTS: true,
  LIKES: true,
  SHARES: true,
  FOLLOWERS: true,
  
  // Gamification features
  ACHIEVEMENTS: true,
  LEADERBOARDS: true,
  POINTS_SYSTEM: true,
  BADGES: true,
  
  // Admin features
  ADMIN_DASHBOARD: true,
  MONITORING_DASHBOARD: true,
  SECURITY_AUDIT: true,
  ANALYTICS: true,
  
  // Contributor features
  CONTRIBUTOR_PROGRAM: true,
  REVENUE_SHARING: true,
  CONTRIBUTOR_ANALYTICS: true,
  
  // Billing features
  STRIPE_PAYMENTS: true,
  SUBSCRIPTIONS: true,
  PROMO_CODES: true,
  
  // Mobile features
  PWA: true,
  NATIVE_APPS: true,
  PUSH_NOTIFICATIONS: true,
  OFFLINE_SYNC: true,
  
  // Privacy features
  GDPR_COMPLIANCE: true,
  DATA_EXPORT: true,
  ACCOUNT_DELETION: true,
  COOKIE_CONSENT: true,
  PRIVACY_SETTINGS: true,
  
  // Development features
  DEBUG_MODE: import.meta.env.DEV,
  FEATURE_SHOWCASE: import.meta.env.DEV,
  TRANSLATION_TEST: import.meta.env.DEV,
} as const;

/**
 * Feature availability by user role
 */
export const FEATURE_ACCESS = {
  public: [
    'STORIES',
    'ADVANCED_SEARCH',
    'OFFLINE_MODE',
  ],
  authenticated: [
    'USER_SUBMISSIONS',
    'GAMIFICATION',
    'SOCIAL_FEATURES',
    'AI_RECOMMENDATIONS',
    'ACHIEVEMENTS',
    'LEADERBOARDS',
    'POINTS_SYSTEM',
    'COMMENTS',
    'LIKES',
    'SHARES',
    'FOLLOWERS',
    'PRIVACY_SETTINGS',
  ],
  contributor: [
    'CONTRIBUTOR_PROGRAM',
    'CONTRIBUTOR_ANALYTICS',
  ],
  admin: [
    'ADMIN_DASHBOARD',
    'MONITORING_DASHBOARD',
    'SECURITY_AUDIT',
    'ANALYTICS',
    'CONTENT_MODERATION',
  ],
} as const;

/**
 * Feature-specific configuration
 */
export const FEATURE_CONFIG = {
  GAMIFICATION: {
    POINTS_PER_SUBMISSION: 10,
    POINTS_PER_LIKE: 1,
    POINTS_PER_COMMENT: 2,
    POINTS_PER_ACHIEVEMENT: 50,
    LEADERBOARD_UPDATE_INTERVAL: 300000, // 5 minutes
  },
  CONTENT_MODERATION: {
    AUTO_APPROVE_THRESHOLD: 0.9,
    MANUAL_REVIEW_THRESHOLD: 0.5,
    AUTO_REJECT_THRESHOLD: 0.3,
  },
  RATE_LIMITING: {
    ENABLED: true,
    STRICT_MODE: false,
  },
  ANALYTICS: {
    TRACK_PAGE_VIEWS: true,
    TRACK_USER_ACTIONS: true,
    ANONYMIZE_IPS: true,
  },
} as const;

/**
 * Helper to check if feature is enabled
 */
export function isFeatureEnabled(feature: keyof typeof FEATURES): boolean {
  return FEATURES[feature] === true;
}

/**
 * Helper to check if user has access to feature
 */
export function hasFeatureAccess(
  feature: string,
  userRole: keyof typeof FEATURE_ACCESS
): boolean {
  const roleFeatures = FEATURE_ACCESS[userRole];
  return roleFeatures.some(f => f === feature);
}
