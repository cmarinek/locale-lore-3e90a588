import { productionConfig } from '@/config/production';

interface PerformanceMetrics {
  loadTime: number;
  firstContentfulPaint: number;
  largestContentfulPaint: number;
  firstInputDelay: number;
  cumulativeLayoutShift: number;
  timeToInteractive: number;
}

interface ErrorReport {
  message: string;
  stack?: string;
  url: string;
  lineNumber: number;
  columnNumber: number;
  timestamp: Date;
  userAgent: string;
  userId?: string;
}

class ProductionMonitor {
  private performanceBuffer: PerformanceMetrics[] = [];
  private errorBuffer: ErrorReport[] = [];
  private sessionId: string;

  constructor() {
    this.sessionId = this.generateSessionId();
    this.initializeMonitoring();
  }

  private generateSessionId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private initializeMonitoring(): void {
    if (!productionConfig.ENABLE_PERFORMANCE_MONITORING) return;

    // Performance monitoring
    this.monitorWebVitals();
    this.monitorLoadTime();
    
    // Error monitoring
    this.setupErrorHandling();
    
    // User session monitoring
    this.trackUserSession();
    
    // Network monitoring
    this.monitorNetworkRequests();
  }

  private monitorWebVitals(): void {
    // Monitor Core Web Vitals
    new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        if (entry.entryType === 'navigation') {
          const navEntry = entry as PerformanceNavigationTiming;
          this.collectPerformanceMetrics({
            loadTime: navEntry.loadEventEnd - navEntry.loadEventStart,
            firstContentfulPaint: 0, // Will be updated by paint observer
            largestContentfulPaint: 0, // Will be updated by LCP observer
            firstInputDelay: 0, // Will be updated by FID observer
            cumulativeLayoutShift: 0, // Will be updated by CLS observer
            timeToInteractive: navEntry.domInteractive - navEntry.fetchStart
          });
        }
      });
    }).observe({ entryTypes: ['navigation'] });

    // First Contentful Paint
    new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        if (entry.name === 'first-contentful-paint') {
          this.updatePerformanceMetric('firstContentfulPaint', entry.startTime);
        }
      });
    }).observe({ entryTypes: ['paint'] });

    // Largest Contentful Paint
    new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        this.updatePerformanceMetric('largestContentfulPaint', entry.startTime);
      });
    }).observe({ entryTypes: ['largest-contentful-paint'] });

    // First Input Delay
    new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        const fidEntry = entry as PerformanceEventTiming;
        this.updatePerformanceMetric('firstInputDelay', fidEntry.processingStart - fidEntry.startTime);
      });
    }).observe({ entryTypes: ['first-input'] });

    // Cumulative Layout Shift
    new PerformanceObserver((list) => {
      let clsValue = 0;
      list.getEntries().forEach((entry) => {
        const layoutShiftEntry = entry as any;
        if (!layoutShiftEntry.hadRecentInput) {
          clsValue += layoutShiftEntry.value;
        }
      });
      this.updatePerformanceMetric('cumulativeLayoutShift', clsValue);
    }).observe({ entryTypes: ['layout-shift'] });
  }

  private monitorLoadTime(): void {
    window.addEventListener('load', () => {
      setTimeout(() => {
        const navigationTiming = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        const loadTime = navigationTiming.loadEventEnd - navigationTiming.loadEventStart;
        
        this.reportPerformance({
          metric: 'pageLoad',
          value: loadTime,
          url: window.location.href,
          sessionId: this.sessionId
        });
      }, 0);
    });
  }

  private setupErrorHandling(): void {
    // Global error handler
    window.addEventListener('error', (event) => {
      this.reportError({
        message: event.message,
        stack: event.error?.stack,
        url: event.filename,
        lineNumber: event.lineno,
        columnNumber: event.colno,
        timestamp: new Date(),
        userAgent: navigator.userAgent
      });
    });

    // Promise rejection handler
    window.addEventListener('unhandledrejection', (event) => {
      this.reportError({
        message: `Unhandled Promise Rejection: ${event.reason}`,
        url: window.location.href,
        lineNumber: 0,
        columnNumber: 0,
        timestamp: new Date(),
        userAgent: navigator.userAgent
      });
    });

    // React Error Boundary integration
    if ((window as any).__REACT_ERROR_BOUNDARY__) {
      (window as any).__REACT_ERROR_BOUNDARY__.onError = (error: Error, errorInfo: any) => {
        this.reportError({
          message: error.message,
          stack: error.stack,
          url: window.location.href,
          lineNumber: 0,
          columnNumber: 0,
          timestamp: new Date(),
          userAgent: navigator.userAgent
        });
      };
    }
  }

  private trackUserSession(): void {
    // Track session start
    this.reportEvent('session_start', {
      sessionId: this.sessionId,
      timestamp: new Date(),
      userAgent: navigator.userAgent,
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight
      },
      connection: (navigator as any).connection ? {
        effectiveType: (navigator as any).connection.effectiveType,
        downlink: (navigator as any).connection.downlink
      } : null
    });

    // Track page visibility changes
    document.addEventListener('visibilitychange', () => {
      this.reportEvent('visibility_change', {
        visible: !document.hidden,
        timestamp: new Date()
      });
    });

    // Track session end on beforeunload
    window.addEventListener('beforeunload', () => {
      this.flushBuffers();
    });
  }

  private monitorNetworkRequests(): void {
    // Intercept fetch requests
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      const startTime = performance.now();
      const url = args[0] as string;
      
      try {
        const response = await originalFetch(...args);
        const endTime = performance.now();
        
        this.reportNetworkRequest({
          url,
          method: (args[1]?.method || 'GET') as string,
          status: response.status,
          duration: endTime - startTime,
          timestamp: new Date()
        });
        
        return response;
      } catch (error) {
        const endTime = performance.now();
        
        this.reportNetworkRequest({
          url,
          method: (args[1]?.method || 'GET') as string,
          status: 0,
          duration: endTime - startTime,
          timestamp: new Date(),
          error: error instanceof Error ? error.message : 'Unknown error'
        });
        
        throw error;
      }
    };
  }

  private collectPerformanceMetrics(metrics: PerformanceMetrics): void {
    this.performanceBuffer.push(metrics);
    
    // Report if buffer is full or periodically
    if (this.performanceBuffer.length >= 10) {
      this.flushPerformanceBuffer();
    }
  }

  private updatePerformanceMetric(metric: keyof PerformanceMetrics, value: number): void {
    if (this.performanceBuffer.length > 0) {
      const latest = this.performanceBuffer[this.performanceBuffer.length - 1];
      latest[metric] = value;
    }
  }

  private reportError(error: ErrorReport): void {
    this.errorBuffer.push(error);
    
    // Immediately report critical errors
    if (this.errorBuffer.length >= 5) {
      this.flushErrorBuffer();
    }
    
    // Also log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Production Monitor Error:', error);
    }
  }

  private reportPerformance(data: any): void {
    if (productionConfig.ENABLE_PERFORMANCE_MONITORING) {
      // Send to analytics endpoint
      this.sendToAnalytics('performance', data);
    }
  }

  private reportEvent(eventName: string, data: any): void {
    this.sendToAnalytics('event', { eventName, ...data });
  }

  private reportNetworkRequest(data: any): void {
    this.sendToAnalytics('network', data);
  }

  private async sendToAnalytics(type: string, data: any): Promise<void> {
    try {
      // In production, this would send to your analytics service
      // For now, we'll log to console and could integrate with Supabase
      if (process.env.NODE_ENV === 'development') {
        console.log(`Analytics [${type}]:`, data);
      }
      
      // Could integrate with Supabase analytics table
      // await supabase.from('analytics_events').insert({
      //   type,
      //   data,
      //   session_id: this.sessionId,
      //   timestamp: new Date()
      // });
    } catch (error) {
      console.error('Failed to send analytics:', error);
    }
  }

  private flushBuffers(): void {
    this.flushPerformanceBuffer();
    this.flushErrorBuffer();
  }

  private flushPerformanceBuffer(): void {
    if (this.performanceBuffer.length > 0) {
      this.reportPerformance({
        type: 'performance_batch',
        metrics: [...this.performanceBuffer],
        sessionId: this.sessionId
      });
      this.performanceBuffer = [];
    }
  }

  private flushErrorBuffer(): void {
    if (this.errorBuffer.length > 0) {
      this.reportEvent('errors_batch', {
        errors: [...this.errorBuffer],
        sessionId: this.sessionId
      });
      this.errorBuffer = [];
    }
  }

  // Public methods for manual tracking
  public trackCustomEvent(eventName: string, properties?: Record<string, any>): void {
    this.reportEvent(eventName, { ...properties, custom: true });
  }

  public trackCustomMetric(metricName: string, value: number, unit?: string): void {
    this.reportPerformance({
      metric: metricName,
      value,
      unit,
      custom: true,
      timestamp: new Date()
    });
  }

  public getSessionId(): string {
    return this.sessionId;
  }
}

// Export singleton instance
export const productionMonitor = new ProductionMonitor();

// Global error boundary integration
if (typeof window !== 'undefined') {
  (window as any).__PRODUCTION_MONITOR__ = productionMonitor;
}