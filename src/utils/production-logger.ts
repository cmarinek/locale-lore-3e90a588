/**
 * Production-safe logging utility
 * In production, logs are filtered and potentially sent to monitoring services
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: Date;
  data?: any;
  userId?: string;
}

class ProductionLogger {
  private isDevelopment = process.env.NODE_ENV === 'development';
  private logBuffer: LogEntry[] = [];
  private maxBufferSize = 100;

  debug(message: string, data?: any) {
    if (this.isDevelopment) {
      console.debug(`[DEBUG] ${message}`, data);
    }
    this.addToBuffer('debug', message, data);
  }

  info(message: string, data?: any) {
    if (this.isDevelopment) {
      console.info(`[INFO] ${message}`, data);
    } else {
      // In production, only log important info
      console.log(message);
    }
    this.addToBuffer('info', message, data);
  }

  warn(message: string, data?: any) {
    console.warn(`[WARN] ${message}`, data);
    this.addToBuffer('warn', message, data);
  }

  error(message: string, error?: any) {
    console.error(`[ERROR] ${message}`, error);
    this.addToBuffer('error', message, error);
    
    // In production, you might want to send errors to a monitoring service
    if (!this.isDevelopment && typeof window !== 'undefined') {
      // Example: Send to error tracking service
      this.sendToMonitoring('error', message, error);
    }
  }

  private addToBuffer(level: LogLevel, message: string, data?: any) {
    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date(),
      data
    };

    this.logBuffer.push(entry);
    
    // Keep buffer size manageable
    if (this.logBuffer.length > this.maxBufferSize) {
      this.logBuffer.shift();
    }
  }

  private sendToMonitoring(level: LogLevel, message: string, data?: any) {
    // In a real production app, you'd send this to your monitoring service
    // Examples: Sentry, LogRocket, DataDog, etc.
    try {
      // Example implementation:
      // fetch('/api/logs', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ level, message, data, timestamp: new Date() })
      // });
    } catch (error) {
      // Silently fail - don't break the app if logging fails
    }
  }

  getRecentLogs(count = 50): LogEntry[] {
    return this.logBuffer.slice(-count);
  }

  clearBuffer() {
    this.logBuffer = [];
  }
}

export const logger = new ProductionLogger();

// Export convenience methods
export const logDebug = (message: string, data?: any) => logger.debug(message, data);
export const logInfo = (message: string, data?: any) => logger.info(message, data);
export const logWarn = (message: string, data?: any) => logger.warn(message, data);
export const logError = (message: string, error?: any) => logger.error(message, error);
