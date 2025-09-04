import { onCLS, onINP, onFCP, onLCP, onTTFB } from 'web-vitals';

export interface PerformanceMetric {
  name: string;
  value: number;
  delta: number;
  id: string;
  rating: 'good' | 'needs-improvement' | 'poor';
}

export class PerformanceMonitor {
  private metrics: Map<string, PerformanceMetric> = new Map();
  private callbacks: ((metric: PerformanceMetric) => void)[] = [];

  constructor() {
    this.initWebVitals();
  }

  private initWebVitals() {
    const onMetric = (metric: PerformanceMetric) => {
      this.metrics.set(metric.name, metric);
      this.callbacks.forEach(callback => callback(metric));
      
      // Log to analytics in production
      if (process.env.NODE_ENV === 'production') {
        this.sendMetricToAnalytics(metric);
      }
    };

    onCLS(onMetric);
    onINP(onMetric);
    onFCP(onMetric);
    onLCP(onMetric);
    onTTFB(onMetric);
  }

  private sendMetricToAnalytics(metric: PerformanceMetric) {
    // Send to analytics service
    if (typeof (window as any).gtag !== 'undefined') {
      (window as any).gtag('event', metric.name, {
        custom_parameter_value: Math.round(metric.value),
        custom_parameter_delta: Math.round(metric.delta),
        custom_parameter_id: metric.id,
        custom_parameter_rating: metric.rating,
      });
    }
  }

  onMetric(callback: (metric: PerformanceMetric) => void) {
    this.callbacks.push(callback);
    // Send existing metrics to new callback
    this.metrics.forEach(metric => callback(metric));
  }

  getMetrics() {
    return Array.from(this.metrics.values());
  }

  getMetric(name: string) {
    return this.metrics.get(name);
  }

  // Monitor custom performance marks
  markStart(name: string) {
    performance.mark(`${name}-start`);
  }

  markEnd(name: string) {
    performance.mark(`${name}-end`);
    performance.measure(name, `${name}-start`, `${name}-end`);
    
    const measure = performance.getEntriesByName(name, 'measure')[0];
    if (measure) {
      const customMetric: PerformanceMetric = {
        name: `custom-${name}`,
        value: measure.duration,
        delta: measure.duration,
        id: `custom-${Date.now()}`,
        rating: measure.duration < 100 ? 'good' : measure.duration < 300 ? 'needs-improvement' : 'poor'
      };
      
      this.metrics.set(customMetric.name, customMetric);
      this.callbacks.forEach(callback => callback(customMetric));
    }
  }

  // Resource monitoring
  getResourceMetrics() {
    const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
    return resources.map(resource => ({
      name: resource.name,
      duration: resource.duration,
      size: resource.transferSize || 0,
      type: this.getResourceType(resource.name),
      cached: resource.transferSize === 0 && resource.decodedBodySize > 0
    }));
  }

  private getResourceType(url: string): string {
    if (url.includes('.js')) return 'script';
    if (url.includes('.css')) return 'stylesheet';
    if (url.match(/\.(png|jpg|jpeg|gif|svg|webp)$/)) return 'image';
    if (url.includes('font')) return 'font';
    return 'other';
  }

  // Bundle size monitoring
  getBundleMetrics() {
    const scripts = document.querySelectorAll('script[src]');
    const stylesheets = document.querySelectorAll('link[rel="stylesheet"]');
    
    return {
      scripts: scripts.length,
      stylesheets: stylesheets.length,
      totalElements: scripts.length + stylesheets.length
    };
  }
}

// Global instance
export const performanceMonitor = new PerformanceMonitor();

// React hook for performance monitoring
export const usePerformanceMonitor = () => {
  return {
    monitor: performanceMonitor,
    markStart: performanceMonitor.markStart.bind(performanceMonitor),
    markEnd: performanceMonitor.markEnd.bind(performanceMonitor),
    getMetrics: performanceMonitor.getMetrics.bind(performanceMonitor)
  };
};