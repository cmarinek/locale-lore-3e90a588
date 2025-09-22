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
    maxZoomForClustering: 14, // Match the map component threshold
    viewportPadding: 0.1 // 10% padding around viewport
  };

  private cache = new Map<string, { data: any; timestamp: number }>();
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  static getInstance(): GeoService {
    if (!GeoService.instance) {
      GeoService.instance = new GeoService();
    }
    return GeoService.instance;
  }

  private getCacheKey(bounds: ViewportBounds, zoom: number): string {
    return `${bounds.north}_${bounds.south}_${bounds.east}_${bounds.west}_${zoom}`;
  }

  private isInCache(key: string): boolean {
    const cached = this.cache.get(key);
    return cached ? Date.now() - cached.timestamp < this.CACHE_TTL : false;
  }

  private calculateBounds(center: [number, number], radius: number): ViewportBounds {
    const [lng, lat] = center;
    const radiusInDegrees = radius / 111; // Rough conversion from km to degrees
    
    return {
      north: lat + radiusInDegrees,
      south: lat - radiusInDegrees,
      east: lng + radiusInDegrees,
      west: lng - radiusInDegrees
    };
  }

  private expandBounds(bounds: ViewportBounds, padding: number): ViewportBounds {
    const latPadding = (bounds.north - bounds.south) * padding;
    const lngPadding = (bounds.east - bounds.west) * padding;
    
    return {
      north: Math.min(90, bounds.north + latPadding),
      south: Math.max(-90, bounds.south - latPadding),
      east: Math.min(180, bounds.east + lngPadding),
      west: Math.max(-180, bounds.west - lngPadding)
    };
  }

  async getFactsInViewport(
    bounds: ViewportBounds,
    zoom: number,
    options: { includeCount?: boolean } = {}
  ): Promise<{ facts: FactMarker[]; clusters: GeoCluster[]; totalCount?: number }> {
    const expandedBounds = this.expandBounds(bounds, this.config.viewportPadding);
    const cacheKey = this.getCacheKey(expandedBounds, zoom);

    // Check cache first
    if (this.isInCache(cacheKey)) {
      const cached = this.cache.get(cacheKey)!;
      return cached.data;
    }

    try {
      console.log(`🗺️ getFactsInViewport called with zoom ${zoom} (threshold: ${this.config.maxZoomForClustering})`);
      
      // For high zoom levels, return individual facts
      if (zoom >= this.config.maxZoomForClustering) {
        console.log('🔍 Zoom >= threshold, fetching individual facts');
        const facts = await this.getIndividualFacts(expandedBounds);
        const result = { facts, clusters: [], totalCount: undefined };
        console.log(`✅ Returning ${facts.length} individual facts, 0 clusters`);
        
        // Cache the result
        this.cache.set(cacheKey, { data: result, timestamp: Date.now() });
        return result;
      }

      // For lower zoom levels, return clusters
      console.log('🎯 Zoom < threshold, fetching clusters');
      const clusters = await this.getClusteredFacts(expandedBounds, zoom);
      const result = { facts: [], clusters, totalCount: undefined };
      console.log(`✅ Returning 0 facts, ${clusters.length} clusters`);
      
      // Cache the result
      this.cache.set(cacheKey, { data: result, timestamp: Date.now() });
      return result;
    } catch (error) {
      console.error('Error fetching viewport data:', error);
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
      .gte('longitude', bounds.west)
      .lte('longitude', bounds.east)
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
    console.log(`🎯 Fetching clusters from DB for zoom ${zoom}, bounds:`, bounds);
    
    // Use the corrected PostGIS clustering function
    const { data, error } = await supabase.rpc('get_fact_clusters', {
      p_north: bounds.north,
      p_south: bounds.south,
      p_east: bounds.east,
      p_west: bounds.west,
      p_zoom: Math.round(zoom) // Round zoom to integer for database
    });

    if (error) {
      console.warn('❌ Clustering function error, using fallback:', error);
      return this.fallbackClustering(bounds, zoom);
    }

    console.log(`📊 DB returned ${data?.length || 0} clusters`);

    // Transform the database response to match our interface
    return (data || []).map((cluster: any) => ({
      id: cluster.cluster_id,
      center: [cluster.cluster_longitude, cluster.cluster_latitude] as [number, number],
      count: cluster.cluster_count,
      verified_count: cluster.cluster_count, // For now, assume all are verified since DB filters by verified
      total_votes: 0, // Not available in current DB function
      bounds: cluster.cluster_bounds,
      zoom_level: zoom
    }));
  }

  private async fallbackClustering(bounds: ViewportBounds, zoom: number): Promise<GeoCluster[]> {
    // Simple grid-based clustering as fallback
    const gridSize = Math.max(1, 20 - zoom); // Larger grid for lower zoom
    const clusters: GeoCluster[] = [];
    
    const { data: facts, error } = await supabase
      .from('facts')
      .select('id, latitude, longitude, status, vote_count_up, vote_count_down')
      .gte('latitude', bounds.south)
      .lte('latitude', bounds.north)
      .gte('longitude', bounds.west)
      .lte('longitude', bounds.east)
      .not('latitude', 'is', null)
      .not('longitude', 'is', null)
      .in('status', ['verified', 'pending']);

    if (error || !facts) return [];

    // Group facts by grid cells
    const grid = new Map<string, typeof facts>();
    
    facts.forEach(fact => {
      const gridLat = Math.floor(fact.latitude / gridSize) * gridSize;
      const gridLng = Math.floor(fact.longitude / gridSize) * gridSize;
      const gridKey = `${gridLat}_${gridLng}`;
      
      if (!grid.has(gridKey)) {
        grid.set(gridKey, []);
      }
      grid.get(gridKey)!.push(fact);
    });

    // Create clusters from grid cells
    grid.forEach((cellFacts, gridKey) => {
      if (cellFacts.length > 1) {
        const [gridLat, gridLng] = gridKey.split('_').map(Number);
        const verified_count = cellFacts.filter(f => f.status === 'verified').length;
        const total_votes = cellFacts.reduce((sum, f) => 
          sum + (f.vote_count_up || 0) - (f.vote_count_down || 0), 0);

        clusters.push({
          id: gridKey,
          center: [gridLng + gridSize / 2, gridLat + gridSize / 2],
          count: cellFacts.length,
          verified_count,
          total_votes,
          bounds: {
            north: gridLat + gridSize,
            south: gridLat,
            east: gridLng + gridSize,
            west: gridLng
          },
          zoom_level: zoom
        });
      }
    });

    return clusters;
  }

  // Real-time subscription for viewport changes
  async subscribeToViewport(
    bounds: ViewportBounds,
    callback: (data: any) => void
  ): Promise<() => void> {
    const channel = supabase
      .channel(`viewport_${Date.now()}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'facts',
          filter: `latitude=gte.${bounds.south} and latitude=lte.${bounds.north} and longitude=gte.${bounds.west} and longitude=lte.${bounds.east}`
        },
        callback
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }

  // Clear cache when needed
  clearCache(): void {
    this.cache.clear();
  }

  // Update configuration for performance tuning
  updateConfig(newConfig: Partial<GeoServiceConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }
}

export const geoService = GeoService.getInstance();