// Comprehensive performance optimization utilities
import React, { lazy, ComponentType, Suspense, memo, useMemo, useCallback } from 'react';

// Enhanced lazy loading with preloading and error boundaries
export const createLazyComponent = <T extends ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  options: {
    fallback?: React.ComponentType;
    preload?: boolean;
    errorFallback?: React.ComponentType<{ error: Error; retry: () => void }>;
  } = {}
) => {
  const LazyComponent = lazy(importFn);
  
  // Preload component during idle time
  if (options.preload && typeof requestIdleCallback !== 'undefined') {
    requestIdleCallback(() => {
      importFn().catch(console.error);
    });
  }

  return memo((props: React.ComponentProps<T>) => {
    const ErrorBoundary = options.errorFallback;
    const fallback = options.fallback ? React.createElement(options.fallback) : 
      React.createElement('div', { className: 'animate-pulse' }, 'Loading...');

    const lazyElement = React.createElement(LazyComponent, props);
    const suspenseElement = React.createElement(Suspense, { fallback }, lazyElement);

    if (ErrorBoundary) {
      return React.createElement(ErrorBoundary, { 
        error: null as any, 
        retry: () => window.location.reload() 
      }, suspenseElement);
    }

    return suspenseElement;
  });
};

// Bundle splitting strategy
export const createChunkedImport = (chunkName: string) => ({
  // Critical components (loaded immediately)
  critical: <T extends ComponentType<any>>(importFn: () => Promise<{ default: T }>) =>
    createLazyComponent(importFn, { preload: true }),
    
  // Important components (loaded on demand with fast fallback)
  important: <T extends ComponentType<any>>(importFn: () => Promise<{ default: T }>) =>
    createLazyComponent(importFn, { 
      fallback: () => React.createElement('div', { className: 'h-8 animate-pulse bg-muted rounded' })
    }),
    
  // Optional components (loaded when needed)
  optional: <T extends ComponentType<any>>(importFn: () => Promise<{ default: T }>) =>
    createLazyComponent(importFn, {
      fallback: () => React.createElement('div', { className: 'p-4 text-center text-muted-foreground' }, 'Loading component...')
    })
});

// Image optimization with progressive loading
export const optimizeImage = {
  getResponsiveUrl: (baseUrl: string, width: number, quality = 85) => {
    if (baseUrl.includes('supabase.co')) {
      return `${baseUrl}?width=${width}&quality=${quality}&format=webp`;
    }
    return baseUrl;
  },
  
  preloadImage: (src: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve();
      img.onerror = reject;
      img.src = src;
      
      // Add to preload queue
      if (document.head) {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.as = 'image';
        link.href = src;
        document.head.appendChild(link);
      }
    });
  }
};

// Route-based code splitting
export const routeComponents = {
  // Home page components (critical)
  WelcomeHero: createLazyComponent(() => import('@/components/organisms/WelcomeHeroOptimized').then(m => ({ default: m.WelcomeHeroOptimized })), { preload: true }),
  
  // Map components (important, heavy)
  MapComponent: createLazyComponent(() => import('@/components/map/UnifiedMapComponent').then(m => ({ default: m.UnifiedMapComponent })), {
    fallback: () => React.createElement('div', { 
      className: 'w-full h-96 bg-muted rounded-lg flex items-center justify-center' 
    }, 'Loading map...'),
  }),
  
  // Admin components (optional, restricted)
  AdminPanel: createLazyComponent(() => import('@/pages/Admin').then(m => ({ default: m.default })), {
    fallback: () => React.createElement('div', { 
      className: 'container mx-auto p-8 text-center' 
    }, 'Loading admin panel...'),
  }),
  
  // Stories components (important)
  StoriesPage: createLazyComponent(() => import('@/pages/Stories').then(m => ({ default: m.default })), {
    fallback: () => React.createElement('div', { 
      className: 'container mx-auto p-4' 
    }, 'Loading stories...'),
  })
};

// Memory optimization
export const memoryOptimizer = {
  // Cleanup function for removing event listeners and intervals
  createCleanup: () => {
    const cleanupFunctions: (() => void)[] = [];
    
    return {
      add: (cleanup: () => void) => cleanupFunctions.push(cleanup),
      run: () => {
        cleanupFunctions.forEach(fn => {
          try {
            fn();
          } catch (error) {
            console.error('Cleanup error:', error);
          }
        });
        cleanupFunctions.length = 0;
      }
    };
  },
  
  // Debounced function creator
  debounce: <T extends (...args: any[]) => any>(
    func: T,
    wait: number
  ): T => {
    let timeout: NodeJS.Timeout;
    
    return ((...args: Parameters<T>) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(null, args), wait);
    }) as T;
  },
  
  // Throttled function creator
  throttle: <T extends (...args: any[]) => any>(
    func: T,
    limit: number
  ): T => {
    let inThrottle: boolean;
    
    return ((...args: Parameters<T>) => {
      if (!inThrottle) {
        func.apply(null, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    }) as T;
  }
};

// Performance monitoring
export const performanceMonitor = {
  // Mark performance milestones
  mark: (name: string) => {
    if (typeof performance !== 'undefined' && performance.mark) {
      performance.mark(name);
    }
  },
  
  // Measure between marks
  measure: (name: string, startMark: string, endMark?: string) => {
    if (typeof performance !== 'undefined' && performance.measure) {
      try {
        performance.measure(name, startMark, endMark);
        const measure = performance.getEntriesByName(name, 'measure')[0];
        return measure?.duration || 0;
      } catch (error) {
        console.warn('Performance measurement failed:', error);
        return 0;
      }
    }
    return 0;
  },
  
  // Observer for performance entries
  observe: (callback: (entries: PerformanceEntry[]) => void) => {
    if (typeof PerformanceObserver !== 'undefined') {
      const observer = new PerformanceObserver((list) => {
        callback(list.getEntries());
      });
      
      observer.observe({ entryTypes: ['measure', 'navigation', 'paint'] });
      return () => observer.disconnect();
    }
    return () => {};
  }
};

// Bundle size optimization
export const bundleOptimizer = {
  // Import only what's needed from large libraries
  selectiveImport: {
    // Custom implementations to avoid large library imports
    debounce: <T extends (...args: any[]) => any>(func: T, wait: number) => {
      let timeout: NodeJS.Timeout;
      return ((...args: Parameters<T>) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(null, args), wait);
      }) as T;
    },
    
    // Date-fns selective import
    dateFns: {
      format: () => import('date-fns/format'),
      parseISO: () => import('date-fns/parseISO'),
      formatDistanceToNow: () => import('date-fns/formatDistanceToNow'),
    }
  },
  
  // Tree shaking helpers
  treeShake: {
    // Mark side-effect free modules
    sideEffectFree: [
      'lodash-es',
      'date-fns',
      'clsx',
      'class-variance-authority'
    ]
  }
};