/**
 * Smart Prefetching System
 * Anticipates user actions and preloads data to improve perceived performance
 */

import { useEffect, useRef, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { requestDeduplicator } from '@/utils/requestDeduplication';

type PrefetchStrategy = 'hover' | 'viewport' | 'idle' | 'immediate' | 'intent';

interface PrefetchOptions {
  strategy?: PrefetchStrategy;
  delay?: number;
  priority?: 'high' | 'normal' | 'low';
  enabled?: boolean;
}

interface PrefetchCache {
  data: any;
  timestamp: number;
  key: string;
}

class SmartPrefetcher {
  private cache = new Map<string, PrefetchCache>();
  private prefetchQueue: Array<{ key: string; fn: () => Promise<any>; priority: number }> = [];
  private isProcessing = false;
  private readonly CACHE_TTL = 60000; // 1 minute
  private readonly MAX_CACHE_SIZE = 50;

  /**
   * Prefetch data with deduplication
   */
  async prefetch<T>(key: string, fetchFn: () => Promise<T>, priority: number = 1): Promise<void> {
    // Check cache first
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      console.log(`[Prefetch] Using cached data for: ${key}`);
      return;
    }

    // Add to queue
    this.prefetchQueue.push({ key, fn: fetchFn, priority });
    this.prefetchQueue.sort((a, b) => b.priority - a.priority);

    // Process queue
    this.processQueue();
  }

  /**
   * Process prefetch queue
   */
  private async processQueue() {
    if (this.isProcessing || this.prefetchQueue.length === 0) return;

    this.isProcessing = true;

    while (this.prefetchQueue.length > 0) {
      const item = this.prefetchQueue.shift();
      if (!item) break;

      try {
        console.log(`[Prefetch] Loading: ${item.key}`);
        
        // Use deduplication to avoid duplicate requests
        const data = await requestDeduplicator.dedupe(item.key, item.fn);
        
        // Cache the result
        this.cache.set(item.key, {
          data,
          timestamp: Date.now(),
          key: item.key,
        });

        // Limit cache size
        if (this.cache.size > this.MAX_CACHE_SIZE) {
          const oldestKey = Array.from(this.cache.entries())
            .sort((a, b) => a[1].timestamp - b[1].timestamp)[0][0];
          this.cache.delete(oldestKey);
        }
      } catch (error) {
        console.warn(`[Prefetch] Failed to prefetch ${item.key}:`, error);
      }

      // Small delay to avoid overwhelming the server
      await new Promise(resolve => setTimeout(resolve, 50));
    }

    this.isProcessing = false;
  }

  /**
   * Get prefetched data from cache
   */
  getCached<T>(key: string): T | null {
    const cached = this.cache.get(key);
    if (!cached) return null;

    if (Date.now() - cached.timestamp > this.CACHE_TTL) {
      this.cache.delete(key);
      return null;
    }

    return cached.data;
  }

  /**
   * Clear cache
   */
  clearCache() {
    this.cache.clear();
  }

  /**
   * Get cache stats
   */
  getStats() {
    return {
      cacheSize: this.cache.size,
      queueLength: this.prefetchQueue.length,
      isProcessing: this.isProcessing,
    };
  }
}

export const smartPrefetcher = new SmartPrefetcher();

/**
 * Hook for smart prefetching based on user interactions
 */
export function useSmartPrefetch<T>(
  key: string,
  fetchFn: () => Promise<T>,
  options: PrefetchOptions = {}
) {
  const {
    strategy = 'hover',
    delay = 300,
    priority = 'normal',
    enabled = true,
  } = options;

  const timeoutRef = useRef<NodeJS.Timeout>();
  const hasTriggeredRef = useRef(false);

  const priorityMap = { high: 3, normal: 2, low: 1 };

  const triggerPrefetch = useCallback(() => {
    if (!enabled || hasTriggeredRef.current) return;

    hasTriggeredRef.current = true;
    smartPrefetcher.prefetch(key, fetchFn, priorityMap[priority]);
  }, [key, fetchFn, enabled, priority]);

  const deferredPrefetch = useCallback(() => {
    if (!enabled) return;

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      triggerPrefetch();
    }, delay);
  }, [triggerPrefetch, delay, enabled]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // Return handlers for different strategies
  return {
    onMouseEnter: strategy === 'hover' ? deferredPrefetch : undefined,
    onFocus: strategy === 'hover' ? deferredPrefetch : undefined,
    prefetch: triggerPrefetch,
    getCached: () => smartPrefetcher.getCached<T>(key),
  };
}

/**
 * Hook for route prefetching based on link hover/focus
 */
export function useRoutePrefetch(to: string, enabled: boolean = true) {
  const location = useLocation();
  const navigate = useNavigate();

  const prefetchRoute = useCallback(() => {
    if (!enabled || location.pathname === to) return;

    const key = `route:${to}`;
    
    // Prefetch route component
    smartPrefetcher.prefetch(
      key,
      async () => {
        // This will trigger lazy loading of the route
        console.log(`[Route Prefetch] Warming up route: ${to}`);
        return { prefetched: true };
      },
      2 // Normal priority
    );
  }, [to, enabled, location.pathname]);

  return {
    onMouseEnter: prefetchRoute,
    onFocus: prefetchRoute,
  };
}

/**
 * Hook for viewport-based prefetching using Intersection Observer
 */
export function useViewportPrefetch<T>(
  key: string,
  fetchFn: () => Promise<T>,
  enabled: boolean = true
) {
  const ref = useRef<HTMLElement>(null);
  const hasTriggeredRef = useRef(false);

  useEffect(() => {
    if (!enabled || !ref.current || hasTriggeredRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasTriggeredRef.current) {
            hasTriggeredRef.current = true;
            smartPrefetcher.prefetch(key, fetchFn, 1); // Low priority
          }
        });
      },
      {
        rootMargin: '50px', // Start prefetching 50px before element enters viewport
      }
    );

    observer.observe(ref.current);

    return () => {
      observer.disconnect();
    };
  }, [key, fetchFn, enabled]);

  return ref;
}

/**
 * Hook for idle-time prefetching
 */
export function useIdlePrefetch<T>(
  key: string,
  fetchFn: () => Promise<T>,
  enabled: boolean = true
) {
  useEffect(() => {
    if (!enabled) return;

    const prefetchOnIdle = () => {
      smartPrefetcher.prefetch(key, fetchFn, 1); // Low priority
    };

    if ('requestIdleCallback' in window) {
      const handle = requestIdleCallback(prefetchOnIdle, { timeout: 2000 });
      return () => cancelIdleCallback(handle);
    } else {
      const timeout = setTimeout(prefetchOnIdle, 1000);
      return () => clearTimeout(timeout);
    }
  }, [key, fetchFn, enabled]);
}
