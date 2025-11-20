
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { checkRateLimit, RATE_LIMITS } from '../_shared/rate-limit.ts';

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

    // Rate limit by IP to prevent AI API abuse (expensive operation)
    const clientIP = req.headers.get('x-forwarded-for')?.split(',')[0] ||
                     req.headers.get('x-real-ip') ||
                     'unknown';

    const rateLimitResult = await checkRateLimit(clientIP, RATE_LIMITS.CREATE);
    if (!rateLimitResult.allowed) {
      return new Response(
        JSON.stringify({
          error: 'Too many moderation requests. Please wait before trying again.',
          retryAfter: rateLimitResult.retryAfter
        }),
        {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    const { content, type = 'fact' } = await req.json();

    console.log('Moderating content:', { content: content.substring(0, 100), type });

    const moderationPrompt = `
    Analyze this ${type} content for potential issues. Check for:
    1. Inappropriate language or hate speech
    2. Misinformation or false claims
    3. Spam or promotional content
    4. Personal information exposure
    5. Overall sentiment and toxicity

    Content: "${content}"

    Respond with a JSON object containing:
    - "safe": boolean (true if content is safe)
    - "issues": array of detected issues
    - "sentiment": "positive", "neutral", or "negative"
    - "toxicity_score": number from 0-1 (0 = not toxic, 1 = very toxic)
    - "recommendations": array of suggestions for improvement
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
            content: 'You are a content moderation expert. Always respond with valid JSON only.' 
          },
          { role: 'user', content: moderationPrompt }
        ],
        max_completion_tokens: 500,
        temperature: 0.1,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to moderate content with OpenAI');
    }

    const data = await response.json();
    let moderationResult;

    try {
      moderationResult = JSON.parse(data.choices[0]?.message?.content || '{}');
    } catch (parseError) {
      // Fallback if JSON parsing fails
      moderationResult = {
        safe: true,
        issues: [],
        sentiment: 'neutral',
        toxicity_score: 0,
        recommendations: []
      };
    }

    console.log('Moderation result:', moderationResult);

    return new Response(JSON.stringify(moderationResult), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in content-moderation function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      details: 'Content moderation failed'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
