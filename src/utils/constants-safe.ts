// Simple constants file without any dependencies
export const APP_CONFIG = {
  name: 'Locale Lore',
  description: 'Discover and explore local stories, culture, and hidden gems',
  version: '1.0.0',
} as const;

export const API_CONFIG = {
  baseUrl: 'https://api.example.com',
  version: 'v1',
  timeout: 10000,
} as const;

export const ROUTES = {
  HOME: '/',
  NOT_FOUND: '*',
} as const;

export const BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1400,
} as const;