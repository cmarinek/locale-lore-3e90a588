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
    const { sourceTranslations, targetTranslations } = await req.json();

    // Flatten nested objects
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

    const sourceFlat = flattenObject(sourceTranslations);
    const targetFlat = flattenObject(targetTranslations);

    const missingKeys: string[] = [];
    const emptyKeys: string[] = [];

    // Check for missing or empty translations
    for (const key in sourceFlat) {
      if (!(key in targetFlat)) {
        missingKeys.push(key);
      } else if (!targetFlat[key] || targetFlat[key].trim() === '') {
        emptyKeys.push(key);
      }
    }

    const totalKeys = Object.keys(sourceFlat).length;
    const translatedKeys = totalKeys - missingKeys.length - emptyKeys.length;
    const completionPercentage = Math.round((translatedKeys / totalKeys) * 100);

    console.log(`Analysis complete: ${translatedKeys}/${totalKeys} keys translated (${completionPercentage}%)`);

    return new Response(JSON.stringify({
      success: true,
      totalKeys,
      translatedKeys,
      missingKeys,
      emptyKeys,
      completionPercentage
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Detection error:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Detection failed' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});