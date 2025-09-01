
// Performance utilities for optimization
import { lazy, ComponentType, Suspense } from 'react';

// Code splitting utility with error handling
export const lazyImport = <T extends ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  fallback?: ComponentType
) => {
  const LazyComponent = lazy(importFn);
  
  return (props: any) => (
    <Suspense fallback={fallback ? <fallback /> : <div>Loading...</div>}>
      <LazyComponent {...props} />
    </Suspense>
  );
};

// Memoization utility for expensive calculations
export const memoize = <T extends (...args: any[]) => any>(fn: T): T => {
  const cache = new Map();
  
  return ((...args: Parameters<T>) => {
    const key = JSON.stringify(args);
    
    if (cache.has(key)) {
      return cache.get(key);
    }
    
    const result = fn(...args);
    cache.set(key, result);
    
    // Limit cache size to prevent memory leaks
    if (cache.size > 100) {
      const firstKey = cache.keys().next().value;
      cache.delete(firstKey);
    }
    
    return result;
  }) as T;
};

// Image optimization utilities
export const getOptimizedImageUrl = (
  url: string,
  width?: number,
  quality = 85,
  format: 'webp' | 'avif' | 'jpeg' = 'webp'
): string => {
  if (!url) return '';
  
  // If it's a Supabase storage URL, add optimization parameters
  if (url.includes('supabase.co')) {
    const params = new URLSearchParams();
    if (width) params.set('width', width.toString());
    params.set('quality', quality.toString());
    params.set('format', format);
    
    return `${url}?${params.toString()}`;
  }
  
  return url;
};

// Resource preloading utilities
export const preloadImage = (src: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = reject;
    img.src = src;
  });
};

export const preloadRoute = (routeImport: () => Promise<any>): void => {
  // Preload route component in idle time
  if ('requestIdleCallback' in window) {
    requestIdleCallback(() => routeImport());
  } else {
    setTimeout(() => routeImport(), 100);
  }
};

// Performance monitoring utilities
export const measurePerformance = (name: string, fn: () => void): void => {
  if ('performance' in window && performance.mark) {
    performance.mark(`${name}-start`);
    fn();
    performance.mark(`${name}-end`);
    performance.measure(name, `${name}-start`, `${name}-end`);
  } else {
    fn();
  }
};

// Bundle size analyzer (dev only)
export const analyzeBundleSize = (): void => {
  if (process.env.NODE_ENV === 'development') {
    import('webpack-bundle-analyzer').then(({ BundleAnalyzerPlugin }) => {
      console.log('Bundle analysis available');
    }).catch(() => {
      console.log('Bundle analyzer not available');
    });
  }
};
