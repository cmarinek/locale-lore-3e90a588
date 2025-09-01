
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SearchRequest {
  query: string;
  filters?: {
    categories?: string[];
    location?: { lat: number; lng: number; radius: number };
    verified?: boolean;
    dateRange?: { start: string; end: string };
  };
  sort?: 'relevance' | 'date' | 'votes' | 'trending';
  limit?: number;
  offset?: number;
  userId?: string;
}

interface SearchResult {
  id: string;
  title: string;
  description: string;
  location_name: string;
  latitude: number;
  longitude: number;
  created_at: string;
  vote_count_up: number;
  vote_count_down: number;
  status: string;
  media_urls?: string[];
  profiles: {
    username: string;
    avatar_url?: string;
  };
  categories: {
    slug: string;
    icon: string;
    color: string;
  };
  relevance_score: number;
  distance?: number;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { query, filters, sort = 'relevance', limit = 20, offset = 0, userId } = await req.json() as SearchRequest;

    console.log('Search request:', { query, filters, sort, limit, offset });

    // Build search query with full-text search and ranking
    let searchQuery = supabase
      .from('facts')
      .select(`
        id,
        title,
        description,
        location_name,
        latitude,
        longitude,
        created_at,
        vote_count_up,
        vote_count_down,
        status,
        media_urls,
        profiles!inner (
          username,
          avatar_url
        ),
        categories!inner (
          slug,
          icon,
          color
        )
      `)
      .eq('status', 'approved');

    // Full-text search with ranking
    if (query && query.trim()) {
      // Create search vector combining title and description
      const searchTerms = query
        .trim()
        .split(' ')
        .filter(term => term.length > 2)
        .map(term => `'${term.replace(/'/g, "''")}'`)
        .join(' | ');

      if (searchTerms) {
        // Use PostgreSQL full-text search with ranking
        searchQuery = searchQuery
          .or(`title.ilike.%${query}%,description.ilike.%${query}%,location_name.ilike.%${query}%`)
          .order('vote_count_up', { ascending: false }); // Boost by votes as relevance
      }
    }

    // Apply filters
    if (filters?.categories?.length) {
      searchQuery = searchQuery.in('categories.slug', filters.categories);
    }

    if (filters?.verified) {
      searchQuery = searchQuery.not('verified_by', 'is', null);
    }

    if (filters?.dateRange) {
      searchQuery = searchQuery
        .gte('created_at', filters.dateRange.start)
        .lte('created_at', filters.dateRange.end);
    }

    // Apply sorting
    switch (sort) {
      case 'date':
        searchQuery = searchQuery.order('created_at', { ascending: false });
        break;
      case 'votes':
        searchQuery = searchQuery.order('vote_count_up', { ascending: false });
        break;
      case 'trending':
        // Calculate trending score based on recent votes and views
        searchQuery = searchQuery
          .order('vote_count_up', { ascending: false })
          .order('created_at', { ascending: false });
        break;
      default: // relevance
        if (query && query.trim()) {
          // Order by text relevance and vote score
          searchQuery = searchQuery
            .order('vote_count_up', { ascending: false })
            .order('created_at', { ascending: false });
        } else {
          searchQuery = searchQuery.order('created_at', { ascending: false });
        }
    }

    // Apply pagination
    searchQuery = searchQuery.range(offset, offset + limit - 1);

    const { data: facts, error } = await searchQuery;

    if (error) {
      console.error('Search error:', error);
      throw error;
    }

    // Calculate relevance scores and distances
    const results: SearchResult[] = (facts || []).map(fact => {
      let relevanceScore = 0.5; // Base score

      // Text relevance scoring
      if (query && query.trim()) {
        const queryLower = query.toLowerCase();
        const titleMatch = fact.title.toLowerCase().includes(queryLower);
        const descMatch = fact.description.toLowerCase().includes(queryLower);
        const locationMatch = fact.location_name.toLowerCase().includes(queryLower);

        if (titleMatch) relevanceScore += 0.3;
        if (descMatch) relevanceScore += 0.2;
        if (locationMatch) relevanceScore += 0.1;

        // Exact phrase matches get higher scores
        if (fact.title.toLowerCase().includes(queryLower)) relevanceScore += 0.2;
      }

      // Vote-based scoring
      const voteScore = Math.min(fact.vote_count_up / 100, 0.3); // Cap at 0.3
      relevanceScore += voteScore;

      // Recency boost
      const daysSinceCreated = (Date.now() - new Date(fact.created_at).getTime()) / (1000 * 60 * 60 * 24);
      const recencyScore = Math.max(0, 0.2 - (daysSinceCreated / 365) * 0.2);
      relevanceScore += recencyScore;

      // Calculate distance if location filter is provided
      let distance: number | undefined;
      if (filters?.location) {
        const R = 6371; // Earth's radius in km
        const dLat = (filters.location.lat - fact.latitude) * Math.PI / 180;
        const dLng = (filters.location.lng - fact.longitude) * Math.PI / 180;
        const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                  Math.cos(fact.latitude * Math.PI / 180) * Math.cos(filters.location.lat * Math.PI / 180) *
                  Math.sin(dLng/2) * Math.sin(dLng/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        distance = R * c;

        // Distance boost (closer = higher score)
        if (distance < filters.location.radius / 1000) {
          const distanceScore = Math.max(0, 0.2 - (distance / (filters.location.radius / 1000)) * 0.2);
          relevanceScore += distanceScore;
        }
      }

      return {
        ...fact,
        relevance_score: Math.min(relevanceScore, 1.0),
        distance
      };
    });

    // Apply location radius filter if specified
    const filteredResults = filters?.location 
      ? results.filter(result => 
          result.distance !== undefined && 
          result.distance <= (filters.location!.radius / 1000)
        )
      : results;

    // Final sort by relevance if that was requested
    if (sort === 'relevance') {
      filteredResults.sort((a, b) => b.relevance_score - a.relevance_score);
    }

    // Log search analytics
    if (userId) {
      await supabase.from('search_analytics').insert({
        user_id: userId,
        query: query || '',
        results_count: filteredResults.length,
        search_context: {
          filters,
          sort,
          timestamp: new Date().toISOString()
        }
      });
    }

    // Get total count for pagination
    let countQuery = supabase
      .from('facts')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'approved');

    if (query && query.trim()) {
      countQuery = countQuery.or(`title.ilike.%${query}%,description.ilike.%${query}%,location_name.ilike.%${query}%`);
    }

    if (filters?.categories?.length) {
      countQuery = countQuery.in('category_id', filters.categories);
    }

    const { count: totalCount } = await countQuery;

    console.log(`Search completed: ${filteredResults.length} results of ${totalCount || 0} total`);

    return new Response(
      JSON.stringify({
        results: filteredResults,
        total: totalCount || 0,
        offset,
        limit,
        hasMore: (offset + limit) < (totalCount || 0),
        searchTime: Date.now(),
        query: {
          text: query,
          filters,
          sort
        }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Search optimization error:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Search failed', 
        details: error.message 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
