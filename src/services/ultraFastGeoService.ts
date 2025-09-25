// Ultra-fast 2025 geo service - world-class performance
import { supabase } from '@/integrations/supabase/client';
import { FactMarker } from '@/types/map';

interface ViewportBounds {
  north: number;
  south: number;
  east: number;
  west: number;
}

interface CacheEntry {
  data: FactMarker[];
  timestamp: number;
  bounds: ViewportBounds;
}

class UltraFastGeoService {
  private static instance: UltraFastGeoService;
  private cache = new Map<string, CacheEntry>();
  private readonly CACHE_TTL = 60000; // 1 minute
  private readonly MAX_CACHE_SIZE = 100;
  private activeRequests = new Map<string, Promise<FactMarker[]>>();
  private preloadQueue = new Set<string>();
  
  // Performance metrics
  private metrics = {
    cacheHits: 0,
    cacheMisses: 0,
    avgResponseTime: 0,
    totalRequests: 0
  };

  static getInstance(): UltraFastGeoService {
    if (!UltraFastGeoService.instance) {
      UltraFastGeoService.instance = new UltraFastGeoService();
    }
    return UltraFastGeoService.instance;
  }

  private getCacheKey(bounds: ViewportBounds, zoom: number): string {
    // Ultra-precise cache key for maximum hit rate
    const precision = Math.max(2, Math.floor(zoom / 3));
    return `${bounds.north.toFixed(precision)}_${bounds.south.toFixed(precision)}_${bounds.east.toFixed(precision)}_${bounds.west.toFixed(precision)}_${Math.floor(zoom/2)}`;
  }

  private isValidCache(entry: CacheEntry): boolean {
    return Date.now() - entry.timestamp < this.CACHE_TTL;
  }

  private expandBounds(bounds: ViewportBounds, factor: number = 1.5): ViewportBounds {
    const latDiff = (bounds.north - bounds.south) * (factor - 1) / 2;
    const lngDiff = (bounds.east - bounds.west) * (factor - 1) / 2;
    
    return {
      north: bounds.north + latDiff,
      south: bounds.south - latDiff,
      east: bounds.east + lngDiff,
      west: bounds.west - lngDiff
    };
  }

  async getFactsForBounds(bounds: ViewportBounds, zoom: number): Promise<FactMarker[]> {
    const startTime = performance.now();
    const cacheKey = this.getCacheKey(bounds, zoom);
    
    // Check cache first - lightning fast
    const cached = this.cache.get(cacheKey);
    if (cached && this.isValidCache(cached)) {
      this.metrics.cacheHits++;
      console.log(`⚡ Ultra-fast cache hit: ${performance.now() - startTime}ms`);
      
      // Trigger preload for adjacent areas
      this.preloadAdjacentAreas(bounds, zoom);
      
      return this.filterByViewport(cached.data, bounds);
    }

    this.metrics.cacheMisses++;

    // Check if request is already in flight - prevent duplicates
    if (this.activeRequests.has(cacheKey)) {
      return this.activeRequests.get(cacheKey)!;
    }

    // Create new optimized request
    const requestPromise = this.fetchOptimizedFacts(bounds, zoom);
    this.activeRequests.set(cacheKey, requestPromise);

    try {
      const facts = await requestPromise;
      
      // Cache with expanded bounds for better hit rate
      const expandedBounds = this.expandBounds(bounds);
      this.cache.set(cacheKey, {
        data: facts,
        timestamp: Date.now(),
        bounds: expandedBounds
      });
      
      // Manage cache size
      this.manageCacheSize();
      
      // Update metrics
      const responseTime = performance.now() - startTime;
      this.updateMetrics(responseTime);
      
      console.log(`🚀 Ultra-fast fetch: ${responseTime}ms for ${facts.length} facts`);
      
      // Preload adjacent areas
      this.preloadAdjacentAreas(bounds, zoom);
      
      return this.filterByViewport(facts, bounds);
    } finally {
      this.activeRequests.delete(cacheKey);
    }
  }

  private async fetchOptimizedFacts(bounds: ViewportBounds, zoom: number): Promise<FactMarker[]> {
    try {
      // Ultra-optimized single query - no JOINs
      const { data: facts, error } = await supabase
        .from('facts')
        .select('id, title, latitude, longitude, status, vote_count_up, vote_count_down, category_id, created_at')
        .gte('latitude', bounds.south)
        .lte('latitude', bounds.north)
        .gte('longitude', bounds.west)
        .lte('longitude', bounds.east)
        .not('latitude', 'is', null)
        .not('longitude', 'is', null)
        .in('status', ['verified', 'pending'])
        .limit(zoom > 12 ? 1000 : 500)
        .order('vote_count_up', { ascending: false });

      if (error) {
        console.error('Database error:', error);
        return [];
      }

      if (!facts || facts.length === 0) {
        return [];
      }

      // Transform to FactMarker format - minimal processing
      return facts.map(fact => ({
        id: fact.id,
        title: fact.title || 'Untitled',
        latitude: Number(fact.latitude),
        longitude: Number(fact.longitude),
        category: fact.category_id || 'general',
        verified: fact.status === 'verified',
        voteScore: (fact.vote_count_up || 0) - (fact.vote_count_down || 0),
        authorName: 'Unknown',
        createdAt: fact.created_at
      }));
    } catch (error) {
      console.error('Critical error in fetchOptimizedFacts:', error);
      return [];
    }
  }

  private filterByViewport(facts: FactMarker[], bounds: ViewportBounds): FactMarker[] {
    return facts.filter(fact => 
      fact.latitude >= bounds.south &&
      fact.latitude <= bounds.north &&
      fact.longitude >= bounds.west &&
      fact.longitude <= bounds.east
    );
  }

  private preloadAdjacentAreas(bounds: ViewportBounds, zoom: number): void {
    if (this.preloadQueue.size > 10) return; // Limit preload queue
    
    const latDiff = bounds.north - bounds.south;
    const lngDiff = bounds.east - bounds.west;
    
    // Preload 4 adjacent areas
    const adjacentAreas = [
      { north: bounds.north + latDiff, south: bounds.north, east: bounds.east, west: bounds.west },
      { north: bounds.south, south: bounds.south - latDiff, east: bounds.east, west: bounds.west },
      { north: bounds.north, south: bounds.south, east: bounds.east + lngDiff, west: bounds.east },
      { north: bounds.north, south: bounds.south, east: bounds.west, west: bounds.west - lngDiff }
    ];
    
    adjacentAreas.forEach(area => {
      const key = this.getCacheKey(area, zoom);
      if (!this.cache.has(key) && !this.preloadQueue.has(key)) {
        this.preloadQueue.add(key);
        setTimeout(() => {
          this.getFactsForBounds(area, zoom).finally(() => {
            this.preloadQueue.delete(key);
          });
        }, 100);
      }
    });
  }

  private manageCacheSize(): void {
    if (this.cache.size > this.MAX_CACHE_SIZE) {
      // Remove oldest entries
      const entries = Array.from(this.cache.entries())
        .sort((a, b) => a[1].timestamp - b[1].timestamp);
      
      const toRemove = entries.slice(0, this.cache.size - this.MAX_CACHE_SIZE + 10);
      toRemove.forEach(([key]) => this.cache.delete(key));
    }
  }

  private updateMetrics(responseTime: number): void {
    this.metrics.totalRequests++;
    this.metrics.avgResponseTime = 
      (this.metrics.avgResponseTime * (this.metrics.totalRequests - 1) + responseTime) / 
      this.metrics.totalRequests;
  }

  getMetrics() {
    const hitRate = this.metrics.totalRequests > 0 
      ? (this.metrics.cacheHits / this.metrics.totalRequests * 100).toFixed(1)
      : '0';
    
    return {
      cacheHitRate: `${hitRate}%`,
      avgResponseTime: `${this.metrics.avgResponseTime.toFixed(1)}ms`,
      cacheSize: this.cache.size,
      activeRequests: this.activeRequests.size
    };
  }

  clearCache(): void {
    this.cache.clear();
    this.activeRequests.clear();
    this.preloadQueue.clear();
    console.log('🧹 Ultra-fast cache cleared');
  }
}

export const ultraFastGeoService = UltraFastGeoService.getInstance();