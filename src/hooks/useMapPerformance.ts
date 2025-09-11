import { useCallback, useRef, useEffect } from 'react';
import { usePerformanceStore } from '@/stores/performanceStore';
import { PerformanceMonitor } from '@/utils/performance-core';

export interface MapPerformanceConfig {
  enableViewportLoading: boolean;
  enableClustering: boolean;
  maxVisibleMarkers: number;
  throttleInterval: number;
  enablePreloading: boolean;
}

export const useMapPerformance = (config: Partial<MapPerformanceConfig> = {}) => {
  const { 
    setCachedResult, 
    getCachedResult, 
    enableVirtualization,
    enableImageOptimization,
    setMetric 
  } = usePerformanceStore();

  const defaultConfig: MapPerformanceConfig = {
    enableViewportLoading: true,
    enableClustering: true,
    maxVisibleMarkers: enableVirtualization ? 1000 : 5000,
    throttleInterval: 300,
    enablePreloading: true,
    ...config
  };

  const throttleTimeouts = useRef<Map<string, NodeJS.Timeout>>(new Map());
  const renderQueue = useRef<Array<() => void>>([]);
  const isProcessingQueue = useRef(false);

  // Throttled execution for performance-critical operations
  const throttle = useCallback((key: string, fn: () => void, delay: number = defaultConfig.throttleInterval) => {
    const existingTimeout = throttleTimeouts.current.get(key);
    if (existingTimeout) {
      clearTimeout(existingTimeout);
    }

    const timeout = setTimeout(() => {
      fn();
      throttleTimeouts.current.delete(key);
    }, delay);

    throttleTimeouts.current.set(key, timeout);
  }, [defaultConfig.throttleInterval]);

  // Batch DOM operations for better performance
  const batchDOMOperations = useCallback((operations: Array<() => void>) => {
    renderQueue.current.push(...operations);
    
    if (!isProcessingQueue.current) {
      isProcessingQueue.current = true;
      requestAnimationFrame(() => {
        const batch = renderQueue.current.splice(0);
        batch.forEach(operation => operation());
        isProcessingQueue.current = false;
      });
    }
  }, []);

  // Optimized marker creation with object pooling
  const markerPool = useRef<HTMLElement[]>([]);
  
  const getPooledMarker = useCallback(() => {
    if (markerPool.current.length > 0) {
      return markerPool.current.pop()!;
    }
    
    // Create new marker if pool is empty
    const marker = document.createElement('div');
    marker.className = 'custom-marker';
    return marker;
  }, []);

  const returnMarkerToPool = useCallback((marker: HTMLElement) => {
    // Clean up marker before returning to pool
    marker.style.cssText = '';
    marker.innerHTML = '';
    marker.removeAttribute('data-fact-id');
    
    if (markerPool.current.length < 100) { // Limit pool size
      markerPool.current.push(marker);
    }
  }, []);

  // Viewport-based loading optimization
  const isInViewport = useCallback((bounds: any, latitude: number, longitude: number, buffer = 0.1) => {
    return longitude >= bounds.getWest() - buffer && 
           longitude <= bounds.getEast() + buffer &&
           latitude >= bounds.getSouth() - buffer && 
           latitude <= bounds.getNorth() + buffer;
  }, []);

  // Distance-based culling for better performance
  const calculateDistance = useCallback((lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }, []);

  // Performance monitoring for map operations
  const measureMapOperation = useCallback((operationName: string, operation: () => void | Promise<void>) => {
    return async () => {
      PerformanceMonitor.start(operationName);
      
      try {
        await operation();
      } catch (error) {
        console.error(`Error in map operation ${operationName}:`, error);
      } finally {
        const duration = PerformanceMonitor.end(operationName);
        setMetric(operationName, duration);
      }
    };
  }, [setMetric]);

  // Efficient GeoJSON processing
  const processGeoJSON = useCallback((facts: any[]) => {
    const cacheKey = `geojson-${facts.length}-${JSON.stringify(facts.slice(0, 5).map(f => f.id))}`;
    const cached = getCachedResult(cacheKey);
    
    if (cached) {
      return cached;
    }

    const processedData = {
      type: 'FeatureCollection' as const,
      features: facts.map(fact => ({
        type: 'Feature' as const,
        properties: {
          id: fact.id,
          title: fact.title,
          category: fact.category,
          verified: fact.verified,
          voteScore: fact.voteScore
        },
        geometry: {
          type: 'Point' as const,
          coordinates: [fact.longitude, fact.latitude]
        }
      }))
    };

    setCachedResult(cacheKey, processedData);
    return processedData;
  }, [getCachedResult, setCachedResult]);

  // Cleanup function
  const cleanup = useCallback(() => {
    throttleTimeouts.current.forEach(timeout => clearTimeout(timeout));
    throttleTimeouts.current.clear();
    renderQueue.current = [];
    markerPool.current = [];
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  return {
    config: defaultConfig,
    throttle,
    batchDOMOperations,
    getPooledMarker,
    returnMarkerToPool,
    isInViewport,
    calculateDistance,
    measureMapOperation,
    processGeoJSON,
    cleanup
  };
};

export default useMapPerformance;