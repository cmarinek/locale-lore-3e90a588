import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
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

    const { user_id, type = 'personalized' } = await req.json()

    if (!user_id) {
      throw new Error('User ID required')
    }

    let recommendations = []

    if (type === 'personalized') {
      // Generate fresh recommendations
      await supabaseClient.rpc('generate_user_recommendations', { target_user_id: user_id })

      // Get user's personalized recommendations
      const { data: personalizedRecs } = await supabaseClient
        .from('user_recommendations')
        .select(`
          *,
          facts!user_recommendations_fact_id_fkey(
            *,
            profiles!facts_author_id_fkey(username, avatar_url),
            categories!facts_category_id_fkey(slug, icon, color)
          )
        `)
        .eq('user_id', user_id)
        .gt('expires_at', new Date().toISOString())
        .order('score', { ascending: false })
        .limit(10)

      recommendations = personalizedRecs?.map(rec => ({
        ...rec.facts,
        recommendation_score: rec.score,
        recommendation_reason: rec.reason
      })) || []

    } else if (type === 'trending') {
      // Get trending facts
      const { data: trendingFacts } = await supabaseClient
        .from('trending_facts')
        .select(`
          *,
          facts!trending_facts_fact_id_fkey(
            *,
            profiles!facts_author_id_fkey(username, avatar_url),
            categories!facts_category_id_fkey(slug, icon, color)
          )
        `)
        .gte('period_start', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
        .order('score', { ascending: false })
        .limit(10)

      recommendations = trendingFacts?.map(trending => ({
        ...trending.facts,
        trending_score: trending.score,
        recommendation_reason: 'Trending now'
      })) || []

    } else if (type === 'location') {
      // Get user's location-based recommendations
      const { lat, lng, radius = 10000 } = await req.json()

      if (lat && lng) {
        const { data: locationRecs } = await supabaseClient
          .from('facts')
          .select(`
            *,
            profiles!facts_author_id_fkey(username, avatar_url),
            categories!facts_category_id_fkey(slug, icon, color)
          `)
          .eq('status', 'verified')
          .lte('ST_DWithin(ST_Point(longitude, latitude), ST_Point(' + lng + ', ' + lat + '), ' + radius + ')', true)
          .order('vote_count_up', { ascending: false })
          .limit(10)

        recommendations = locationRecs?.map(fact => ({
          ...fact,
          recommendation_reason: 'Near you'
        })) || []
      }

    } else if (type === 'similar') {
      // Get recommendations based on user's interests
      const { data: userFacts } = await supabaseClient
        .from('facts')
        .select('category_id')
        .eq('author_id', user_id)
        .limit(5)

      if (userFacts && userFacts.length > 0) {
        const userCategories = userFacts.map(f => f.category_id)

        const { data: similarRecs } = await supabaseClient
          .from('facts')
          .select(`
            *,
            profiles!facts_author_id_fkey(username, avatar_url),
            categories!facts_category_id_fkey(slug, icon, color)
          `)
          .in('category_id', userCategories)
          .neq('author_id', user_id)
          .eq('status', 'verified')
          .order('vote_count_up', { ascending: false })
          .limit(10)

        recommendations = similarRecs?.map(fact => ({
          ...fact,
          recommendation_reason: 'Similar to your content'
        })) || []
      }
    }

    // If no specific recommendations, fall back to popular content
    if (recommendations.length === 0) {
      const { data: fallbackRecs } = await supabaseClient
        .from('facts')
        .select(`
          *,
          profiles!facts_author_id_fkey(username, avatar_url),
          categories!facts_category_id_fkey(slug, icon, color)
        `)
        .eq('status', 'verified')
        .order('vote_count_up', { ascending: false })
        .limit(10)

      recommendations = fallbackRecs?.map(fact => ({
        ...fact,
        recommendation_reason: 'Popular content'
      })) || []
    }

    return new Response(JSON.stringify({
      recommendations,
      type,
      generated_at: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('Recommendations error:', error)
    return new Response(JSON.stringify({ 
      error: 'Failed to get recommendations', 
      details: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})