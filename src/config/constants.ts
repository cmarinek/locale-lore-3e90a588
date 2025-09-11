// Single source of truth for application constants
export const APP_CONFIG = {
  NAME: 'Locale Lore',
  VERSION: '1.0.0',
  DESCRIPTION: 'Discover hidden gems and local stories in your area',
  AUTHOR: 'Locale Lore Team'
} as const;

// Navigation constants
export const ROUTES = {
  HOME: '/',
  EXPLORE: '/explore',
  MAP: '/map',
  SEARCH: '/search',
  SUBMIT: '/submit',
  PROFILE: '/profile',
  FACT: '/fact',
  AUTH: '/auth',
  ADMIN: '/admin',
  BILLING: '/billing',
  SOCIAL: '/social',
  STORIES: '/stories'
} as const;

// UI Constants
export const UI_CONSTANTS = {
  BREAKPOINTS: {
    MOBILE: 768,
    TABLET: 1024,
    DESKTOP: 1280
  },
  ANIMATION_DURATIONS: {
    FAST: 150,
    NORMAL: 300,
    SLOW: 500
  },
  Z_INDEX: {
    DROPDOWN: 50,
    MODAL: 100,
    TOAST: 200,
    TOOLTIP: 300
  },
  LIMITS: {
    FACT_TITLE_LENGTH: 100,
    FACT_CONTENT_LENGTH: 1000,
    SEARCH_DEBOUNCE: 300,
    INFINITE_SCROLL_THRESHOLD: 10
  }
} as const;

// API Constants
export const API_CONFIG = {
  ENDPOINTS: {
    FACTS: '/api/facts',
    SEARCH: '/api/search',
    USER: '/api/user',
    UPLOAD: '/api/upload'
  },
  PAGINATION: {
    DEFAULT_LIMIT: 20,
    MAX_LIMIT: 100
  },
  RETRY: {
    MAX_ATTEMPTS: 3,
    INITIAL_DELAY: 1000,
    BACKOFF_FACTOR: 2
  }
} as const;

// Status constants
export const STATUS = {
  FACT: {
    PENDING: 'pending',
    APPROVED: 'approved',
    REJECTED: 'rejected',
    DRAFT: 'draft'
  },
  USER: {
    ACTIVE: 'active',
    INACTIVE: 'inactive',
    BANNED: 'banned'
  },
  SUBSCRIPTION: {
    ACTIVE: 'active',
    CANCELED: 'canceled',
    PAST_DUE: 'past_due',
    UNPAID: 'unpaid'
  }
} as const;

// Feature flags
export const FEATURES = {
  GAMIFICATION: true,
  SOCIAL_FEATURES: true,
  AI_RECOMMENDATIONS: true,
  OFFLINE_MODE: true,
  REAL_TIME_UPDATES: true,
  ADVANCED_SEARCH: true
} as const;

// Error messages
export const ERROR_MESSAGES = {
  NETWORK: 'Network error. Please check your connection.',
  UNAUTHORIZED: 'You are not authorized to perform this action.',
  NOT_FOUND: 'The requested resource was not found.',
  VALIDATION: 'Please check your input and try again.',
  UPLOAD: 'Failed to upload file. Please try again.',
  GENERIC: 'An unexpected error occurred. Please try again.'
} as const;

// Success messages
export const SUCCESS_MESSAGES = {
  SAVED: 'Changes saved successfully!',
  DELETED: 'Item deleted successfully!',
  UPLOADED: 'File uploaded successfully!',
  SENT: 'Message sent successfully!',
  UPDATED: 'Profile updated successfully!'
} as const;