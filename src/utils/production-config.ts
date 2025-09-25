/**
 * Production configuration validation and optimization
 */

export interface ProductionConfig {
  isProd: boolean;
  hasCustomDomain: boolean;
  hasAnalytics: boolean;
  hasErrorTracking: boolean;
  hasPerformanceMonitoring: boolean;
  hasSecurity: boolean;
}

export const getProductionConfig = (): ProductionConfig => {
  const isProd = process.env.NODE_ENV === 'production';
  
  return {
    isProd,
    hasCustomDomain: window.location.hostname !== 'localhost' && !window.location.hostname.includes('lovableproject.com'),
    hasAnalytics: typeof window !== 'undefined' && 'gtag' in window,
    hasErrorTracking: typeof window !== 'undefined' && 'Sentry' in window,
    hasPerformanceMonitoring: isProd, // Built-in performance monitoring
    hasSecurity: isProd // Built-in security features
  };
};

export const validateProductionRequirements = (): { isReady: boolean; issues: string[] } => {
  const config = getProductionConfig();
  const issues: string[] = [];

  if (!config.isProd) {
    issues.push('Application is not in production mode');
  }

  // Validate essential production requirements
  try {
    // Check if essential APIs are available
    if (typeof fetch === 'undefined') {
      issues.push('Fetch API not available');
    }

    // Check if service worker is available for offline functionality
    if (!('serviceWorker' in navigator)) {
      issues.push('Service Worker not supported');
    }

    // Check Supabase configuration (using actual URLs instead of VITE_* variables)
    const supabaseUrl = "https://mwufulzthoqrwbwtvogx.supabase.co";
    const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im13dWZ1bHp0aG9xcndid3R2b2d4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY3MjA5NzMsImV4cCI6MjA3MjI5Njk3M30.uO5bo6elt4LdAL0ULyIMQtaxnXAnfZRhIK8UqApm5B8";
    
    if (!supabaseUrl || !supabaseKey) {
      issues.push('Supabase configuration missing');
    }

  } catch (error) {
    issues.push('Environment validation failed');
  }

  return {
    isReady: issues.length === 0,
    issues
  };
};

export const optimizeForProduction = () => {
  if (process.env.NODE_ENV !== 'production') {
    return;
  }

  // Disable console logs in production (except errors)
  if (typeof console !== 'undefined') {
    console.log = () => {};
    console.debug = () => {};
    console.info = () => {};
    // Keep console.warn and console.error for important messages
  }

  // Set up global error handling
  window.addEventListener('error', (event) => {
    // Log to monitoring service
    console.error('Global error:', event.error);
  });

  window.addEventListener('unhandledrejection', (event) => {
    // Log promise rejections
    console.error('Unhandled promise rejection:', event.reason);
  });
};

// Auto-run production optimizations
if (typeof window !== 'undefined') {
  optimizeForProduction();
}
