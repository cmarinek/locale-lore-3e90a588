// 2025 World-Class Performance Optimizations
import { lazy, ComponentType } from 'react';

// Advanced bundle splitting with priority loading
export const PERFORMANCE_BUDGETS = {
  LCP: 1500, // Aggressive 1.5s target
  FID: 50,   // Ultra-responsive 50ms
  CLS: 0.05, // Minimal layout shift
  TTFB: 200, // Fast server response
  FCP: 1000, // Quick first paint
} as const;

// Ultra-optimized lazy loading with prefetch strategies
export const createSmartLazyComponent = <T extends ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  options: {
    priority: 'critical' | 'high' | 'normal' | 'low';
    preloadTrigger?: 'hover' | 'viewport' | 'idle' | 'immediate';
    chunkName?: string;
  } = { priority: 'normal' }
) => {
  const LazyComponent = lazy(importFn);
  
  // Aggressive preloading based on priority
  if (options.priority === 'critical' || options.preloadTrigger === 'immediate') {
    // Preload immediately for critical components
    requestIdleCallback(() => importFn(), { timeout: 100 });
  } else if (options.preloadTrigger === 'idle') {
    // Use requestIdleCallback for low-priority preloading
    requestIdleCallback(() => importFn(), { timeout: 5000 });
  }
  
  return LazyComponent;
};

// Advanced caching with intelligent invalidation
class AdvancedCache {
  private cache = new Map<string, { data: any; timestamp: number; hits: number }>();
  private maxSize = 1000;
  private maxAge = 300000; // 5 minutes
  
  set(key: string, data: any, ttl?: number) {
    // LRU eviction when cache is full
    if (this.cache.size >= this.maxSize) {
      const oldestKey = Array.from(this.cache.entries())
        .sort(([,a], [,b]) => a.timestamp - b.timestamp)[0][0];
      this.cache.delete(oldestKey);
    }
    
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      hits: 0
    });
  }
  
  get(key: string) {
    const entry = this.cache.get(key);
    if (!entry) return null;
    
    // Check expiration
    if (Date.now() - entry.timestamp > this.maxAge) {
      this.cache.delete(key);
      return null;
    }
    
    entry.hits++;
    return entry.data;
  }
  
  clear() {
    this.cache.clear();
  }
  
  getStats() {
    const entries = Array.from(this.cache.values());
    return {
      size: this.cache.size,
      avgHits: entries.reduce((sum, e) => sum + e.hits, 0) / entries.length || 0,
      hitRate: entries.filter(e => e.hits > 0).length / entries.length || 0
    };
  }
}

export const advancedCache = new AdvancedCache();

// Performance-aware request batching
export class RequestBatcher {
  private batches = new Map<string, {
    requests: Array<{ resolve: Function; reject: Function; data: any }>;
    timer: NodeJS.Timeout;
  }>();
  
  private batchDelay = 16; // One frame
  
  batch<T>(key: string, executor: (batch: any[]) => Promise<T[]>, data: any): Promise<T> {
    return new Promise((resolve, reject) => {
      if (!this.batches.has(key)) {
        this.batches.set(key, {
          requests: [],
          timer: setTimeout(() => this.executeBatch(key, executor), this.batchDelay)
        });
      }
      
      const batch = this.batches.get(key);
      batch.requests.push({ resolve, reject, data });
    });
  }
  
  private async executeBatch<T>(key: string, executor: (batch: any[]) => Promise<T[]>) {
    const batch = this.batches.get(key);
    if (!batch) return;
    
    this.batches.delete(key);
    
    try {
      const batchData = batch.requests.map(r => r.data);
      const results = await executor(batchData);
      
      batch.requests.forEach((request, index) => {
        request.resolve(results[index]);
      });
    } catch (error) {
      batch.requests.forEach(request => {
        request.reject(error);
      });
    }
  }
}

export const requestBatcher = new RequestBatcher();

// Smart resource prioritization
export const ResourcePriority = {
  critical: (callback: () => void) => {
    // Use MessageChannel for faster-than-setTimeout execution
    const channel = new MessageChannel();
    channel.port2.onmessage = () => callback();
    channel.port1.postMessage(null);
  },
  
  high: (callback: () => void) => {
    setTimeout(callback, 0);
  },
  
  normal: (callback: () => void) => {
    requestIdleCallback(callback, { timeout: 100 });
  },
  
  low: (callback: () => void) => {
    requestIdleCallback(callback, { timeout: 5000 });
  }
};

// Advanced performance monitoring
export class PerformanceMonitor2025 {
  private static instance: PerformanceMonitor2025;
  private metrics = new Map<string, number[]>();
  
  static getInstance() {
    if (!this.instance) {
      this.instance = new PerformanceMonitor2025();
    }
    return this.instance;
  }
  
  mark(name: string) {
    performance.mark(name);
  }
  
  measure(name: string, start?: string, end?: string) {
    if (start) {
      performance.measure(name, start, end);
    }
    
    const entries = performance.getEntriesByName(name, 'measure');
    if (entries.length > 0) {
      const duration = entries[entries.length - 1].duration;
      
      if (!this.metrics.has(name)) {
        this.metrics.set(name, []);
      }
      
      const measurements = this.metrics.get(name);
      measurements.push(duration);
      
      // Keep only last 100 measurements
      if (measurements.length > 100) {
        measurements.shift();
      }
      
      return duration;
    }
    
    return 0;
  }
  
  getAverageTime(name: string): number {
    const measurements = this.metrics.get(name);
    if (!measurements || measurements.length === 0) return 0;
    
    return measurements.reduce((sum, time) => sum + time, 0) / measurements.length;
  }
  
  getP95Time(name: string): number {
    const measurements = this.metrics.get(name);
    if (!measurements || measurements.length === 0) return 0;
    
    const sorted = [...measurements].sort((a, b) => a - b);
    const p95Index = Math.floor(sorted.length * 0.95);
    return sorted[p95Index] || 0;
  }
  
  getBudgetStatus() {
    return {
      lcp: this.getAverageTime('LCP') <= PERFORMANCE_BUDGETS.LCP,
      fid: this.getAverageTime('FID') <= PERFORMANCE_BUDGETS.FID,
      cls: this.getAverageTime('CLS') <= PERFORMANCE_BUDGETS.CLS,
      ttfb: this.getAverageTime('TTFB') <= PERFORMANCE_BUDGETS.TTFB,
      fcp: this.getAverageTime('FCP') <= PERFORMANCE_BUDGETS.FCP,
    };
  }
}

export const performanceMonitor2025 = PerformanceMonitor2025.getInstance();
