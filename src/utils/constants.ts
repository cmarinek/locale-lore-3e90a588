// Application constants
export const APP_CONFIG = {
  name: import.meta.env.VITE_APP_TITLE || 'React TypeScript PWA',
  description: import.meta.env.VITE_APP_DESCRIPTION || 'A modern React TypeScript PWA with iOS-inspired design',
  version: '1.0.0',
} as const;

export const API_CONFIG = {
  baseUrl: import.meta.env.VITE_API_BASE_URL || 'https://api.example.com',
  version: import.meta.env.VITE_API_VERSION || 'v1',
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