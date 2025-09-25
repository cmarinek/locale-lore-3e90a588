// Simplified, ultra-fast map service - eliminating all duplicate requests
import { supabase } from '@/integrations/supabase/client';
import { FactMarker } from '@/types/map';

interface ViewportBounds {
  north: number;
  south: number;
  east: number;
  west: number;
}

class FastGeoService {
  private static instance: FastGeoService;
  private cache = new Map<string, { data: FactMarker[]; timestamp: number }>();
  private readonly CACHE_TTL = 30000; // 30 seconds
  private activeRequests = new Map<string, Promise<FactMarker[]>>();

  static getInstance(): FastGeoService {
    if (!FastGeoService.instance) {
      FastGeoService.instance = new FastGeoService();
    }
    return FastGeoService.instance;
  }

  private getCacheKey(bounds: ViewportBounds, zoom: number): string {
    // Reduced precision for better cache hits
    const precision = Math.max(1, Math.floor(zoom / 2));
    return `${bounds.north.toFixed(precision)},${bounds.south.toFixed(precision)},${bounds.east.toFixed(precision)},${bounds.west.toFixed(precision)},${Math.floor(zoom)}`;
  }

  private isValidCache(timestamp: number): boolean {
    return Date.now() - timestamp < this.CACHE_TTL;
  }

  async getFactsForBounds(bounds: ViewportBounds, zoom: number): Promise<FactMarker[]> {
    const cacheKey = this.getCacheKey(bounds, zoom);
    
    // Check cache first
    const cached = this.cache.get(cacheKey);
    if (cached && this.isValidCache(cached.timestamp)) {
      console.log('🎯 Cache hit for bounds:', cacheKey);
      return cached.data;
    }

    // Check if request is already in flight
    if (this.activeRequests.has(cacheKey)) {
      console.log('⏳ Request already in flight for:', cacheKey);
      return this.activeRequests.get(cacheKey)!;
    }

    console.log('🌍 Fetching facts for bounds:', cacheKey);
    
    // Create and cache the request promise
    const requestPromise = this.fetchFactsFromDatabase(bounds, zoom);
    this.activeRequests.set(cacheKey, requestPromise);

    try {
      const facts = await requestPromise;
      
      // Cache the result
      this.cache.set(cacheKey, {
        data: facts,
        timestamp: Date.now()
      });
      
      console.log(`✅ Loaded ${facts.length} facts for bounds:`, cacheKey);
      return facts;
    } catch (error) {
      console.error('❌ Error fetching facts:', error);
      return [];
    } finally {
      // Remove from active requests
      this.activeRequests.delete(cacheKey);
    }
  }

  private async fetchFactsFromDatabase(bounds: ViewportBounds, zoom: number): Promise<FactMarker[]> {
    try {
      // Single optimized query with actual database column names
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
        .limit(500);

      if (error) {
        console.error('Database error:', error);
        return [];
      }

      if (!facts || facts.length === 0) {
        return [];
      }

      // Transform to FactMarker format using actual column names
      return facts.map(fact => ({
        id: fact.id,
        title: fact.title || 'Untitled',
        latitude: fact.latitude,
        longitude: fact.longitude,
        category: fact.category_id || 'general',
        verified: fact.status === 'verified',
        voteScore: (fact.vote_count_up || 0) - (fact.vote_count_down || 0),
        authorName: 'Unknown', // Simplified - avoid joins
        createdAt: fact.created_at
      }));
    } catch (error) {
      console.error('Critical error in fetchFactsFromDatabase:', error);
      return [];
    }
  }

  clearCache(): void {
    this.cache.clear();
    this.activeRequests.clear();
    console.log('🧹 Cache cleared');
  }

  getCacheStats() {
    return {
      size: this.cache.size,
      activeRequests: this.activeRequests.size
    };
  }
}

export const fastGeoService = FastGeoService.getInstance();