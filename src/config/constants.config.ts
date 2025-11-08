/**
 * Application Constants - SSOT
 * Other constants that don't fit into specific config files
 */

/**
 * Status constants
 */
export const STATUS = {
  FACT: {
    PENDING: 'pending',
    APPROVED: 'approved',
    REJECTED: 'rejected',
    DRAFT: 'draft',
  },
  USER: {
    ACTIVE: 'active',
    INACTIVE: 'inactive',
    BANNED: 'banned',
  },
  SUBSCRIPTION: {
    ACTIVE: 'active',
    CANCELED: 'canceled',
    PAST_DUE: 'past_due',
    UNPAID: 'unpaid',
    TRIALING: 'trialing',
  },
  CONTRIBUTOR: {
    PENDING: 'pending',
    APPROVED: 'approved',
    REJECTED: 'rejected',
    SUSPENDED: 'suspended',
  },
} as const;

/**
 * Error messages
 */
export const ERROR_MESSAGES = {
  NETWORK: 'Network error. Please check your connection.',
  UNAUTHORIZED: 'You are not authorized to perform this action.',
  FORBIDDEN: 'Access denied. You do not have permission.',
  NOT_FOUND: 'The requested resource was not found.',
  VALIDATION: 'Please check your input and try again.',
  UPLOAD: 'Failed to upload file. Please try again.',
  FILE_TOO_LARGE: 'File size exceeds the maximum limit.',
  INVALID_FILE_TYPE: 'Invalid file type. Please upload a supported format.',
  RATE_LIMIT: 'Too many requests. Please try again later.',
  SERVER_ERROR: 'A server error occurred. Please try again.',
  GENERIC: 'An unexpected error occurred. Please try again.',
  SESSION_EXPIRED: 'Your session has expired. Please log in again.',
  PAYMENT_FAILED: 'Payment failed. Please check your payment method.',
} as const;

/**
 * Success messages
 */
export const SUCCESS_MESSAGES = {
  SAVED: 'Changes saved successfully!',
  DELETED: 'Item deleted successfully!',
  UPLOADED: 'File uploaded successfully!',
  SENT: 'Message sent successfully!',
  UPDATED: 'Profile updated successfully!',
  CREATED: 'Created successfully!',
  PUBLISHED: 'Published successfully!',
  APPROVED: 'Approved successfully!',
  REJECTED: 'Rejected successfully!',
  SUBSCRIBED: 'Subscription activated successfully!',
  CANCELED: 'Subscription canceled successfully!',
  REFUNDED: 'Refund processed successfully!',
} as const;

/**
 * Notification types
 */
export const NOTIFICATION_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info',
} as const;

/**
 * Time constants (in milliseconds)
 */
export const TIME = {
  SECOND: 1000,
  MINUTE: 60 * 1000,
  HOUR: 60 * 60 * 1000,
  DAY: 24 * 60 * 60 * 1000,
  WEEK: 7 * 24 * 60 * 60 * 1000,
  MONTH: 30 * 24 * 60 * 60 * 1000,
  YEAR: 365 * 24 * 60 * 60 * 1000,
} as const;

/**
 * Local storage keys (not sensitive data)
 */
export const STORAGE_KEYS = {
  THEME: 'theme',
  LANGUAGE: 'i18nextLng',
  COOKIE_CONSENT: 'cookie-consent',
  MAP_STATE: 'map-state',
  SEARCH_HISTORY: 'search-history',
  FAVORITE_CITIES: 'favorite-cities',
  RECENT_LOCATIONS: 'recent-locations',
  ONBOARDING_COMPLETE: 'onboarding-complete',
  TUTORIAL_SEEN: 'tutorial-seen',
} as const;

/**
 * Validation patterns
 */
export const VALIDATION_PATTERNS = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  URL: /^https?:\/\/.+/,
  PHONE: /^\+?[\d\s-()]+$/,
  USERNAME: /^[a-zA-Z0-9_-]{3,20}$/,
  HEX_COLOR: /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/,
} as const;

/**
 * Media query breakpoints (for JS)
 */
export const MEDIA_QUERIES = {
  MOBILE: '(max-width: 768px)',
  TABLET: '(min-width: 769px) and (max-width: 1024px)',
  DESKTOP: '(min-width: 1025px)',
  TOUCH: '(hover: none) and (pointer: coarse)',
  MOUSE: '(hover: hover) and (pointer: fine)',
  REDUCED_MOTION: '(prefers-reduced-motion: reduce)',
  DARK_MODE: '(prefers-color-scheme: dark)',
} as const;

/**
 * External service URLs
 */
export const EXTERNAL_URLS = {
  GITHUB: 'https://github.com/yourusername/locale-lore',
  DISCORD: 'https://discord.gg/locale-lore',
  TWITTER: 'https://twitter.com/localelore',
  DOCUMENTATION: 'https://docs.geocachelore.com',
  STATUS_PAGE: 'https://status.geocachelore.com',
  SUPPORT_EMAIL: 'support@geocachelore.com',
} as const;

/**
 * Search debounce delays
 */
export const DEBOUNCE_DELAYS = {
  SEARCH: 300,
  INPUT: 500,
  RESIZE: 150,
  SCROLL: 100,
} as const;
