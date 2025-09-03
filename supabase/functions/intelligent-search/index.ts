import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface SearchFilters {
  categories?: string[]
  status?: string
  location?: { lat: number; lng: number; radius: number }
  verified?: boolean
  dateRange?: { start: string; end: string }
}

interface SearchRequest {
  query: string
  filters?: SearchFilters
  page?: number
  limit?: number
  sortBy?: 'relevance' | 'date' | 'votes' | 'location'
  userId?: string
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    const { query, filters = {}, page = 1, limit = 20, sortBy = 'relevance', userId }: SearchRequest = await req.json()

    if (!query || query.trim().length === 0) {
      return new Response(JSON.stringify({ 
        results: [], 
        total: 0, 
        suggestions: [] 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    const offset = (page - 1) * limit
    const searchTerm = query.trim().toLowerCase()

    // Build the search query with advanced filtering
    let searchQuery = supabaseClient
      .from('facts')
      .select(`
        *,
        profiles!facts_author_id_fkey(username, avatar_url),
        categories!facts_category_id_fkey(id, slug, icon, color)
      `)

    // Full-text search with fuzzy matching
    const tsQuery = searchTerm.split(' ').map(term => `${term}:*`).join(' & ')
    
    searchQuery = searchQuery.or(`
      to_tsvector('english', title || ' ' || description || ' ' || location_name).@@.to_tsquery('english', '${tsQuery}'),
      title.ilike.%${searchTerm}%,
      description.ilike.%${searchTerm}%,
      location_name.ilike.%${searchTerm}%,
      similarity(title, '${searchTerm}').gt.0.1,
      similarity(description, '${searchTerm}').gt.0.1,
      similarity(location_name, '${searchTerm}').gt.0.1
    `)

    // Apply filters
    if (filters.categories && filters.categories.length > 0) {
      searchQuery = searchQuery.in('category_id', filters.categories)
    }

    if (filters.status) {
      searchQuery = searchQuery.eq('status', filters.status)
    } else {
      searchQuery = searchQuery.in('status', ['verified', 'pending'])
    }

    if (filters.verified) {
      searchQuery = searchQuery.eq('status', 'verified')
    }

    if (filters.dateRange) {
      searchQuery = searchQuery
        .gte('created_at', filters.dateRange.start)
        .lte('created_at', filters.dateRange.end)
    }

    // Location-based filtering
    if (filters.location) {
      const { lat, lng, radius } = filters.location
      searchQuery = searchQuery
        .lte(`ST_DWithin(ST_Point(longitude, latitude), ST_Point(${  lng  }, ${  lat  }), ${  radius  })`, true)
    }

    // Apply sorting
    switch (sortBy) {
      case 'date':
        searchQuery = searchQuery.order('created_at', { ascending: false })
        break
      case 'votes':
        searchQuery = searchQuery.order('vote_count_up', { ascending: false })
        break
      case 'location':
        if (filters.location) {
          const { lat, lng } = filters.location
          searchQuery = searchQuery.order(
            `ST_Distance(ST_Point(longitude, latitude), ST_Point(${lng}, ${lat}))`, 
            { ascending: true }
          )
        } else {
          searchQuery = searchQuery.order('created_at', { ascending: false })
        }
        break
      default: // relevance
        searchQuery = searchQuery.order([
          { column: 'vote_count_up', ascending: false },
          { column: 'created_at', ascending: false }
        ])
    }

    // Get total count
    const { count } = await supabaseClient
      .from('facts')
      .select('*', { count: 'exact', head: true })
      .or(`
        to_tsvector('english', title || ' ' || description || ' ' || location_name).@@.to_tsquery('english', '${tsQuery}'),
        title.ilike.%${searchTerm}%,
        description.ilike.%${searchTerm}%,
        location_name.ilike.%${searchTerm}%,
        similarity(title, '${searchTerm}').gt.0.1,
        similarity(description, '${searchTerm}').gt.0.1,
        similarity(location_name, '${searchTerm}').gt.0.1
      `)

    // Execute the paginated search
    const { data: results, error } = await searchQuery
      .range(offset, offset + limit - 1)

    if (error) throw error

    // Get autocomplete suggestions
    const { data: suggestions } = await supabaseClient
      .from('facts')
      .select('title, location_name')
      .or(`title.ilike.%${searchTerm}%, location_name.ilike.%${searchTerm}%`)
      .limit(5)

    const autocompleteSuggestions = suggestions ? [
      ...new Set([
        ...suggestions.map(s => s.title).filter(t => t.toLowerCase().includes(searchTerm)),
        ...suggestions.map(s => s.location_name).filter(l => l.toLowerCase().includes(searchTerm))
      ])
    ].slice(0, 5) : []

    // Record search history if user is authenticated
    if (userId) {
      await supabaseClient
        .from('search_history')
        .insert({
          user_id: userId,
          query,
          filters,
          results_count: count || 0
        })
    }

    return new Response(JSON.stringify({
      results: results || [],
      total: count || 0,
      suggestions: autocompleteSuggestions,
      page,
      limit,
      hasMore: (count || 0) > offset + limit
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('Search error:', error)
    return new Response(JSON.stringify({ 
      error: 'Search failed', 
      details: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})