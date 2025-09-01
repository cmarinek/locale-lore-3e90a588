import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      throw new Error('OPENAI_API_KEY is not set');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { query, user_id, location, filters = {} } = await req.json();

    console.log('Smart search request:', { query, user_id, location });

    // Generate query embedding
    const embeddingResponse = await fetch('https://api.openai.com/v1/embeddings', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'text-embedding-3-small',
        input: query,
      }),
    });

    const embeddingData = await embeddingResponse.json();
    const queryEmbedding = embeddingData.data[0].embedding;

    // Get user's search history for context
    const { data: searchHistory } = await supabase
      .from('search_analytics')
      .select('query, selected_results')
      .eq('user_id', user_id)
      .order('created_at', { ascending: false })
      .limit(10);

    // Get user preferences
    const { data: userPrefs } = await supabase
      .from('user_preferences')
      .select('*')
      .eq('user_id', user_id)
      .single();

    // Semantic search using embeddings
    const { data: semanticResults } = await supabase
      .rpc('match_facts_semantic', {
        query_embedding: queryEmbedding,
        match_threshold: 0.7,
        match_count: 20
      });

    // Traditional text search
    const { data: textResults } = await supabase
      .from('facts')
      .select(`
        *,
        categories (
          slug,
          category_translations (name)
        ),
        profiles:author_id (username, avatar_url)
      `)
      .textSearch('title,description', query, { type: 'websearch' })
      .eq('status', 'verified')
      .limit(20);

    // Combine and rank results using AI
    const combinedResults = [...(semanticResults || []), ...(textResults || [])];
    const uniqueResults = combinedResults.filter((result, index, self) => 
      index === self.findIndex(r => r.id === result.id)
    );

    // AI re-ranking based on user context
    const rankingPrompt = `
    You are a smart search ranking system. Re-rank these search results based on user context and query intent.

    Query: "${query}"
    User Context:
    - Search History: ${JSON.stringify(searchHistory?.map(h => h.query) || [])}
    - Preferences: ${JSON.stringify(userPrefs?.category_preferences || {})}
    - Location: ${JSON.stringify(location)}

    Search Results:
    ${JSON.stringify(uniqueResults.map((r, idx) => ({
      index: idx,
      id: r.id,
      title: r.title,
      description: r.description?.substring(0, 200),
      category: r.categories?.category_translations?.[0]?.name
    })), null, 2)}

    Reorder results by relevance and return ONLY a JSON array of result IDs in the new order:
    ["id1", "id2", "id3", ...]
    `;

    const rankingResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4.1-mini-2025-04-14',
        messages: [
          { role: 'system', content: 'You are a search ranking system. Return only JSON arrays of result IDs.' },
          { role: 'user', content: rankingPrompt }
        ],
        max_tokens: 1000,
        temperature: 0.3,
      }),
    });

    const rankingData = await rankingResponse.json();
    console.log('AI ranking response:', rankingData);

    let rankedResults = uniqueResults;
    try {
      const rankedIds = JSON.parse(rankingData.choices[0].message.content);
      rankedResults = rankedIds
        .map(id => uniqueResults.find(r => r.id === id))
        .filter(Boolean)
        .concat(uniqueResults.filter(r => !rankedIds.includes(r.id)));
    } catch (e) {
      console.warn('Failed to parse AI ranking, using original order');
    }

    // Store search analytics
    await supabase
      .from('search_analytics')
      .insert({
        user_id,
        query,
        query_embedding: queryEmbedding,
        results_count: rankedResults.length,
        search_context: {
          location,
          filters,
          timestamp: new Date().toISOString()
        }
      });

    // Generate search suggestions
    const suggestionPrompt = `
    Based on the search query "${query}" and results found, suggest 3 related search queries that might interest the user.
    
    Return ONLY a JSON array of strings: ["suggestion1", "suggestion2", "suggestion3"]
    `;

    const suggestionResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4.1-mini-2025-04-14',
        messages: [
          { role: 'system', content: 'Generate search suggestions. Return only JSON arrays.' },
          { role: 'user', content: suggestionPrompt }
        ],
        max_tokens: 200,
        temperature: 0.7,
      }),
    });

    const suggestionData = await suggestionResponse.json();
    let suggestions = [];
    try {
      suggestions = JSON.parse(suggestionData.choices[0].message.content);
    } catch (e) {
      console.warn('Failed to parse AI suggestions');
    }

    console.log('Smart search completed:', rankedResults.length, 'results');

    return new Response(JSON.stringify({
      results: rankedResults.slice(0, 20),
      suggestions,
      total_count: rankedResults.length,
      search_metadata: {
        semantic_matches: semanticResults?.length || 0,
        text_matches: textResults?.length || 0,
        ai_ranked: true
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in smart-search function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      details: 'Smart search failed'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});