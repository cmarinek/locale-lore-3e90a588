
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

    console.log('Categorizing fact:', { title, description, location_name });

    // Get available categories from database
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { data: categories } = await supabase
      .from('categories')
      .select('id, slug, category_translations(name)')
      .limit(20);

    const categoryList = categories?.map(cat => ({
      id: cat.id,
      slug: cat.slug,
      name: cat.category_translations?.[0]?.name || cat.slug
    })) || [];

    // Use OpenAI to categorize the fact
    const prompt = `
    You are an expert content categorizer. Based on the following fact details, determine the most appropriate category from the available options.

    Fact Details:
    Title: ${title}
    Description: ${description}
    Location: ${location_name}

    Available Categories:
    ${categoryList.map(cat => `- ${cat.name} (${cat.slug})`).join('\n')}

    Respond with ONLY the category slug that best matches this fact. If none fit perfectly, choose the closest match.
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
          { role: 'system', content: 'You are a content categorization expert. Always respond with only the category slug.' },
          { role: 'user', content: prompt }
        ],
        max_tokens: 50,
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to categorize with OpenAI');
    }

    const data = await response.json();
    const suggestedSlug = data.choices[0]?.message?.content?.trim().toLowerCase();
    
    // Find the matching category
    const matchedCategory = categoryList.find(cat => 
      cat.slug === suggestedSlug || cat.name.toLowerCase().includes(suggestedSlug)
    );

    const result = {
      suggested_category: matchedCategory || categoryList[0],
      confidence: matchedCategory ? 0.9 : 0.5,
      reasoning: `Based on content analysis of "${title}" and "${description}"`
    };

    console.log('Categorization result:', result);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in ai-categorize function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      details: 'Failed to categorize fact'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
