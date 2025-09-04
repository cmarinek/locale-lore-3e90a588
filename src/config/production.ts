export const productionConfig = {
  // Security settings
  ENABLE_CSP: true,
  ENABLE_HSTS: true,
  ENABLE_XSS_PROTECTION: true,
  
  // Performance settings
  ENABLE_COMPRESSION: true,
  ENABLE_CACHING: true,
  CACHE_MAX_AGE: 31536000, // 1 year
  
  // Monitoring settings
  ENABLE_ERROR_TRACKING: true,
  ENABLE_PERFORMANCE_MONITORING: true,
  LOG_LEVEL: 'error' as const,
  
  // Rate limiting
  API_RATE_LIMIT: 100, // requests per minute
  UPLOAD_RATE_LIMIT: 10, // uploads per minute
  
  // Database settings
  CONNECTION_POOL_SIZE: 10,
  QUERY_TIMEOUT: 30000, // 30 seconds
  
  // Media settings
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_FILE_TYPES: ['image/jpeg', 'image/png', 'image/webp', 'video/mp4'],
  
  // Analytics
  TRACK_USER_BEHAVIOR: true,
  ANONYMIZE_IPS: true,
  
  // Feature flags
  MAINTENANCE_MODE: false,
  FEATURE_FLAGS: {
    STORIES: true,
    GAMIFICATION: true,
    SOCIAL_FEATURES: true,
    AI_RECOMMENDATIONS: true
  }
};

export type ProductionConfig = typeof productionConfig;