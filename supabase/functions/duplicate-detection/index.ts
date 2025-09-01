
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

    const { title, description, location_name } = await req.json();

    console.log('Checking for duplicates:', { title, description, location_name });

    // Get existing facts from database
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get facts with similar titles or locations
    const { data: existingFacts } = await supabase
      .from('facts')
      .select('id, title, description, location_name')
      .or(`title.ilike.%${title}%,location_name.ilike.%${location_name}%`)
      .limit(20);

    if (!existingFacts || existingFacts.length === 0) {
      return new Response(JSON.stringify({
        duplicates: [],
        suggestions: [],
        is_duplicate: false
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Use OpenAI to analyze similarity
    const similarityPrompt = `
    Analyze if the new fact is a duplicate or similar to existing facts. 

    New Fact:
    Title: ${title}
    Description: ${description}
    Location: ${location_name}

    Existing Facts:
    ${existingFacts.map((fact, i) => `
    ${i + 1}. ID: ${fact.id}
       Title: ${fact.title}
       Description: ${fact.description}
       Location: ${fact.location_name}
    `).join('\n')}

    Respond with JSON containing:
    - "duplicates": array of fact IDs that are likely duplicates
    - "similar": array of fact IDs that are similar but not duplicates
    - "is_duplicate": boolean if any exact duplicates found
    - "merge_suggestions": array of suggestions for merging similar facts
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
            content: 'You are an expert at detecting duplicate and similar content. Always respond with valid JSON only.' 
          },
          { role: 'user', content: similarityPrompt }
        ],
        max_completion_tokens: 800,
        temperature: 0.1,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to analyze duplicates with OpenAI');
    }

    const data = await response.json();
    let duplicateResult;

    try {
      duplicateResult = JSON.parse(data.choices[0]?.message?.content || '{}');
    } catch (parseError) {
      duplicateResult = {
        duplicates: [],
        similar: [],
        is_duplicate: false,
        merge_suggestions: []
      };
    }

    console.log('Duplicate detection result:', duplicateResult);

    return new Response(JSON.stringify(duplicateResult), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in duplicate-detection function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      details: 'Duplicate detection failed'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
