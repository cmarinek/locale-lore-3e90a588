/**
 * Application Configuration - SSOT
 * Consolidated from multiple duplicate files
 */

export const APP_CONFIG = {
  NAME: 'Locale Lore',
  FULL_NAME: 'GeoCache Lore',
  VERSION: '2.0.0',
  DESCRIPTION: 'Discover and share location-based stories and hidden gems',
  URL: 'https://geocachelore.com',
  AUTHOR: 'Locale Lore Team',
} as const;

export const MAP_CONFIG = {
  DEFAULT_CENTER: { lat: 40.7128, lng: -74.0060 }, // New York City
  DEFAULT_ZOOM: 12,
  MIN_ZOOM: 3,
  MAX_ZOOM: 18,
  CLUSTER_RADIUS: 50,
  CLUSTER_MAX_ZOOM: 14,
} as const;

export const LIMITS = {
  // File upload limits
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB (production config)
  MAX_IMAGE_SIZE: 5 * 1024 * 1024, // 5MB
  
  // Content limits
  MAX_TITLE_LENGTH: 100,
  MAX_DESCRIPTION_LENGTH: 2000,
  MAX_CONTENT_LENGTH: 1000,
  MAX_TAGS: 10,
  MAX_IMAGES_PER_STORY: 5,
  
  // Authentication
  MIN_PASSWORD_LENGTH: 8,
  
  // Search and pagination
  MAX_SEARCH_RESULTS: 50,
  ITEMS_PER_PAGE: 20,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
  INFINITE_SCROLL_THRESHOLD: 10,
} as const;

export const UI_CONSTANTS = {
  BREAKPOINTS: {
    sm: 640,
    md: 768,
    lg: 1024,
    xl: 1280,
    '2xl': 1400,
    MOBILE: 768,
    TABLET: 1024,
    DESKTOP: 1280,
  },
  ANIMATION_DURATIONS: {
    FAST: 150,
    NORMAL: 300,
    SLOW: 500,
  },
  Z_INDEX: {
    DROPDOWN: 50,
    MODAL: 100,
    TOAST: 200,
    TOOLTIP: 300,
  },
} as const;

export const API_CONFIG = {
  ENDPOINTS: {
    FACTS: '/api/facts',
    SEARCH: '/api/search',
    USER: '/api/user',
    UPLOAD: '/api/upload',
  },
  PAGINATION: {
    DEFAULT_LIMIT: 20,
    MAX_LIMIT: 100,
  },
  RETRY: {
    MAX_ATTEMPTS: 3,
    INITIAL_DELAY: 1000,
    BACKOFF_FACTOR: 2,
  },
  TIMEOUTS: {
    DEFAULT: 30000,
    UPLOAD: 60000,
    DOWNLOAD: 45000,
  },
} as const;

export const CACHE_KEYS = {
  STORIES: 'stories',
  PROFILE: 'profile',
  LOCATIONS: 'locations',
  CATEGORIES: 'categories',
} as const;

export const CATEGORIES = [
  'historical',
  'nature',
  'urban',
  'cultural',
  'adventure',
  'food',
  'art',
  'technology',
  'sports',
  'other',
] as const;

export const PRIVACY_LEVELS = ['public', 'friends', 'private'] as const;

export const SUPPORTED_LANGUAGES = ['en', 'es', 'fr', 'de', 'it', 'pt', 'ja', 'zh'] as const;

export const SUPPORTED_IMAGE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'video/mp4', // from production config
] as const;

export const RATE_LIMITS = {
  STORY_CREATION: { max: 10, window: 3600000 }, // 10 per hour
  IMAGE_UPLOAD: { max: 20, window: 3600000 }, // 20 per hour
  SEARCH: { max: 100, window: 60000 }, // 100 per minute
  API_RATE_LIMIT: 100, // requests per minute
  UPLOAD_RATE_LIMIT: 10, // uploads per minute
} as const;
