// Simplified performance monitoring without external dependencies
import { performanceMonitor } from './performance-optimization';

// Core Web Vitals monitoring
export class WebVitalsMonitor {
  private static instance: WebVitalsMonitor;
  private metrics: Map<string, number> = new Map();
  
  static getInstance(): WebVitalsMonitor {
    if (!WebVitalsMonitor.instance) {
      WebVitalsMonitor.instance = new WebVitalsMonitor();
    }
    return WebVitalsMonitor.instance;
  }
  
  // Track Largest Contentful Paint
  trackLCP(): void {
    if (typeof PerformanceObserver === 'undefined') return;
    
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1];
      this.metrics.set('LCP', lastEntry.startTime);
    });
    
    observer.observe({ entryTypes: ['largest-contentful-paint'] });
  }
  
  // Track First Input Delay
  trackFID(): void {
    if (typeof PerformanceObserver === 'undefined') return;
    
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry: any) => {
        if (entry.processingStart && entry.startTime) {
          const fid = entry.processingStart - entry.startTime;
          this.metrics.set('FID', fid);
        }
      });
    });
    
    observer.observe({ entryTypes: ['first-input'] });
  }
  
  // Track Cumulative Layout Shift
  trackCLS(): void {
    if (typeof PerformanceObserver === 'undefined') return;
    
    let clsValue = 0;
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry: any) => {
        if (!entry.hadRecentInput) {
          clsValue += entry.value;
          this.metrics.set('CLS', clsValue);
        }
      });
    });
    
    observer.observe({ entryTypes: ['layout-shift'] });
  }
  
  // Track Time to First Byte
  trackTTFB(): void {
    if (typeof performance === 'undefined' || !performance.getEntriesByType) return;
    
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    if (navigation) {
      const ttfb = navigation.responseStart - navigation.requestStart;
      this.metrics.set('TTFB', ttfb);
    }
  }
  
  // Get all metrics
  getMetrics(): Record<string, number> {
    return Object.fromEntries(this.metrics);
  }
  
  // Initialize all monitoring
  init(): void {
    this.trackLCP();
    this.trackFID();
    this.trackCLS();
    this.trackTTFB();
    
    // Track page load time
    if (typeof performance !== 'undefined') {
      window.addEventListener('load', () => {
        const loadTime = performance.now();
        this.metrics.set('PAGE_LOAD', loadTime);
      });
    }
  }
}

// Bundle size tracking
export const trackBundleSize = () => {
  if (typeof performance === 'undefined') return;
  
  // Track initial bundle size
  const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
  if (navigation) {
    // Track bundle size silently
    // Removed console logging to reduce debug noise
  }
};

// Memory usage tracking
export const trackMemoryUsage = () => {
  if ('memory' in performance) {
    const memory = (performance as any).memory;
    // Track memory usage silently
    // Removed console logging to reduce debug noise
  }
};

// Initialize monitoring
export const initPerformanceMonitoring = () => {
  const monitor = WebVitalsMonitor.getInstance();
  monitor.init();
  
  // Track bundle size
  setTimeout(trackBundleSize, 1000);
  
  // Track memory usage periodically
  setInterval(trackMemoryUsage, 30000);
  
  return monitor;
};