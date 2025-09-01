
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

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

    const { input, context } = await req.json();

    console.log('Generating location suggestions for:', input);

    const locationPrompt = `
    Based on the user input and context, suggest relevant locations that might be related to their fact or story.

    User Input: "${input}"
    Context: ${JSON.stringify(context)}

    Generate location suggestions that could be:
    1. Specific places mentioned or implied in the input
    2. Related historical locations
    3. Similar places of interest
    4. Geographic areas that might be relevant

    Respond with JSON containing:
    - "suggestions": array of location objects with "name", "coordinates" (lat, lng), "type", "relevance_score"
    - "primary_suggestion": the most likely location
    - "reasoning": explanation for the suggestions
    `;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
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
            content: 'You are a geographic and location expert. Always respond with valid JSON containing location suggestions.' 
          },
          { role: 'user', content: locationPrompt }
        ],
        max_completion_tokens: 600,
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to generate location suggestions with OpenAI');
    }

    const data = await response.json();
    let locationResult;

    try {
      locationResult = JSON.parse(data.choices[0]?.message?.content || '{}');
    } catch (parseError) {
      locationResult = {
        suggestions: [],
        primary_suggestion: null,
        reasoning: 'Unable to process location suggestions'
      };
    }

    console.log('Location suggestions result:', locationResult);

    return new Response(JSON.stringify(locationResult), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in smart-location function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      details: 'Smart location suggestions failed'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
