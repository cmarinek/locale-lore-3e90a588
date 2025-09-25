// Ultra-fast geo service - prioritizes speed over everything
import { supabase } from '@/integrations/supabase/client';
import { FactMarker } from '@/types/map';

class UltraFastGeoService {
  private static instance: UltraFastGeoService;
  private cache: FactMarker[] | null = null;
  private cacheTimestamp = 0;
  private readonly CACHE_TTL = 60000; // 1 minute

  static getInstance(): UltraFastGeoService {
    if (!UltraFastGeoService.instance) {
      UltraFastGeoService.instance = new UltraFastGeoService();
    }
    return UltraFastGeoService.instance;
  }

  async getAllFacts(): Promise<FactMarker[]> {
    // Return cache if valid
    if (this.cache && Date.now() - this.cacheTimestamp < this.CACHE_TTL) {
      return this.cache;
    }

    try {
      const { data, error } = await supabase
        .from('facts')
        .select(`
          id, title, latitude, longitude, 
          vote_count_up, vote_count_down,
          categories!inner(slug)
        `)
        .eq('status', 'verified')
        .limit(300);

      if (error) throw error;

      this.cache = (data || []).map(fact => ({
        id: fact.id,
        title: fact.title,
        latitude: fact.latitude,
        longitude: fact.longitude,
        category: fact.categories?.slug || 'general',
        verified: true,
        voteScore: fact.vote_count_up - fact.vote_count_down,
        authorName: 'Community'
      }));

      this.cacheTimestamp = Date.now();
      return this.cache;
    } catch (error) {
      console.error('Error fetching facts:', error);
      return this.cache || [];
    }
  }

  clearCache(): void {
    this.cache = null;
    this.cacheTimestamp = 0;
  }
}

export const ultraFastGeoService = UltraFastGeoService.getInstance();