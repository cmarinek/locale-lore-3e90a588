
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

    const { title, description, location_name, sources = [] } = await req.json();

    console.log('Verifying fact:', { title, description, location_name });

    const verificationPrompt = `
    As a fact-checking expert, analyze this claim for accuracy and verifiability.

    Claim Details:
    Title: ${title}
    Description: ${description}
    Location: ${location_name}
    ${sources.length > 0 ? `Sources provided: ${sources.join(', ')}` : 'No sources provided'}

    Evaluate:
    1. Factual accuracy based on general knowledge
    2. Plausibility and consistency
    3. Historical context if applicable
    4. Geographic accuracy
    5. Need for additional verification

    Respond with JSON containing:
    - "verification_status": "verified", "needs_review", "questionable", "false"
    - "confidence_score": number 0-1
    - "issues_found": array of potential problems
    - "verification_notes": detailed explanation
    - "suggested_sources": array of recommended sources for verification
    - "fact_check_summary": brief summary of findings
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
            content: 'You are an expert fact-checker. Always respond with valid JSON containing verification analysis.' 
          },
          { role: 'user', content: verificationPrompt }
        ],
        max_completion_tokens: 800,
        temperature: 0.1,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to verify fact with OpenAI');
    }

    const data = await response.json();
    let verificationResult;

    try {
      verificationResult = JSON.parse(data.choices[0]?.message?.content || '{}');
    } catch (parseError) {
      verificationResult = {
        verification_status: 'needs_review',
        confidence_score: 0.5,
        issues_found: [],
        verification_notes: 'Unable to complete automated verification',
        suggested_sources: [],
        fact_check_summary: 'Verification process encountered an error'
      };
    }

    console.log('Fact verification result:', verificationResult);

    return new Response(JSON.stringify(verificationResult), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in fact-verification function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      details: 'Fact verification failed'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
