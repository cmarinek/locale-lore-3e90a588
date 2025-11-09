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

    const { sourceLanguage, targetLanguage, translations, namespace } = await req.json();

    console.log(`Translation request: ${sourceLanguage} -> ${targetLanguage} for namespace: ${namespace}`);

    // Flatten nested object for translation
    const flattenObject = (obj: any, prefix = ''): Record<string, string> => {
      let result: Record<string, string> = {};
      for (const key in obj) {
        const fullKey = prefix ? `${prefix}.${key}` : key;
        if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
          result = { ...result, ...flattenObject(obj[key], fullKey) };
        } else if (typeof obj[key] === 'string') {
          result[fullKey] = obj[key];
        }
      }
      return result;
    };

    // Unflatten object back to nested structure
    const unflattenObject = (flat: Record<string, string>): any => {
      const result: any = {};
      for (const key in flat) {
        const keys = key.split('.');
        let current = result;
        for (let i = 0; i < keys.length - 1; i++) {
          if (!current[keys[i]]) current[keys[i]] = {};
          current = current[keys[i]];
        }
        current[keys[keys.length - 1]] = flat[key];
      }
      return result;
    };

    const flatTranslations = flattenObject(translations);
    const translationPairs = Object.entries(flatTranslations);
    
    // Process translations in batches to avoid token limits
    const batchSize = 20;
    const batches = [];
    for (let i = 0; i < translationPairs.length; i += batchSize) {
      batches.push(translationPairs.slice(i, i + batchSize));
    }

    const translatedFlat: Record<string, string> = {};

    for (const batch of batches) {
      const textsToTranslate = batch.map(([key, text]) => `${key}: ${text}`).join('\n');

      const prompt = `Translate the following key-value pairs from ${sourceLanguage} to ${targetLanguage}. 
Maintain the same format (key: translation). Preserve the meaning and context. 
For UI text, use natural, idiomatic expressions that native speakers would use.
${targetLanguage === 'Arabic' ? 'Use formal Modern Standard Arabic appropriate for a web application.' : ''}

${textsToTranslate}

Respond ONLY with the translated key-value pairs, one per line, keeping the exact same keys.`;

      console.log(`Translating batch of ${batch.length} items to ${targetLanguage}...`);

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
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
              content: 'You are a professional translator specializing in web application localization. Provide accurate, natural translations that maintain the tone and context of the original text.'
            },
            { role: 'user', content: prompt }
          ],
          temperature: 0.3,
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        console.error('OpenAI API error:', error);
        throw new Error(`Translation API failed: ${response.status}`);
      }

      const data = await response.json();
      const translatedText = data.choices[0].message.content;

      // Parse the response
      const lines = translatedText.split('\n').filter((line: string) => line.trim());
      for (const line of lines) {
        const colonIndex = line.indexOf(':');
        if (colonIndex > 0) {
          const key = line.substring(0, colonIndex).trim();
          const value = line.substring(colonIndex + 1).trim();
          translatedFlat[key] = value;
        }
      }

      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    // Unflatten back to nested structure
    const translatedObject = unflattenObject(translatedFlat);

    console.log(`Translation complete: ${Object.keys(translatedFlat).length} keys translated`);

    return new Response(JSON.stringify({ 
      success: true,
      translations: translatedObject,
      count: Object.keys(translatedFlat).length
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Translation sync error:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Translation failed' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});