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

    const { user_id, location, preferences = {} } = await req.json();

    console.log('Generating AI recommendations for user:', user_id);

    // Get user's discovery history
    const { data: userHistory } = await supabase
      .from('user_discovery_history')
      .select(`
        fact_id,
        interaction_type,
        dwell_time,
        facts (
          title,
          description,
          category_id,
          latitude,
          longitude,
          categories (slug, category_translations (name))
        )
      `)
      .eq('user_id', user_id)
      .order('created_at', { ascending: false })
      .limit(50);

    // Get user preferences
    const { data: userPrefs } = await supabase
      .from('user_preferences')
      .select('*')
      .eq('user_id', user_id)
      .single();

    // Get similar users for collaborative filtering
    const { data: similarUsers } = await supabase
      .rpc('calculate_user_similarity', { user1_id: user_id })
      .limit(10);

    // Get trending facts
    const { data: trendingFacts } = await supabase
      .from('trending_facts')
      .select(`
        fact_id,
        score,
        facts (*)
      `)
      .order('score', { ascending: false })
      .limit(20);

    // Prepare context for AI
    const userContext = {
      interactionHistory: userHistory?.map(h => ({
        title: h.facts?.title,
        category: h.facts?.categories?.category_translations?.[0]?.name,
        interactionType: h.interaction_type,
        dwellTime: h.dwell_time
      })) || [],
      preferences: userPrefs || {},
      location,
      similarUserPreferences: similarUsers || []
    };

    // AI recommendation prompt
    const aiPrompt = `
    You are an expert discovery recommendation engine. Based on the user's interaction history and preferences, recommend personalized discoveries.

    User Context:
    ${JSON.stringify(userContext, null, 2)}

    Available Facts:
    ${JSON.stringify(trendingFacts?.map(f => ({
      id: f.fact_id,
      title: f.facts?.title,
      description: f.facts?.description,
      score: f.score
    })), null, 2)}

    Generate 5 personalized recommendations with:
    1. fact_id from available facts
    2. confidence_score (0.0-1.0)
    3. reasoning (why this fact matches the user)
    4. recommendation_type ('personalized', 'collaborative', 'trending', 'location')

    Response format (JSON only):
    {
      "recommendations": [
        {
          "fact_id": "uuid",
          "confidence_score": 0.85,
          "reasoning": "Based on your interest in history and recent interactions...",
          "recommendation_type": "personalized",
          "metadata": {"category_match": true, "location_proximity": false}
        }
      ]
    }
    `;

    // Call OpenAI
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4.1-2025-04-14',
        messages: [
          { role: 'system', content: 'You are a personalized discovery recommendation engine. Always respond with valid JSON only.' },
          { role: 'user', content: aiPrompt }
        ],
        max_tokens: 2000,
        temperature: 0.7,
      }),
    });

    const aiData = await response.json();
    console.log('OpenAI response:', aiData);

    if (!aiData.choices?.[0]?.message?.content) {
      throw new Error('Invalid AI response');
    }

    const recommendations = JSON.parse(aiData.choices[0].message.content);

    // Store recommendations in database
    const recommendationsToStore = recommendations.recommendations.map(rec => ({
      user_id,
      fact_id: rec.fact_id,
      recommendation_type: rec.recommendation_type,
      confidence_score: rec.confidence_score,
      reasoning: rec.reasoning,
      metadata: rec.metadata || {}
    }));

    const { data: storedRecs, error } = await supabase
      .from('ai_recommendations')
      .insert(recommendationsToStore)
      .select('*');

    if (error) {
      console.error('Error storing recommendations:', error);
      throw error;
    }

    console.log('Generated and stored recommendations:', storedRecs?.length);

    return new Response(JSON.stringify({ 
      recommendations: storedRecs,
      generated_at: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in ai-recommendations function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      details: 'Failed to generate AI recommendations'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});