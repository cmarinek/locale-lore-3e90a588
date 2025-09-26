/**
 * Hook for using the scalable fact service
 * Integrates viewport-based loading with existing store patterns
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { scalableFactService, type Bounds, type ScalableFactQuery } from '@/services/scalableFactService';
import { useDiscoveryStore } from '@/stores/discoveryStore';

interface UseScalableFactsOptions {
  autoLoad?: boolean;
  defaultBounds?: Bounds;
  defaultZoom?: number;
}

export const useScalableFacts = (options: UseScalableFactsOptions = {}) => {
  const { autoLoad = true, defaultBounds, defaultZoom = 10 } = options;
  
  const [viewportFacts, setViewportFacts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [metrics, setMetrics] = useState({
    totalFacts: 0,
    loadTime: 0,
    cacheHit: false
  });

  const currentBoundsRef = useRef<Bounds | null>(null);
  const currentZoomRef = useRef<number>(defaultZoom);
  
  // Get global filters from discovery store
  const { filters } = useDiscoveryStore();

  /**
   * Load facts for a specific viewport
   */
  const loadFactsForViewport = useCallback(async (
    bounds: Bounds, 
    zoom: number, 
    options: { category?: string; status?: 'verified' | 'pending' | 'all' } = {}
  ) => {
    setLoading(true);
    setError(null);
    
    const startTime = performance.now();
    
    try {
      const query: ScalableFactQuery = {
        bounds,
        zoom,
        category: options.category || filters.category,
        status: options.status || 'verified'
      };

      console.log('🌍 Loading facts for viewport:', { 
        bounds, 
        zoom: zoom.toFixed(1),
        category: query.category 
      });

      const facts = await scalableFactService.loadFactsForViewport(query);
      
      setViewportFacts(facts);
      currentBoundsRef.current = bounds;
      currentZoomRef.current = zoom;
      
      const loadTime = performance.now() - startTime;
      setMetrics({
        totalFacts: facts.length,
        loadTime: Math.round(loadTime),
        cacheHit: loadTime < 50 // Assume cache hit if very fast
      });

      console.log(`✅ Loaded ${facts.length} facts in ${Math.round(loadTime)}ms`);
      
    } catch (err) {
      console.error('Failed to load viewport facts:', err);
      setError(err instanceof Error ? err.message : 'Failed to load facts');
    } finally {
      setLoading(false);
    }
  }, [filters.category]);

  /**
   * Handle map bounds change
   */
  const handleBoundsChange = useCallback((bounds: mapboxgl.LngLatBounds) => {
    const boundsObj: Bounds = {
      north: bounds.getNorth(),
      south: bounds.getSouth(),
      east: bounds.getEast(),
      west: bounds.getWest()
    };
    
    loadFactsForViewport(boundsObj, currentZoomRef.current);
  }, [loadFactsForViewport]);

  /**
   * Refresh current viewport
   */
  const refreshViewport = useCallback(() => {
    if (currentBoundsRef.current) {
      scalableFactService.clearCache();
      loadFactsForViewport(currentBoundsRef.current, currentZoomRef.current);
    }
  }, [loadFactsForViewport]);

  /**
   * Search facts within current viewport
   */
  const searchInViewport = useCallback(async (searchQuery: string) => {
    if (!currentBoundsRef.current) return;
    
    // For now, filter client-side. Could be enhanced with server-side search
    const filteredFacts = viewportFacts.filter(fact =>
      fact.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      fact.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      fact.location_name?.toLowerCase().includes(searchQuery.toLowerCase())
    );
    
    setViewportFacts(filteredFacts);
  }, [viewportFacts]);

  /**
   * Get cache statistics
   */
  const getCacheStats = useCallback(() => {
    return scalableFactService.getCacheStats();
  }, []);

  // Auto-load default viewport if provided
  useEffect(() => {
    if (autoLoad && defaultBounds) {
      loadFactsForViewport(defaultBounds, defaultZoom);
    }
  }, [autoLoad, defaultBounds, defaultZoom, loadFactsForViewport]);

  // Listen to filter changes and reload
  useEffect(() => {
    if (currentBoundsRef.current && (filters.category || filters.search)) {
      loadFactsForViewport(currentBoundsRef.current, currentZoomRef.current);
    }
  }, [filters.category, filters.search, loadFactsForViewport]);

  return {
    // Data
    viewportFacts,
    loading,
    error,
    metrics,
    
    // Actions
    loadFactsForViewport,
    handleBoundsChange,
    refreshViewport,
    searchInViewport,
    getCacheStats,
    
    // State
    currentBounds: currentBoundsRef.current,
    currentZoom: currentZoomRef.current
  };
};