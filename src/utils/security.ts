
// Content Security Policy configuration
export const getCSPConfig = () => {
  const isDevelopment = import.meta.env.DEV;
  
  const basePolicy = {
    'default-src': ["'self'"],
    'script-src': [
      "'self'",
      "'unsafe-inline'", // Required for Vite in development
      'https://www.googletagmanager.com',
      'https://plausible.io',
      ...(isDevelopment ? ["'unsafe-eval'"] : []),
    ],
    'style-src': [
      "'self'",
      "'unsafe-inline'", // Required for CSS-in-JS
      'https://fonts.googleapis.com',
    ],
    'font-src': [
      "'self'",
      'https://fonts.gstatic.com',
      'data:',
    ],
    'img-src': [
      "'self'",
      'data:',
      'blob:',
      'https:',
      'https://*.supabase.co',
      'https://maps.googleapis.com',
    ],
    'connect-src': [
      "'self'",
      'https://*.supabase.co',
      'https://api.mapbox.com',
      'https://www.google-analytics.com',
      'https://plausible.io',
      ...(isDevelopment ? ['ws:', 'wss:'] : []),
    ],
    'frame-src': [
      "'self'",
      'https://www.google.com',
    ],
    'worker-src': [
      "'self'",
      'blob:',
    ],
    'manifest-src': ["'self'"],
    'base-uri': ["'self'"],
    'form-action': ["'self'"],
    'frame-ancestors': ["'none'"],
    'object-src': ["'none'"],
    'media-src': [
      "'self'",
      'https://*.supabase.co',
    ],
  };

  return Object.entries(basePolicy)
    .map(([key, values]) => `${key} ${values.join(' ')}`)
    .join('; ');
};

// Security headers
export const securityHeaders = {
  // Content Security Policy
  'Content-Security-Policy': getCSPConfig(),
  
  // Prevent XSS attacks
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  
  // HTTPS enforcement
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
  
  // Referrer policy
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  
  // Permissions policy
  'Permissions-Policy': [
    'camera=()',
    'microphone=()',
    'geolocation=(self)',
    'notifications=(self)',
    'payment=()',
    'usb=()',
  ].join(', '),
};

// Input sanitization
export const sanitizeInput = (input: string): string => {
  return input
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: protocols
    .replace(/on\w+=/gi, '') // Remove event handlers
    .trim();
};

// Validate URLs
export const isValidUrl = (url: string): boolean => {
  try {
    const parsed = new URL(url);
    return ['http:', 'https:'].includes(parsed.protocol);
  } catch {
    return false;
  }
};

// Rate limiting (client-side)
export class RateLimiter {
  private requests: Map<string, number[]> = new Map();

  public isAllowed(key: string, maxRequests: number, windowMs: number): boolean {
    const now = Date.now();
    const windowStart = now - windowMs;
    
    if (!this.requests.has(key)) {
      this.requests.set(key, []);
    }
    
    const requests = this.requests.get(key)!;
    
    // Remove old requests
    const validRequests = requests.filter(time => time > windowStart);
    this.requests.set(key, validRequests);
    
    if (validRequests.length >= maxRequests) {
      return false;
    }
    
    // Add current request
    validRequests.push(now);
    return true;
  }
}

export const rateLimiter = new RateLimiter();
