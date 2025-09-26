/**
 * Scalable fact loading service for millions of facts
 * Uses geographic queries, spatial indexing, and smart caching
 */

import { supabase } from '@/integrations/supabase/client';

interface Bounds {
  north: number;
  south: number;
  east: number;
  west: number;
}

interface ScalableFactQuery {
  bounds: Bounds;
  zoom: number;
  limit?: number;
  category?: string;
  status?: 'verified' | 'pending' | 'all';
}

interface FactCache {
  [key: string]: {
    data: any[];
    timestamp: number;
    bounds: Bounds;
  };
}

class ScalableFactService {
  private cache: FactCache = {};
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes
  private readonly MAX_CACHE_SIZE = 50;

  /**
   * Generate cache key for geographic bounds
   */
  private getCacheKey(bounds: Bounds, zoom: number, category?: string): string {
    const precision = Math.max(2, Math.min(6, Math.floor(zoom)));
    const roundedBounds = {
      north: Math.round(bounds.north * Math.pow(10, precision)) / Math.pow(10, precision),
      south: Math.round(bounds.south * Math.pow(10, precision)) / Math.pow(10, precision),
      east: Math.round(bounds.east * Math.pow(10, precision)) / Math.pow(10, precision),
      west: Math.round(bounds.west * Math.pow(10, precision)) / Math.pow(10, precision)
    };
    
    return `${roundedBounds.north}_${roundedBounds.south}_${roundedBounds.east}_${roundedBounds.west}_${Math.floor(zoom)}_${category || 'all'}`;
  }

  /**
   * Clean expired cache entries
   */
  private cleanCache(): void {
    const now = Date.now();
    const entries = Object.entries(this.cache);
    
    // Remove expired entries
    entries.forEach(([key, entry]) => {
      if (now - entry.timestamp > this.CACHE_TTL) {
        delete this.cache[key];
      }
    });

    // If still too many entries, remove oldest
    const remainingEntries = Object.entries(this.cache);
    if (remainingEntries.length > this.MAX_CACHE_SIZE) {
      remainingEntries
        .sort((a, b) => a[1].timestamp - b[1].timestamp)
        .slice(0, remainingEntries.length - this.MAX_CACHE_SIZE)
        .forEach(([key]) => delete this.cache[key]);
    }
  }

  /**
   * Calculate optimal limit based on zoom level
   */
  private getOptimalLimit(zoom: number): number {
    if (zoom < 3) return 100;   // World view
    if (zoom < 6) return 500;   // Continental view
    if (zoom < 10) return 1000; // Regional view
    if (zoom < 13) return 2000; // City view
    return 5000; // Street view
  }

  /**
   * Load facts for geographic viewport with intelligent caching
   */
  async loadFactsForViewport(query: ScalableFactQuery): Promise<any[]> {
    const { bounds, zoom, category, status = 'verified' } = query;
    const limit = query.limit || this.getOptimalLimit(zoom);
    
    // Check cache first
    const cacheKey = this.getCacheKey(bounds, zoom, category);
    const cached = this.cache[cacheKey];
    
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      console.log(`📦 Cache hit for viewport (${cached.data.length} facts)`);
      return cached.data;
    }

    console.log(`🌍 Loading facts for viewport (zoom: ${zoom.toFixed(1)}, limit: ${limit})`);
    
    try {
      // Build optimized geographic query
      let query_builder = supabase
        .from('facts')
        .select(`
          id,
          title,
          description,
          latitude,
          longitude,
          vote_count_up,
          vote_count_down,
          category_id,
          image_url,
          categories!facts_category_id_fkey(
            slug,
            icon,
            color
          )
        `)
        .gte('latitude', bounds.south)
        .lte('latitude', bounds.north)
        .gte('longitude', bounds.west)
        .lte('longitude', bounds.east)
        .not('latitude', 'is', null)
        .not('longitude', 'is', null);

      // Add status filter
      if (status !== 'all') {
        query_builder = query_builder.eq('status', status);
      }

      // Add category filter
      if (category) {
        query_builder = query_builder.eq('categories.slug', category);
      }

      // Optimize ordering based on zoom level
      if (zoom < 8) {
        // For zoomed out views, prioritize popular facts
        query_builder = query_builder.order('vote_count_up', { ascending: false });
      } else {
        // For zoomed in views, use spatial ordering (newest first)
        query_builder = query_builder.order('created_at', { ascending: false });
      }

      const { data, error } = await query_builder.limit(limit);

      if (error) {
        console.error('Error loading viewport facts:', error);
        return [];
      }

      const facts = data || [];
      
      // Cache successful results
      this.cleanCache();
      this.cache[cacheKey] = {
        data: facts,
        timestamp: Date.now(),
        bounds
      };

      console.log(`✅ Loaded ${facts.length} facts for viewport`);
      return facts;

    } catch (error) {
      console.error('Failed to load viewport facts:', error);
      return [];
    }
  }

  /**
   * Load clustered fact counts for performance metrics
   */
  async getFactCounts(bounds: Bounds): Promise<{ total: number; byCategory: Record<string, number> }> {
    try {
      // Get total count in bounds
      const { count: total } = await supabase
        .from('facts')
        .select('*', { count: 'exact', head: true })
        .gte('latitude', bounds.south)
        .lte('latitude', bounds.north)
        .gte('longitude', bounds.west)
        .lte('longitude', bounds.east)
        .not('latitude', 'is', null)
        .not('longitude', 'is', null);

      // Get counts by category
      const { data: categoryData } = await supabase
        .from('facts')
        .select('categories!facts_category_id_fkey(slug)')
        .gte('latitude', bounds.south)
        .lte('latitude', bounds.north)
        .gte('longitude', bounds.west)
        .lte('longitude', bounds.east)
        .not('latitude', 'is', null)
        .not('longitude', 'is', null);

      const byCategory: Record<string, number> = {};
      categoryData?.forEach(fact => {
        const slug = fact.categories?.slug;
        if (slug) {
          byCategory[slug] = (byCategory[slug] || 0) + 1;
        }
      });

      return { total: total || 0, byCategory };
    } catch (error) {
      console.error('Error getting fact counts:', error);
      return { total: 0, byCategory: {} };
    }
  }

  /**
   * Preload facts for adjacent viewport areas
   */
  async preloadAdjacentViewports(bounds: Bounds, zoom: number): Promise<void> {
    const padding = this.getViewportPadding(zoom);
    
    const adjacentBounds = [
      // North
      { north: bounds.north + padding, south: bounds.north, east: bounds.east, west: bounds.west },
      // South  
      { north: bounds.south, south: bounds.south - padding, east: bounds.east, west: bounds.west },
      // East
      { north: bounds.north, south: bounds.south, east: bounds.east + padding, west: bounds.east },
      // West
      { north: bounds.north, south: bounds.south, east: bounds.west, west: bounds.west - padding }
    ];

    // Preload in background without blocking
    adjacentBounds.forEach(adjBounds => {
      setTimeout(() => {
        this.loadFactsForViewport({ bounds: adjBounds, zoom, limit: 100 });
      }, 1000);
    });
  }

  private getViewportPadding(zoom: number): number {
    // Smaller padding for higher zoom levels
    return Math.max(0.01, 1 / Math.pow(2, zoom - 2));
  }

  /**
   * Clear cache (useful for development)
   */
  clearCache(): void {
    this.cache = {};
    console.log('🧹 Fact cache cleared');
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): { entries: number; totalFacts: number; oldestEntry: number } {
    const entries = Object.values(this.cache);
    const totalFacts = entries.reduce((sum, entry) => sum + entry.data.length, 0);
    const oldestEntry = entries.length > 0 
      ? Math.min(...entries.map(e => e.timestamp))
      : Date.now();

    return {
      entries: entries.length,
      totalFacts,
      oldestEntry: Date.now() - oldestEntry
    };
  }
}

// Export singleton instance
export const scalableFactService = new ScalableFactService();

// Export types
export type { Bounds, ScalableFactQuery };