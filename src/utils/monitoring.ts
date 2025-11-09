
import * as Sentry from '@sentry/react';
import { config } from '@/config/environments';
import { logger } from './logger';

// Initialize Sentry for error tracking with comprehensive configuration
export const initializeErrorTracking = () => {
  try {
    const sentryDsn = import.meta.env.VITE_SENTRY_DSN || config.sentryDsn;
    
    if (config.enableErrorTracking && sentryDsn) {
      Sentry.init({
        dsn: sentryDsn,
        environment: config.environment,
        release: `geocache-lore@${import.meta.env.VITE_APP_VERSION || '2.0.0'}`,
        
        // Performance monitoring
        integrations: [
          Sentry.browserTracingIntegration(),
          Sentry.replayIntegration({
            maskAllText: true,
            blockAllMedia: true,
            maskAllInputs: true,
          }),
          Sentry.feedbackIntegration({
            colorScheme: 'system',
          }),
        ],
        
        // Sampling rates
        tracesSampleRate: config.environment === 'production' ? 0.1 : 1.0,
        replaysSessionSampleRate: config.environment === 'production' ? 0.1 : 0.5,
        replaysOnErrorSampleRate: 1.0,
        
        // Error filtering
        beforeSend(event, hint) {
          // Don't send errors from browser extensions
          if (event.exception?.values?.[0]?.value?.includes('chrome-extension://')) {
            return null;
          }
          
          // Filter out network errors that are expected
          if (hint.originalException instanceof Error) {
            const message = hint.originalException.message;
            if (message.includes('Network request failed') || message.includes('Failed to fetch')) {
              return null;
            }
          }
          
          return event;
        },
        
        // Breadcrumbs configuration
        maxBreadcrumbs: 50,
        
        // User identification
        initialScope: {
          tags: {
            'app.version': '2.0.0',
            'app.name': 'GeoCache Lore',
          },
        },
      });
      
      logger.info('Sentry error tracking initialized', {
        component: 'monitoring',
        environment: config.environment,
      });
    } else {
      logger.warn('Sentry DSN not configured - error tracking disabled', {
        component: 'monitoring',
      });
    }
  } catch (error) {
    logger.error('Failed to initialize error tracking', error as Error, {
      component: 'monitoring',
    });
  }
};

// Performance monitoring with Web Vitals
export const initializePerformanceMonitoring = () => {
  try {
    if ('PerformanceObserver' in window) {
      // Core Web Vitals monitoring
      const observer = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          if (entry.entryType === 'largest-contentful-paint') {
            trackMetric('lcp', entry.startTime);
          }
          
          if (entry.entryType === 'first-input') {
            const fid = (entry as any).processingStart - entry.startTime;
            trackMetric('fid', fid);
          }
          
          if (entry.entryType === 'layout-shift' && !(entry as any).hadRecentInput) {
            trackMetric('cls', (entry as any).value);
          }
        });
      });

      observer.observe({ entryTypes: ['largest-contentful-paint', 'first-input', 'layout-shift'] });
      
      // Navigation timing
      window.addEventListener('load', () => {
        try {
          const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
          
          const metrics = {
            fcp: navigation.responseStart - navigation.fetchStart,
            ttfb: navigation.responseStart - navigation.requestStart,
            domLoad: navigation.domContentLoadedEventEnd - navigation.fetchStart,
            windowLoad: navigation.loadEventEnd - navigation.fetchStart,
          };
          
          Object.entries(metrics).forEach(([key, value]) => {
            trackMetric(key, value);
          });
        } catch (error) {
          console.error('Performance timing error:', error);
        }
      });
    }
  } catch (error) {
    console.error('Failed to initialize performance monitoring:', error);
  }
};

// Track custom metrics
export const trackMetric = (name: string, value: number, labels?: Record<string, string>) => {
  // Send to analytics service
  if (config.enableAnalytics && (window as any).gtag) {
    (window as any).gtag('event', 'performance_metric', {
      metric_name: name,
      metric_value: value,
      ...labels,
    });
  }
  
  // Only track to analytics, no console logging
  // Removed debug logging to reduce console noise
};

// Custom error tracking with enhanced context
export const trackError = (error: Error, context?: Record<string, any>) => {
  if (config.enableErrorTracking) {
    Sentry.captureException(error, {
      level: 'error',
      extra: context,
      tags: {
        component: context?.component,
        action: context?.action,
      },
      fingerprint: [error.name, error.message],
    });
  }
  
  logger.error('Application Error', error, context);
};

// Track user actions for debugging
export const trackUserAction = (action: string, properties?: Record<string, any>) => {
  if (config.enableErrorTracking) {
    Sentry.addBreadcrumb({
      category: 'user-action',
      message: action,
      level: 'info',
      data: properties,
    });
  }
  
  logger.debug('User action tracked', { action, ...properties });
};

// Set user context for error tracking
export const setUserContext = (userId: string, email?: string, username?: string) => {
  if (config.enableErrorTracking) {
    Sentry.setUser({
      id: userId,
      email,
      username,
    });
  }
  
  logger.debug('User context set', { userId, email, username });
};

// Clear user context on logout
export const clearUserContext = () => {
  if (config.enableErrorTracking) {
    Sentry.setUser(null);
  }
  
  logger.debug('User context cleared');
};

// Performance marks and measures
export const performanceMark = (name: string) => {
  if ('performance' in window && performance.mark) {
    performance.mark(name);
  }
};

export const performanceMeasure = (name: string, startMark: string, endMark?: string) => {
  if ('performance' in window && performance.measure) {
    performance.measure(name, startMark, endMark);
    
    const measure = performance.getEntriesByName(name, 'measure')[0];
    if (measure) {
      trackMetric(`custom_${name}`, measure.duration);
    }
  }
};
