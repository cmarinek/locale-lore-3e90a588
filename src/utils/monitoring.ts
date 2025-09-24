
import * as Sentry from '@sentry/react';
import { config } from '@/config/environments';

// Initialize Sentry for error tracking
export const initializeErrorTracking = () => {
  try {
    if (config.enableErrorTracking && config.sentryDsn) {
      Sentry.init({
        dsn: config.sentryDsn,
        environment: config.environment,
        integrations: [
          Sentry.browserTracingIntegration(),
          Sentry.replayIntegration({
            maskAllText: true,
            blockAllMedia: true,
          }),
        ],
        tracesSampleRate: config.environment === 'production' ? 0.1 : 1.0,
        replaysSessionSampleRate: 0.1,
        replaysOnErrorSampleRate: 1.0,
      });
    }
  } catch (error) {
    console.error('Failed to initialize error tracking:', error);
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

// Custom error tracking
export const trackError = (error: Error, context?: Record<string, any>) => {
  if (config.enableErrorTracking) {
    Sentry.captureException(error, {
      extra: context,
    });
  }
  
  console.error('Application Error:', error, context);
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
