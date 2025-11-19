
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

// CSRF protection
export const generateCSRFToken = (): string => {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
};

// Session management
export class SessionManager {
  private static instance: SessionManager;
  private sessionTimeout: number = 30 * 60 * 1000; // 30 minutes
  private lastActivity: number = Date.now();

  static getInstance(): SessionManager {
    if (!SessionManager.instance) {
      SessionManager.instance = new SessionManager();
    }
    return SessionManager.instance;
  }

  updateActivity(): void {
    this.lastActivity = Date.now();
  }

  isSessionValid(): boolean {
    return Date.now() - this.lastActivity < this.sessionTimeout;
  }

  getTimeUntilExpiry(): number {
    return Math.max(0, this.sessionTimeout - (Date.now() - this.lastActivity));
  }
}

// Enhanced security utilities
export class SecurityUtils {
  // XSS Protection
  static sanitizeHTML(html: string): string {
    const allowedTags = ['p', 'br', 'strong', 'em', 'u', 'a', 'ul', 'ol', 'li'];
    const allowedAttributes = ['href', 'target'];
    
    // Basic sanitization - in production, use DOMPurify
    return html.replace(/<[^>]*>/g, (match) => {
      const tagName = match.match(/<\/?(\w+)/)?.[1]?.toLowerCase();
      if (!tagName || !allowedTags.includes(tagName)) {
        return '';
      }
      return match;
    });
  }

  // Secure local storage
  static setSecureItem(key: string, value: any): void {
    try {
      const encrypted = btoa(JSON.stringify(value));
      localStorage.setItem(`secure_${key}`, encrypted);
    } catch (error) {
      console.error('Failed to store secure item:', error);
    }
  }

  static getSecureItem(key: string): any {
    try {
      const encrypted = localStorage.getItem(`secure_${key}`);
      if (!encrypted) return null;
      return JSON.parse(atob(encrypted));
    } catch (error) {
      console.error('Failed to retrieve secure item:', error);
      return null;
    }
  }

  // Environment validation
  static validateEnvironment(): boolean {
    // Check if Supabase is properly configured
    try {
      const supabaseUrl = "https://mwufulzthoqrwbwtvogx.supabase.co";
      const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im13dWZ1bHp0aG9xcndid3R2b2d4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY3MjA5NzMsImV4cCI6MjA3MjI5Njk3M30.uO5bo6elt4LdAL0ULyIMQtaxnXAnfZRhIK8UqApm5B8";
      
      if (!supabaseUrl || !supabaseKey) {
        console.error('Supabase configuration is missing');
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Environment validation failed:', error);
      return false;
    }
  }

  // Content validation
  static validateContent(content: string, maxLength: number = 1000): boolean {
    if (!content || content.length > maxLength) return false;
    
    // Check for suspicious patterns
    const suspiciousPatterns = [
      /<script[^>]*>.*?<\/script>/gi,
      /javascript:/gi,
      /data:text\/html/gi,
      /vbscript:/gi,
    ];

    return !suspiciousPatterns.some(pattern => pattern.test(content));
  }

  // Password strength validation
  static validatePasswordStrength(password: string): {
    isValid: boolean;
    score: number;
    feedback: string[];
  } {
    const feedback: string[] = [];
    let score = 0;

    if (password.length >= 8) {
      score += 1;
    } else {
      feedback.push('Use at least 8 characters');
    }

    if (/[A-Z]/.test(password)) {
      score += 1;
    } else {
      feedback.push('Include uppercase letters');
    }

    if (/[a-z]/.test(password)) {
      score += 1;
    } else {
      feedback.push('Include lowercase letters');
    }

    if (/\d/.test(password)) {
      score += 1;
    } else {
      feedback.push('Include numbers');
    }

    if (/[^A-Za-z0-9]/.test(password)) {
      score += 1;
    } else {
      feedback.push('Include special characters');
    }

    return {
      isValid: score >= 3,
      score,
      feedback
    };
  }

  // Generate secure random ID
  static generateSecureId(length: number = 16): string {
    const array = new Uint8Array(length);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }
}

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
    
    const requests = this.requests.get(key);
    
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
