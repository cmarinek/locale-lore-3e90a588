// Sentry configuration and utilities
import * as Sentry from '@sentry/react';
import { logger } from '@/utils/logger';

/**
 * Create Sentry error boundary wrapper
 */
export const createSentryErrorBoundary = () => {
  return Sentry.ErrorBoundary;
};

/**
 * Profiler for performance tracking
 */
export const SentryProfiler = Sentry.Profiler;

/**
 * Capture a custom message to Sentry
 */
export const captureMessage = (message: string, level: Sentry.SeverityLevel = 'info', context?: Record<string, any>) => {
  Sentry.captureMessage(message, {
    level,
    extra: context,
  });
  
  logger.info('Sentry message captured', { message, level, ...context });
};

/**
 * Capture an exception to Sentry
 */
export const captureException = (error: Error, context?: Record<string, any>) => {
  Sentry.captureException(error, {
    extra: context,
    tags: {
      component: context?.component,
    },
  });
  
  logger.error('Sentry exception captured', error, context);
};

/**
 * Add breadcrumb for debugging
 */
export const addBreadcrumb = (message: string, category: string, data?: Record<string, any>) => {
  Sentry.addBreadcrumb({
    message,
    category,
    level: 'info',
    data,
  });
};

/**
 * Track route changes
 */
export const trackNavigation = (from: string, to: string) => {
  Sentry.addBreadcrumb({
    category: 'navigation',
    message: `Navigated from ${from} to ${to}`,
    level: 'info',
    data: { from, to },
  });
};

/**
 * Set custom tags for error context
 */
export const setTags = (tags: Record<string, string>) => {
  Sentry.setTags(tags);
};

/**
 * Set custom context data
 */
export const setContext = (name: string, context: Record<string, any>) => {
  Sentry.setContext(name, context);
};
