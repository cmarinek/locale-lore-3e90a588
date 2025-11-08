/**
 * Centralized logging utility for production-ready logging
 * 
 * Features:
 * - Environment-aware (no logs in production by default)
 * - Structured logging with context
 * - Log levels: debug, info, warn, error
 * - Integration-ready for monitoring services (Sentry, etc.)
 */

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  NONE = 4,
}

interface LogContext {
  component?: string;
  action?: string;
  userId?: string;
  [key: string]: any; // Allow any additional properties
}

class Logger {
  private minLevel: LogLevel;
  private isDevelopment: boolean;

  constructor() {
    this.isDevelopment = import.meta.env.DEV || import.meta.env.MODE === 'development';
    // In production, only log warnings and errors
    this.minLevel = this.isDevelopment ? LogLevel.DEBUG : LogLevel.WARN;
  }

  private shouldLog(level: LogLevel): boolean {
    return level >= this.minLevel;
  }

  private formatMessage(level: string, message: string, context?: LogContext): string {
    const timestamp = new Date().toISOString();
    const contextStr = context ? ` | ${JSON.stringify(context)}` : '';
    return `[${timestamp}] [${level}]${contextStr} ${message}`;
  }

  private sendToMonitoring(level: LogLevel, message: string, context?: LogContext, error?: Error) {
    // Integration point for monitoring services (Sentry, LogRocket, etc.)
    if (level >= LogLevel.ERROR && typeof window !== 'undefined') {
      // Send to error monitoring service
      // Example: Sentry.captureException(error || new Error(message), { extra: context });
    }
  }

  debug(message: string, context?: LogContext) {
    if (!this.shouldLog(LogLevel.DEBUG)) return;
    
    if (this.isDevelopment) {
      // eslint-disable-next-line no-console
      console.debug(this.formatMessage('DEBUG', message, context));
    }
  }

  info(message: string, context?: LogContext) {
    if (!this.shouldLog(LogLevel.INFO)) return;
    
    if (this.isDevelopment) {
      // eslint-disable-next-line no-console
      console.info(this.formatMessage('INFO', message, context));
    }
  }

  warn(message: string, context?: LogContext) {
    if (!this.shouldLog(LogLevel.WARN)) return;
    
    // eslint-disable-next-line no-console
    console.warn(this.formatMessage('WARN', message, context));
    this.sendToMonitoring(LogLevel.WARN, message, context);
  }

  error(message: string, error?: Error | unknown, context?: LogContext) {
    if (!this.shouldLog(LogLevel.ERROR)) return;
    
    const errorObj = error instanceof Error ? error : new Error(String(error));
    const fullContext = {
      ...context,
      stack: errorObj.stack,
      errorMessage: errorObj.message,
    };

    // eslint-disable-next-line no-console
    console.error(this.formatMessage('ERROR', message, fullContext), errorObj);
    this.sendToMonitoring(LogLevel.ERROR, message, fullContext, errorObj);
  }

  // Performance logging
  time(label: string) {
    if (this.isDevelopment) {
      // eslint-disable-next-line no-console
      console.time(label);
    }
  }

  timeEnd(label: string) {
    if (this.isDevelopment) {
      // eslint-disable-next-line no-console
      console.timeEnd(label);
    }
  }

  // Group logging for related operations
  group(label: string) {
    if (this.isDevelopment) {
      // eslint-disable-next-line no-console
      console.group(label);
    }
  }

  groupEnd() {
    if (this.isDevelopment) {
      // eslint-disable-next-line no-console
      console.groupEnd();
    }
  }
}

// Export singleton instance
export const logger = new Logger();

// Convenience exports
export const log = {
  debug: (message: string, context?: LogContext) => logger.debug(message, context),
  info: (message: string, context?: LogContext) => logger.info(message, context),
  warn: (message: string, context?: LogContext) => logger.warn(message, context),
  error: (message: string, error?: Error | unknown, context?: LogContext) => logger.error(message, error, context),
  time: (label: string) => logger.time(label),
  timeEnd: (label: string) => logger.timeEnd(label),
  group: (label: string) => logger.group(label),
  groupEnd: () => logger.groupEnd(),
};
