
import { create } from 'zustand';
import { memoize } from '@/utils/performance';

interface PerformanceState {
  // Caching
  cachedResults: Map<string, any>;
  setCachedResult: (key: string, value: any) => void;
  getCachedResult: (key: string) => any;
  
  // Image optimization
  imageQuality: 'low' | 'medium' | 'high';
  setImageQuality: (quality: 'low' | 'medium' | 'high') => void;
  
  // Bundle optimization
  preloadedChunks: Set<string>;
  markChunkPreloaded: (chunkName: string) => void;
  
  // Performance metrics
  metrics: {
    bundleSize?: number;
    loadTime?: number;
    renderTime?: number;
  };
  setMetric: (key: string, value: number) => void;
  
  // Settings
  enableVirtualization: boolean;
  enableImageOptimization: boolean;
  enablePreloading: boolean;
  toggleVirtualization: () => void;
  toggleImageOptimization: () => void;
  togglePreloading: () => void;
}

export const usePerformanceStore = create<PerformanceState>((set, get) => ({
  cachedResults: new Map(),
  
  setCachedResult: (key: string, value: any) => {
    const cache = get().cachedResults;
    cache.set(key, value);
    
    // Limit cache size
    if (cache.size > 100) {
      const firstKey = cache.keys().next().value;
      cache.delete(firstKey);
    }
    
    set({ cachedResults: new Map(cache) });
  },
  
  getCachedResult: (key: string) => {
    return get().cachedResults.get(key);
  },
  
  imageQuality: 'medium',
  setImageQuality: (imageQuality) => set({ imageQuality }),
  
  preloadedChunks: new Set(),
  markChunkPreloaded: (chunkName: string) => {
    const chunks = get().preloadedChunks;
    chunks.add(chunkName);
    set({ preloadedChunks: new Set(chunks) });
  },
  
  metrics: {},
  setMetric: (key: string, value: number) => {
    set((state) => ({
      metrics: { ...state.metrics, [key]: value }
    }));
  },
  
  enableVirtualization: true,
  enableImageOptimization: true,
  enablePreloading: true,
  
  toggleVirtualization: () => {
    set((state) => ({ enableVirtualization: !state.enableVirtualization }));
  },
  
  toggleImageOptimization: () => {
    set((state) => ({ enableImageOptimization: !state.enableImageOptimization }));
  },
  
  togglePreloading: () => {
    set((state) => ({ enablePreloading: !state.enablePreloading }));
  },
}));

// Memoized selectors for expensive calculations
export const selectOptimizedFacts = memoize((facts: any[], filters: any) => {
  return facts.filter(fact => {
    // Apply filters efficiently
    if (filters.category && fact.category !== filters.category) return false;
    if (filters.verified && !fact.verified) return false;
    if (filters.location && !fact.location_name?.toLowerCase().includes(filters.location.toLowerCase())) return false;
    return true;
  });
});

export const selectSortedFacts = memoize((facts: any[], sortBy: string) => {
  return [...facts].sort((a, b) => {
    switch (sortBy) {
      case 'date':
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      case 'votes':
        return (b.vote_count_up - b.vote_count_down) - (a.vote_count_up - a.vote_count_down);
      case 'relevance':
      default:
        return b.recommendation_score - a.recommendation_score;
    }
  });
});
