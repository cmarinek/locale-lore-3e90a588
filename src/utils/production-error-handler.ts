interface ErrorReport {
  id: string;
  timestamp: string;
  error: {
    message: string;
    stack?: string;
    name: string;
  };
  context: {
    url: string;
    userAgent: string;
    userId?: string;
    componentStack?: string;
  };
  severity: 'low' | 'medium' | 'high' | 'critical';
  resolved: boolean;
}

class ProductionErrorHandler {
  private static instance: ProductionErrorHandler;
  private errorQueue: ErrorReport[] = [];
  private isOnline = navigator.onLine;

  static getInstance(): ProductionErrorHandler {
    if (!ProductionErrorHandler.instance) {
      ProductionErrorHandler.instance = new ProductionErrorHandler();
    }
    return ProductionErrorHandler.instance;
  }

  constructor() {
    // Monitor online status
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.flushErrorQueue();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
    });

    // Set up global error handlers
    this.setupGlobalErrorHandlers();
  }

  private setupGlobalErrorHandlers() {
    // Handle unhandled JavaScript errors
    window.addEventListener('error', (event) => {
      this.captureError(event.error || new Error(event.message), {
        severity: 'high',
        context: {
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno,
        },
      });
    });

    // Handle unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.captureError(
        event.reason instanceof Error ? event.reason : new Error(String(event.reason)),
        {
          severity: 'medium',
          context: {
            type: 'unhandled_promise_rejection',
          },
        }
      );
    });

    // Handle React error boundary errors (if using error boundaries)
    window.addEventListener('react-error', (event: any) => {
      this.captureError(event.detail.error, {
        severity: 'high',
        context: {
          componentStack: event.detail.errorInfo?.componentStack,
          type: 'react_error_boundary',
        },
      });
    });
  }

  captureError(error: Error, options: {
    severity?: ErrorReport['severity'];
    context?: Record<string, any>;
    userId?: string;
  } = {}) {
    const errorReport: ErrorReport = {
      id: this.generateErrorId(),
      timestamp: new Date().toISOString(),
      error: {
        message: error.message,
        stack: error.stack,
        name: error.name,
      },
      context: {
        url: window.location.href,
        userAgent: navigator.userAgent,
        userId: options.userId,
        ...options.context,
      },
      severity: options.severity || this.determineSeverity(error),
      resolved: false,
    };

    // Add to queue (for offline support)
    this.errorQueue.push(errorReport);

    // Try to send immediately if online
    if (this.isOnline) {
      this.sendErrorReport(errorReport);
    }

    // Log locally for debugging
    console.error('🚨 Production Error Captured:', errorReport);

    return errorReport.id;
  }

  private generateErrorId(): string {
    return `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private determineSeverity(error: Error): ErrorReport['severity'] {
    const message = error.message.toLowerCase();
    
    // Critical errors that break core functionality
    if (
      message.includes('chunk') ||
      message.includes('network') ||
      message.includes('auth') ||
      message.includes('payment')
    ) {
      return 'critical';
    }

    // High severity for user-facing errors
    if (
      message.includes('failed to fetch') ||
      message.includes('permission') ||
      message.includes('unauthorized')
    ) {
      return 'high';
    }

    // Medium severity for feature-specific errors
    if (
      message.includes('validation') ||
      message.includes('input') ||
      message.includes('format')
    ) {
      return 'medium';
    }

    // Default to low severity
    return 'low';
  }

  private async sendErrorReport(errorReport: ErrorReport) {
    try {
      // In a real app, this would send to your error tracking service
      // For example: Sentry, LogRocket, Bugsnag, etc.
      
      // You could also send to your own endpoint
      const response = await fetch('/api/errors', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(errorReport),
      });

      if (response.ok) {
        // Remove from queue if sent successfully
        this.errorQueue = this.errorQueue.filter(e => e.id !== errorReport.id);
      }
    } catch (sendError) {
      console.error('Failed to send error report:', sendError);
      // Keep in queue for retry
    }
  }

  private flushErrorQueue() {
    // Send all queued errors when coming back online
    this.errorQueue.forEach(errorReport => {
      this.sendErrorReport(errorReport);
    });
  }

  // Public method to manually report errors
  reportError(error: Error | string, context?: Record<string, any>): string {
    const errorObj = typeof error === 'string' ? new Error(error) : error;
    return this.captureError(errorObj, { context });
  }

  // Get error statistics (useful for admin dashboard)
  getErrorStats(): {
    total: number;
    bySeverity: Record<ErrorReport['severity'], number>;
    recent: ErrorReport[];
  } {
    const last24Hours = Date.now() - 24 * 60 * 60 * 1000;
    const recentErrors = this.errorQueue.filter(
      e => new Date(e.timestamp).getTime() > last24Hours
    );

    const bySeverity = recentErrors.reduce((acc, error) => {
      acc[error.severity] = (acc[error.severity] || 0) + 1;
      return acc;
    }, {} as Record<ErrorReport['severity'], number>);

    return {
      total: recentErrors.length,
      bySeverity,
      recent: recentErrors.slice(-10), // Last 10 errors
    };
  }
}

export const productionErrorHandler = ProductionErrorHandler.getInstance();
export type { ErrorReport };
