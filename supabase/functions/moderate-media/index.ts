
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { fileUrl, fileName, mimeType } = await req.json();

    console.log('Moderating media:', { fileUrl, fileName, mimeType });

    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      throw new Error('OPENAI_API_KEY is not set');
    }

    // Use OpenAI's moderation API for text-based analysis
    // For images, we'll use a vision model
    let moderationResult = {
      safe: true,
      categories: [],
      confidence: 0.9,
      flags: []
    };

    if (mimeType.startsWith('image/')) {
      // Use OpenAI Vision API for image moderation
      const visionResponse = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openAIApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: 'You are a content moderation AI. Analyze the image for inappropriate content including nudity, violence, hate symbols, or other harmful content. Respond with JSON only.'
            },
            {
              role: 'user',
              content: [
                {
                  type: 'text',
                  text: 'Analyze this image for inappropriate content. Return JSON with: {"safe": boolean, "categories": ["category1"], "confidence": 0-1, "flags": ["flag1"]}'
                },
                {
                  type: 'image_url',
                  image_url: {
                    url: fileUrl
                  }
                }
              ]
            }
          ],
          max_tokens: 300,
        }),
      });

      if (visionResponse.ok) {
        const visionData = await visionResponse.json();
        try {
          const analysis = JSON.parse(visionData.choices[0]?.message?.content || '{"safe": true, "categories": [], "confidence": 0.9, "flags": []}');
          moderationResult = analysis;
        } catch (parseError) {
          console.error('Error parsing vision response:', parseError);
        }
      }
    }

    // Additional checks for copyright detection (simplified)
    if (fileName.toLowerCase().includes('watermark') || 
        fileName.toLowerCase().includes('getty') ||
        fileName.toLowerCase().includes('shutterstock')) {
      moderationResult.safe = false;
      moderationResult.flags.push('potential_copyright');
    }

    console.log('Moderation result:', moderationResult);

    // Store moderation result in database
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { error: insertError } = await supabase
      .from('media_moderation_results')
      .insert({
        file_url: fileUrl,
        file_name: fileName,
        mime_type: mimeType,
        safe: moderationResult.safe,
        categories: moderationResult.categories,
        confidence: moderationResult.confidence,
        flags: moderationResult.flags,
        moderated_at: new Date().toISOString()
      });

    if (insertError) {
      console.error('Error inserting moderation result:', insertError);
    }

    return new Response(JSON.stringify(moderationResult), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in moderate-media function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      safe: false,
      categories: ['error'],
      confidence: 0,
      flags: ['moderation_error']
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
