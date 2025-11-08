// Application-wide constants - Single Source of Truth

export const APP_CONFIG = {
  NAME: 'GeoCache Lore',
  VERSION: '2.0.0',
  DESCRIPTION: 'Discover and share location-based stories and experiences',
  URL: 'https://geocachelore.com',
} as const;

export const MAP_CONFIG = {
  DEFAULT_CENTER: { lat: 40.7128, lng: -74.0060 },
  DEFAULT_ZOOM: 12,
  MIN_ZOOM: 3,
  MAX_ZOOM: 18,
  CLUSTER_RADIUS: 50,
  CLUSTER_MAX_ZOOM: 14,
} as const;

export const LIMITS = {
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  MAX_TITLE_LENGTH: 100,
  MAX_DESCRIPTION_LENGTH: 2000,
  MAX_TAGS: 10,
  MAX_IMAGES_PER_STORY: 5,
  MIN_PASSWORD_LENGTH: 8,
  MAX_SEARCH_RESULTS: 50,
  ITEMS_PER_PAGE: 20,
} as const;

export const ROUTES = {
  HOME: '/',
  MAP: '/map',
  HYBRID: '/hybrid',
  STORIES: '/stories',
  SUBMIT: '/submit',
  PROFILE: '/profile',
  AUTH: '/auth',
  SEARCH: '/search',
  SOCIAL: '/social',
  GAMIFICATION: '/gamification',
  ADMIN: '/admin',
  PRIVACY: '/privacy',
  TERMS: '/terms',
  SUPPORT: '/support',
} as const;

export const STORAGE_KEYS = {
  THEME: 'theme',
  LANGUAGE: 'language',
  COOKIE_CONSENT: 'cookie-consent',
  MAP_STATE: 'map-state',
  SEARCH_HISTORY: 'search-history',
  FAVORITE_CITIES: 'favorite-cities',
  RECENT_LOCATIONS: 'recent-locations',
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

export const SUPPORTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'] as const;

export const API_TIMEOUTS = {
  DEFAULT: 30000,
  UPLOAD: 60000,
  DOWNLOAD: 45000,
} as const;

export const RATE_LIMITS = {
  STORY_CREATION: { max: 10, window: 3600000 }, // 10 per hour
  IMAGE_UPLOAD: { max: 20, window: 3600000 }, // 20 per hour
  SEARCH: { max: 100, window: 60000 }, // 100 per minute
} as const;

export const NOTIFICATION_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info',
} as const;
