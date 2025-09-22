// Scalable geographic service for handling millions of facts
import { supabase } from '@/integrations/supabase/client';
import { FactMarker } from '@/types/map';

interface ViewportBounds {
  north: number;
  south: number;
  east: number;
  west: number;
}

interface GeoCluster {
  id: string;
  center: [number, number];
  count: number;
  verified_count: number;
  total_votes: number;
  bounds: ViewportBounds;
  zoom_level: number;
}

interface GeoServiceConfig {
  maxFactsPerRequest: number;
  clusterRadius: number;
  maxZoomForClustering: number;
  viewportPadding: number;
}

class GeoService {
  private static instance: GeoService;
  private config: GeoServiceConfig = {
    maxFactsPerRequest: 1000,
    clusterRadius: 50, // km
    maxZoomForClustering: 14, // Increased to match database function logic
    viewportPadding: 0.1 // 10% padding around viewport
  };

  private cache = new Map<string, { data: any; timestamp: number }>();
  private readonly CACHE_TTL = 15000; // Shorter cache for dynamic clustering

  static getInstance(): GeoService {
    if (!GeoService.instance) {
      GeoService.instance = new GeoService();
    }
    return GeoService.instance;
  }

  private getCacheKey(bounds: ViewportBounds, zoom: number): string {
    const precision = 3;
    // Include zoom in key for more granular caching
    return `${bounds.north.toFixed(precision)},${bounds.south.toFixed(precision)},${bounds.east.toFixed(precision)},${bounds.west.toFixed(precision)},z${Math.floor(zoom)}`;
  }

  private isInCache(key: string): boolean {
    const cached = this.cache.get(key);
    if (!cached) return false;
    
    const age = Date.now() - cached.timestamp;
    if (age > this.CACHE_TTL) {
      this.cache.delete(key);
      return false;
    }
    return true;
  }

  private expandBounds(bounds: ViewportBounds, factor: number = 0.1): ViewportBounds {
    const latDiff = bounds.north - bounds.south;
    const lngDiff = bounds.east - bounds.west;
    
    return {
      north: bounds.north + (latDiff * factor),
      south: bounds.south - (latDiff * factor),
      east: bounds.east + (lngDiff * factor),
      west: bounds.west - (lngDiff * factor)
    };
  }

  async getFactsInViewport(
    bounds: ViewportBounds, 
    zoom: number, 
    options: { includeCount?: boolean } = {}
  ): Promise<{ facts: FactMarker[]; clusters: GeoCluster[]; totalCount?: number }> {
    console.log('🗺️ GeoService: Fetching data for bounds:', {
      north: bounds.north.toFixed(4),
      south: bounds.south.toFixed(4),
      east: bounds.east.toFixed(4),
      west: bounds.west.toFixed(4),
      zoom,
      maxZoomForClustering: this.config.maxZoomForClustering
    });

    const expandedBounds = this.expandBounds(bounds, this.config.viewportPadding);
    const cacheKey = this.getCacheKey(expandedBounds, zoom);

    // Check cache first
    if (this.isInCache(cacheKey)) {
      console.log(`📋 Cache hit for zoom ${zoom}`);
      const cached = this.cache.get(cacheKey)!;
      return cached.data;
    }

    console.log(`🔄 Cache miss - fetching fresh data for zoom ${zoom}`);

    try {
      // Use clustering for lower zoom levels (global/regional view)
      // Use individual facts for higher zoom levels (city/street view)
      if (zoom < this.config.maxZoomForClustering) {
        console.log(`🎯 Using clustering for zoom ${zoom} (< ${this.config.maxZoomForClustering})`);
        const clusters = await this.getClusteredFacts(expandedBounds, zoom);
        console.log(`📊 Retrieved ${clusters.length} clusters`);
        const result = { facts: [], clusters, totalCount: options.includeCount ? clusters.reduce((sum, c) => sum + c.count, 0) : undefined };
        this.cache.set(cacheKey, { data: result, timestamp: Date.now() });
        return result;
      } else {
        console.log(`📍 Using individual facts for zoom ${zoom} (>= ${this.config.maxZoomForClustering})`);
        const facts = await this.getIndividualFacts(expandedBounds);
        console.log(`📊 Retrieved ${facts.length} individual facts`);
        const result = { facts, clusters: [], totalCount: options.includeCount ? facts.length : undefined };
        this.cache.set(cacheKey, { data: result, timestamp: Date.now() });
        return result;
      }
    } catch (error) {
      console.error('❌ Error fetching viewport data:', error);
      console.error('Bounds:', bounds, 'Zoom:', zoom);
      
      // Fallback: return empty result
      console.log('🔄 Returning empty result as fallback');
      return { facts: [], clusters: [] };
    }
  }

  private async getIndividualFacts(bounds: ViewportBounds): Promise<FactMarker[]> {
    console.log('📍 Fetching individual facts from DB, bounds:', bounds);
    
    const { data: facts, error } = await supabase
      .from('facts')
      .select(`
        id,
        title,
        description,
        latitude,
        longitude,
        status,
        vote_count_up,
        vote_count_down,
        categories!facts_category_id_fkey(
          slug,
          icon,
          color
        ),
        profiles!facts_author_id_fkey(
          username,
          avatar_url
        )
      `)
      .gte('latitude', bounds.south)
      .lte('latitude', bounds.north)
      .lte('longitude', bounds.east)
      .gte('longitude', bounds.west)
      .not('latitude', 'is', null)
      .not('longitude', 'is', null)
      .in('status', ['verified', 'pending'])
      .limit(this.config.maxFactsPerRequest);

    if (error) {
      console.error('❌ Error fetching individual facts:', error);
      throw error;
    }

    console.log(`📊 Retrieved ${facts?.length || 0} individual facts from database`);

    if (!facts || facts.length === 0) {
      console.log('⚠️ No individual facts found in viewport');
      return [];
    }

    const mappedFacts = facts.map(fact => ({
      id: fact.id,
      title: fact.title,
      latitude: fact.latitude,
      longitude: fact.longitude,
      category: fact.categories?.slug || 'default',
      verified: fact.status === 'verified',
      voteScore: (fact.vote_count_up || 0) - (fact.vote_count_down || 0),
      authorName: fact.profiles?.username || 'Anonymous'
    }));

    console.log(`✅ Mapped ${mappedFacts.length} facts for rendering:`, mappedFacts.slice(0, 3));
    return mappedFacts;
  }

  private async getClusteredFacts(bounds: ViewportBounds, zoom: number): Promise<GeoCluster[]> {
    console.log(`🔍 Calling get_fact_clusters with:`, {
      p_north: bounds.north.toFixed(4),
      p_south: bounds.south.toFixed(4),
      p_east: bounds.east.toFixed(4),
      p_west: bounds.west.toFixed(4),
      p_zoom: zoom,
      original_bounds: {
        north: bounds.north.toFixed(4),
        south: bounds.south.toFixed(4),
        east: bounds.east.toFixed(4),
        west: bounds.west.toFixed(4)
      }
    });
    
    try {
      const { data: clusters, error } = await supabase.rpc('get_fact_clusters', {
        p_north: bounds.north,
        p_south: bounds.south,
        p_east: bounds.east,
        p_west: bounds.west,
        p_zoom: zoom
      });

      if (error) {
        console.error('❌ Error in get_fact_clusters RPC:', error);
        throw error;
      }

      console.log(`📊 RPC returned ${clusters?.length || 0} clusters`);

      if (!clusters || clusters.length === 0) {
        console.log('⚠️ No clusters returned from RPC');
        return [];
      }

      const mappedClusters: GeoCluster[] = clusters.map(cluster => {
        // Parse bounds if it's a string, otherwise use fallback
        let parsedBounds: ViewportBounds;
        try {
          parsedBounds = typeof cluster.cluster_bounds === 'string' 
            ? JSON.parse(cluster.cluster_bounds)
            : (cluster.cluster_bounds as any) as ViewportBounds;
          
          // Validate bounds structure
          if (!parsedBounds || typeof parsedBounds !== 'object' || 
              typeof parsedBounds.north !== 'number' ||
              typeof parsedBounds.south !== 'number' ||
              typeof parsedBounds.east !== 'number' ||
              typeof parsedBounds.west !== 'number') {
            throw new Error('Invalid bounds structure');
          }
        } catch {
          // Fallback bounds if parsing fails
          parsedBounds = {
            north: cluster.cluster_latitude + 0.01,
            south: cluster.cluster_latitude - 0.01,
            east: cluster.cluster_longitude + 0.01,
            west: cluster.cluster_longitude - 0.01
          };
        }

        return {
          id: cluster.cluster_id,
          center: [cluster.cluster_longitude, cluster.cluster_latitude],
          count: cluster.cluster_count,
          verified_count: cluster.cluster_count, // Simplified for now
          total_votes: 0, // Simplified for now
          bounds: parsedBounds,
          zoom_level: zoom
        };
      });

      console.log(`✅ Mapped ${mappedClusters.length} clusters:`, mappedClusters.slice(0, 3));
      return mappedClusters;
    } catch (error) {
      console.error('❌ Error fetching clustered facts:', error);
      return this.fallbackClustering(bounds, zoom);
    }
  }

  private async fallbackClustering(bounds: ViewportBounds, zoom: number): Promise<GeoCluster[]> {
    console.log('🔄 Using fallback clustering method');
    
    try {
      const facts = await this.getIndividualFacts(bounds);
      
      if (facts.length === 0) {
        return [];
      }

      // Simple grid-based clustering as fallback
      const gridSize = Math.pow(2, Math.max(0, 10 - zoom)) * 0.01;
      const clusters = new Map<string, FactMarker[]>();

      facts.forEach(fact => {
        const gridLat = Math.floor(fact.latitude / gridSize) * gridSize;
        const gridLng = Math.floor(fact.longitude / gridSize) * gridSize;
        const gridKey = `${gridLat.toFixed(4)},${gridLng.toFixed(4)}`;
        
        if (!clusters.has(gridKey)) {
          clusters.set(gridKey, []);
        }
        clusters.get(gridKey)!.push(fact);
      });

      const result: GeoCluster[] = [];
      clusters.forEach((clusterFacts, gridKey) => {
        if (clusterFacts.length > 1) {
          const avgLat = clusterFacts.reduce((sum, f) => sum + f.latitude, 0) / clusterFacts.length;
          const avgLng = clusterFacts.reduce((sum, f) => sum + f.longitude, 0) / clusterFacts.length;
          
          result.push({
            id: gridKey,
            center: [avgLng, avgLat],
            count: clusterFacts.length,
            verified_count: clusterFacts.filter(f => f.verified).length,
            total_votes: clusterFacts.reduce((sum, f) => sum + f.voteScore, 0),
            bounds: {
              north: Math.max(...clusterFacts.map(f => f.latitude)),
              south: Math.min(...clusterFacts.map(f => f.latitude)),
              east: Math.max(...clusterFacts.map(f => f.longitude)),
              west: Math.min(...clusterFacts.map(f => f.longitude))
            },
            zoom_level: zoom
          });
        }
      });

      console.log(`✅ Fallback clustering created ${result.length} clusters`);
      return result;
    } catch (error) {
      console.error('❌ Fallback clustering failed:', error);
      return [];
    }
  }

  async subscribeToViewport(
    bounds: ViewportBounds,
    callback: (data: { facts: FactMarker[]; clusters: GeoCluster[] }) => void
  ): Promise<() => void> {
    console.log('👂 Setting up real-time subscription for viewport');
    
    const channel = supabase
      .channel('fact_changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'facts'
      }, () => {
        console.log('📡 Real-time update detected, refreshing viewport data');
        this.clearCache();
        // Trigger a refresh
        this.getFactsInViewport(bounds, 10).then(callback);
      })
      .subscribe();

    return () => {
      console.log('🔌 Unsubscribing from real-time updates');
      supabase.removeChannel(channel);
    };
  }

  clearCache(): void {
    console.log('🧹 Clearing GeoService cache');
    this.cache.clear();
  }

  updateConfig(newConfig: Partial<GeoServiceConfig>): void {
    this.config = { ...this.config, ...newConfig };
    console.log('⚙️ Updated GeoService config:', this.config);
  }
}

// Export singleton instance
export const geoService = GeoService.getInstance();
export type { ViewportBounds, GeoCluster, GeoServiceConfig };