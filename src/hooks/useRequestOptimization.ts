import { useState, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface RequestBatch {
  id: string;
  requests: Array<{
    key: string;
    query: () => Promise<any>;
    priority: 'low' | 'medium' | 'high';
  }>;
  status: 'pending' | 'processing' | 'completed' | 'failed';
}

interface ConnectionPoolConfig {
  maxConnections: number;
  timeout: number;
  retryAttempts: number;
  retryDelay: number;
}

export function useRequestOptimization(config: ConnectionPoolConfig = {
  maxConnections: 6,
  timeout: 10000,
  retryAttempts: 3,
  retryDelay: 1000
}) {
  const [activeConnections, setActiveConnections] = useState(0);
  const [requestQueue, setRequestQueue] = useState<RequestBatch[]>([]);
  const [metrics, setMetrics] = useState({
    totalRequests: 0,
    successfulRequests: 0,
    failedRequests: 0,
    averageLatency: 0
  });

  const debouncedRequests = useRef(new Map<string, NodeJS.Timeout>());
  const requestCache = useRef(new Map<string, { data: any; expires: number }>());

  // Debounced request execution
  const debouncedRequest = useCallback(<T>(
    key: string,
    requestFn: () => Promise<T>,
    delay: number = 300
  ): Promise<T> => {
    return new Promise((resolve, reject) => {
      // Clear existing timeout for this key
      const existingTimeout = debouncedRequests.current.get(key);
      if (existingTimeout) {
        clearTimeout(existingTimeout);
      }

      // Set new timeout
      const timeout = setTimeout(async () => {
        try {
          const result = await requestFn();
          resolve(result);
        } catch (error) {
          reject(error);
        } finally {
          debouncedRequests.current.delete(key);
        }
      }, delay);

      debouncedRequests.current.set(key, timeout);
    });
  }, []);

  // Request batching
  const batchRequest = useCallback(<T>(
    key: string,
    query: () => Promise<T>,
    priority: 'low' | 'medium' | 'high' = 'medium'
  ): Promise<T> => {
    return new Promise((resolve, reject) => {
      const batchId = `batch-${Date.now()}`;
      
      setRequestQueue(prev => [...prev, {
        id: batchId,
        requests: [{ key, query, priority }],
        status: 'pending'
      }]);

      // Process batch after a short delay to collect more requests
      setTimeout(async () => {
        try {
          const result = await processBatch(batchId);
          resolve(result);
        } catch (error) {
          reject(error);
        }
      }, 50);
    });
  }, []);

  // Process request batch
  const processBatch = useCallback(async (batchId: string) => {
    const batch = requestQueue.find(b => b.id === batchId);
    if (!batch || activeConnections >= config.maxConnections) {
      return;
    }

    setActiveConnections(prev => prev + 1);
    setRequestQueue(prev => 
      prev.map(b => b.id === batchId ? { ...b, status: 'processing' } : b)
    );

    try {
      // Sort by priority
      const sortedRequests = batch.requests.sort((a, b) => {
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      });

      const results = await Promise.allSettled(
        sortedRequests.map(req => req.query())
      );

      setMetrics(prev => ({
        ...prev,
        totalRequests: prev.totalRequests + results.length,
        successfulRequests: prev.successfulRequests + results.filter(r => r.status === 'fulfilled').length,
        failedRequests: prev.failedRequests + results.filter(r => r.status === 'rejected').length
      }));

      // Return first successful result or throw first error
      const firstResult = results[0];
      if (firstResult.status === 'fulfilled') {
        return firstResult.value;
      } else {
        throw firstResult.reason;
      }
    } catch (error) {
      throw error;
    } finally {
      setActiveConnections(prev => prev - 1);
      setRequestQueue(prev => prev.filter(b => b.id !== batchId));
    }
  }, [requestQueue, activeConnections, config.maxConnections]);

  // Cached request with TTL
  const cachedRequest = useCallback(async <T>(
    key: string,
    requestFn: () => Promise<T>,
    ttl: number = 300000 // 5 minutes default
  ): Promise<T> => {
    const cached = requestCache.current.get(key);
    const now = Date.now();

    if (cached && cached.expires > now) {
      return cached.data;
    }

    const result = await requestFn();
    requestCache.current.set(key, {
      data: result,
      expires: now + ttl
    });

    return result;
  }, []);

  // Retry mechanism with exponential backoff
  const retryRequest = useCallback(async <T>(
    requestFn: () => Promise<T>,
    attempts: number = config.retryAttempts
  ): Promise<T> => {
    for (let i = 0; i < attempts; i++) {
      try {
        return await requestFn();
      } catch (error) {
        if (i === attempts - 1) throw error;
        
        // Exponential backoff
        const delay = config.retryDelay * Math.pow(2, i);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    throw new Error('Max retry attempts exceeded');
  }, [config.retryAttempts, config.retryDelay]);

  // Optimized fact clustering request
  const getOptimizedFactClusters = useCallback(async (
    bounds: { north: number; south: number; east: number; west: number },
    zoom: number
  ) => {
    // Use rounded coordinates for better cache hits
    const cacheKey = `clusters-${bounds.north.toFixed(3)}-${bounds.south.toFixed(3)}-${bounds.east.toFixed(3)}-${bounds.west.toFixed(3)}-${zoom}`;
    
    return cachedRequest(
      cacheKey,
      () => retryRequest(async () => {
        const { data, error } = await supabase.rpc('get_optimized_fact_clusters', {
          p_north: bounds.north,
          p_south: bounds.south,
          p_east: bounds.east,
          p_west: bounds.west,
          p_zoom: zoom,
          p_limit: 500 // Reduced for better performance
        });

        if (error) throw error;
        return data;
      }),
      15000 // Shorter cache TTL for more dynamic data
    );
  }, [cachedRequest, retryRequest]);

  // Connection pool health check
  const healthCheck = useCallback(async () => {
    try {
      const start = performance.now();
      await supabase.from('facts').select('id').limit(1);
      const latency = performance.now() - start;
      
      setMetrics(prev => ({
        ...prev,
        averageLatency: (prev.averageLatency + latency) / 2
      }));

      return { healthy: true, latency };
    } catch (error) {
      return { healthy: false, error };
    }
  }, []);

  // Cleanup expired cache entries
  const cleanupCache = useCallback(() => {
    const now = Date.now();
    for (const [key, value] of requestCache.current.entries()) {
      if (value.expires <= now) {
        requestCache.current.delete(key);
      }
    }
  }, []);

  return {
    metrics,
    activeConnections,
    requestQueue: requestQueue.length,
    debouncedRequest,
    batchRequest,
    cachedRequest,
    retryRequest,
    getOptimizedFactClusters,
    healthCheck,
    cleanupCache
  };
}