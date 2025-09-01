
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

    const { content, target_language, source_language = 'auto' } = await req.json();

    console.log('Translating content to:', target_language);

    const translationPrompt = `
    Translate the following content to ${target_language}. 
    ${source_language !== 'auto' ? `Source language: ${source_language}` : 'Detect source language automatically.'}

    Content to translate: "${content}"

    Requirements:
    - Maintain cultural context and nuances
    - Preserve proper nouns and location names appropriately
    - Keep the original meaning and tone
    - Use natural, fluent ${target_language}

    Respond with JSON containing:
    - "translated_content": the translated text
    - "detected_language": the detected source language
    - "confidence": translation confidence score (0-1)
    - "notes": any translation notes or cultural adaptations made
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
            content: 'You are an expert translator with deep cultural knowledge. Always respond with valid JSON.' 
          },
          { role: 'user', content: translationPrompt }
        ],
        max_completion_tokens: 600,
        temperature: 0.1,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to translate content with OpenAI');
    }

    const data = await response.json();
    let translationResult;

    try {
      translationResult = JSON.parse(data.choices[0]?.message?.content || '{}');
    } catch (parseError) {
      translationResult = {
        translated_content: content,
        detected_language: 'unknown',
        confidence: 0,
        notes: 'Translation failed'
      };
    }

    console.log('Translation result:', translationResult);

    return new Response(JSON.stringify(translationResult), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in translate-content function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      details: 'Content translation failed'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
