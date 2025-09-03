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

    console.log('Generating Discovery of the Day');

    // Get today's date
    const today = new Date().toISOString().split('T')[0];

    // Check if today's discovery already exists
    const { data: existingDiscovery } = await supabase
      .from('discovery_of_the_day')
      .select('*')
      .eq('date', today)
      .single();

    if (existingDiscovery) {
      console.log('Discovery of the day already exists for today');
      return new Response(JSON.stringify(existingDiscovery), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get trending facts to choose from
    const { data: trendingFacts } = await supabase
      .from('trending_facts')
      .select(`
        fact_id,
        score,
        facts (
          id,
          title,
          description,
          location_name,
          latitude,
          longitude,
          categories (
            category_translations (name)
          )
        )
      `)
      .order('score', { ascending: false })
      .limit(10);

    if (!trendingFacts || trendingFacts.length === 0) {
      // Fallback to random verified facts
      const { data: randomFacts } = await supabase
        .from('facts')
        .select(`
          id,
          title,
          description,
          location_name,
          latitude,
          longitude,
          categories (
            category_translations (name)
          )
        `)
        .eq('status', 'verified')
        .order('created_at', { ascending: false })
        .limit(10);

      if (!randomFacts || randomFacts.length === 0) {
        throw new Error('No facts available for discovery of the day');
      }
    }

    const factsToConsider = trendingFacts?.map(tf => tf.facts) || [];

    // AI prompt to select and enhance the best fact
    const selectionPrompt = `
    You are a curator for "Discovery of the Day" - select the most fascinating fact and create engaging content.

    Available Facts:
    ${JSON.stringify(factsToConsider.map((f, idx) => ({
      index: idx,
      title: f?.title,
      description: f?.description,
      location: f?.location_name,
      category: f?.categories?.category_translations?.[0]?.name
    })), null, 2)}

    Select the most interesting fact and create:
    1. An engaging AI summary (2-3 sentences that hook readers)
    2. A fun fact or interesting detail not mentioned in the original
    3. Explain why this discovery is special for today

    Respond in JSON format:
    {
      "selected_index": 0,
      "ai_summary": "Engaging summary that makes people want to learn more...",
      "fun_fact": "Did you know that this place also...",
      "why_today": "This discovery is perfect for today because..."
    }
    `;

    const selectionResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4.1-2025-04-14',
        messages: [
          { 
            role: 'system', 
            content: 'You are an expert curator creating engaging daily discoveries. Always respond with valid JSON.' 
          },
          { role: 'user', content: selectionPrompt }
        ],
        max_tokens: 1000,
        temperature: 0.8,
      }),
    });

    const selectionData = await selectionResponse.json();
    console.log('AI selection response:', selectionData);

    if (!selectionData.choices?.[0]?.message?.content) {
      throw new Error('Invalid AI selection response');
    }

    const aiSelection = JSON.parse(selectionData.choices[0].message.content);
    const selectedFact = factsToConsider[aiSelection.selected_index];

    if (!selectedFact) {
      throw new Error('Selected fact not found');
    }

    // Store the discovery of the day
    const { data: discoveryOfDay, error } = await supabase
      .from('discovery_of_the_day')
      .insert({
        fact_id: selectedFact.id,
        date: today,
        ai_summary: aiSelection.ai_summary,
        fun_fact: aiSelection.fun_fact
      })
      .select(`
        *,
        facts (
          *,
          categories (
            category_translations (name)
          )
        )
      `)
      .single();

    if (error) {
      console.error('Error storing discovery of the day:', error);
      throw error;
    }

    console.log('Discovery of the day created successfully');

    // Generate optimal notification times for users
    const { data: userPrefs } = await supabase
      .from('user_preferences')
      .select('user_id, discovery_time_preferences, notification_preferences');

    // Create personalized notifications
    const notifications = [];
    for (const userPref of userPrefs || []) {
      if (userPref.notification_preferences?.enabled !== false) {
        const optimalTimes = userPref.discovery_time_preferences || {};
        const bestTime = Object.entries(optimalTimes)
          .sort(([,a], [,b]) => b - a)[0]?.[0] || 'morning';

        notifications.push({
          user_id: userPref.user_id,
          notification_type: 'discovery_of_day',
          title: '🌟 Discovery of the Day',
          body: `${aiSelection.ai_summary.substring(0, 100)  }...`,
          data: {
            fact_id: selectedFact.id,
            discovery_id: discoveryOfDay.id,
            optimal_time: bestTime
          }
        });
      }
    }

    if (notifications.length > 0) {
      await supabase
        .from('user_notifications')
        .insert(notifications);
    }

    return new Response(JSON.stringify({
      discovery: discoveryOfDay,
      notifications_created: notifications.length,
      ai_insights: {
        why_selected: aiSelection.why_today,
        engagement_potential: 'high'
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in discovery-of-the-day function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      details: 'Failed to generate discovery of the day'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});