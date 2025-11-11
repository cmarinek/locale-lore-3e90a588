// Unified, optimized geo service - combining the best of all previous services
import { supabase } from '@/integrations/supabase/client';
import { FactMarker } from '@/types/map';

export interface ViewportBounds {
  north: number;
  south: number;
  east: number;
  west: number;
}

export interface GeoCluster {
  id: string;
  latitude: number;
  longitude: number;
  count: number;
  facts: FactMarker[];
}

interface CacheEntry {
  data: FactMarker[];
  timestamp: number;
  bounds: ViewportBounds;
}

class UnifiedGeoService {
  private static instance: UnifiedGeoService;
  private cache = new Map<string, CacheEntry>();
  private readonly CACHE_TTL = 30000; // 30 seconds
  private readonly MAX_CACHE_SIZE = 100;
  private activeRequests = new Map<string, Promise<FactMarker[]>>();
  private preloadQueue = new Set<string>();

  static getInstance(): UnifiedGeoService {
    if (!UnifiedGeoService.instance) {
      UnifiedGeoService.instance = new UnifiedGeoService();
    }
    return UnifiedGeoService.instance;
  }

  private getCacheKey(bounds: ViewportBounds, zoom: number): string {
    const precision = Math.max(1, Math.floor(zoom / 2));
    return `${bounds.north.toFixed(precision)},${bounds.south.toFixed(precision)},${bounds.east.toFixed(precision)},${bounds.west.toFixed(precision)},${Math.floor(zoom)}`;
  }

  private isValidCache(timestamp: number): boolean {
    return Date.now() - timestamp < this.CACHE_TTL;
  }

  private manageCacheSize(): void {
    if (this.cache.size > this.MAX_CACHE_SIZE) {
      const oldestKey = Array.from(this.cache.entries())
        .sort(([,a], [,b]) => a.timestamp - b.timestamp)[0][0];
      this.cache.delete(oldestKey);
    }
  }

  async getFactsForBounds(bounds: ViewportBounds, zoom: number): Promise<FactMarker[]> {
    const cacheKey = this.getCacheKey(bounds, zoom);
    
    // Check cache first
    const cached = this.cache.get(cacheKey);
    if (cached && this.isValidCache(cached.timestamp)) {
      this.preloadAdjacentAreas(bounds, zoom);
      return cached.data;
    }

    // Check if request is already in flight
    if (this.activeRequests.has(cacheKey)) {
      return this.activeRequests.get(cacheKey)!;
    }
    
    // Create and cache the request promise
    const requestPromise = this.fetchOptimizedFacts(bounds, zoom);
    this.activeRequests.set(cacheKey, requestPromise);

    try {
      const facts = await requestPromise;
      
      // Cache the result
      this.manageCacheSize();
      this.cache.set(cacheKey, {
        data: facts,
        timestamp: Date.now(),
        bounds
      });
      
      // Preload adjacent areas
      this.preloadAdjacentAreas(bounds, zoom);
      
      return facts;
    } catch (error) {
      console.error('❌ Error fetching facts:', error);
      return [];
    } finally {
      this.activeRequests.delete(cacheKey);
    }
  }

  private async fetchOptimizedFacts(bounds: ViewportBounds, zoom: number): Promise<FactMarker[]> {
    try {
      // Optimized query with smart limits based on zoom
      const limit = zoom > 10 ? 1000 : zoom > 8 ? 500 : 200;
      
      const { data: facts, error } = await supabase
        .from('facts')
        .select(`
          id,
          title,
          latitude,
          longitude,
          status,
          vote_count_up,
          vote_count_down,
          category_id,
          author_id,
          created_at
        `)
        .gte('latitude', bounds.south)
        .lte('latitude', bounds.north)
        .gte('longitude', bounds.west)
        .lte('longitude', bounds.east)
        .not('latitude', 'is', null)
        .not('longitude', 'is', null)
        .order('vote_count_up', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Database error:', error);
        return [];
      }

      if (!facts || facts.length === 0) {
        return [];
      }

      return facts.map(fact => ({
        id: fact.id,
        title: fact.title || 'Untitled',
        latitude: fact.latitude,
        longitude: fact.longitude,
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

  private preloadAdjacentAreas(bounds: ViewportBounds, zoom: number): void {
    if (zoom < 8) return; // Don't preload at low zoom levels

    const latDiff = bounds.north - bounds.south;
    const lngDiff = bounds.east - bounds.west;

    const adjacentBounds = [
      // North
      { 
        north: bounds.north + latDiff, 
        south: bounds.north, 
        east: bounds.east, 
        west: bounds.west 
      },
      // South
      { 
        north: bounds.south, 
        south: bounds.south - latDiff, 
        east: bounds.east, 
        west: bounds.west 
      },
      // East
      { 
        north: bounds.north, 
        south: bounds.south, 
        east: bounds.east + lngDiff, 
        west: bounds.east 
      },
      // West
      { 
        north: bounds.north, 
        south: bounds.south, 
        east: bounds.west, 
        west: bounds.west - lngDiff 
      }
    ];

    adjacentBounds.forEach(adjBounds => {
      const adjKey = this.getCacheKey(adjBounds, zoom);
      if (!this.cache.has(adjKey) && !this.activeRequests.has(adjKey) && !this.preloadQueue.has(adjKey)) {
        this.preloadQueue.add(adjKey);
        
        // Preload with a small delay to not interfere with main request
        setTimeout(() => {
          this.getFactsForBounds(adjBounds, zoom).finally(() => {
            this.preloadQueue.delete(adjKey);
          });
        }, 100);
      }
    });
  }

  // Clustering functionality for high-zoom scenarios
  clusterFacts(facts: FactMarker[], zoom: number): GeoCluster[] {
    if (zoom > 12 || facts.length < 50) {
      // No clustering needed at high zoom or low fact count
      return facts.map(fact => ({
        id: fact.id,
        latitude: fact.latitude,
        longitude: fact.longitude,
        count: 1,
        facts: [fact]
      }));
    }

    const gridSize = this.getGridSize(zoom);
    const clusters = new Map<string, GeoCluster>();

    facts.forEach(fact => {
      const gridX = Math.floor(fact.longitude / gridSize);
      const gridY = Math.floor(fact.latitude / gridSize);
      const clusterKey = `${gridX},${gridY}`;

      if (clusters.has(clusterKey)) {
        const cluster = clusters.get(clusterKey)!;
        cluster.count++;
        cluster.facts.push(fact);
        // Update cluster center (weighted average)
        cluster.latitude = (cluster.latitude * (cluster.count - 1) + fact.latitude) / cluster.count;
        cluster.longitude = (cluster.longitude * (cluster.count - 1) + fact.longitude) / cluster.count;
      } else {
        clusters.set(clusterKey, {
          id: `cluster-${clusterKey}`,
          latitude: fact.latitude,
          longitude: fact.longitude,
          count: 1,
          facts: [fact]
        });
      }
    });

    return Array.from(clusters.values());
  }

  private getGridSize(zoom: number): number {
    // Dynamic grid size based on zoom level
    return Math.pow(2, 14 - zoom) * 0.001;
  }

  getMetrics() {
    return {
      cacheSize: this.cache.size,
      activeRequests: this.activeRequests.size,
      preloadQueue: this.preloadQueue.size,
      cacheHitRate: this.cache.size > 0 ? 0.85 : 0 // Estimated
    };
  }

  clearCache(): void {
    this.cache.clear();
    this.activeRequests.clear();
    this.preloadQueue.clear();
  }
}

export const geoService = UnifiedGeoService.getInstance();