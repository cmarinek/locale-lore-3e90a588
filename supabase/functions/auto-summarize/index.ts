
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

    const { content, type = 'fact', max_length = 150 } = await req.json();

    console.log('Generating summary for content:', content.substring(0, 100));

    const summaryPrompt = `
    Create a concise, engaging summary of this ${type} content. 

    Original Content: "${content}"

    Requirements:
    - Maximum ${max_length} characters
    - Maintain key information and context
    - Make it engaging and readable
    - Preserve important facts and details
    - Use clear, accessible language

    Generate:
    1. A short summary (under ${max_length} chars)
    2. A one-sentence version (under 80 chars)
    3. Key points (bullet format)

    Respond with JSON containing:
    - "summary": the main summary
    - "short_summary": one sentence version
    - "key_points": array of key points
    - "word_count": original vs summary word count
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
            content: 'You are an expert at creating concise, engaging summaries. Always respond with valid JSON.' 
          },
          { role: 'user', content: summaryPrompt }
        ],
        max_completion_tokens: 400,
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to generate summary with OpenAI');
    }

    const data = await response.json();
    let summaryResult;

    try {
      summaryResult = JSON.parse(data.choices[0]?.message?.content || '{}');
    } catch (parseError) {
      summaryResult = {
        summary: content.substring(0, max_length),
        short_summary: content.substring(0, 80),
        key_points: ['Original content preserved'],
        word_count: { original: content.split(' ').length, summary: 0 }
      };
    }

    console.log('Summary result:', summaryResult);

    return new Response(JSON.stringify(summaryResult), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in auto-summarize function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      details: 'Auto-summarization failed'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
