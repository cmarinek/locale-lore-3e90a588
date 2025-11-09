import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Try multiple possible environment variable names for the Mapbox token
    const possibleNames = [
      'MAPBOX_PUBLIC_TOKEN',
      'MAPBOX_TOKEN', 
      'MAPBOX_API_TOKEN',
      'MAPBOX_ACCESS_TOKEN'
    ];
    
    let mapboxToken = null;
    let foundVariable = null;
    
    for (const name of possibleNames) {
      const token = Deno.env.get(name);
      console.log(`Checking ${name}:`, {
        exists: !!token,
        length: token?.length || 0,
        hasWhitespace: token ? /[\r\n\s]/.test(token) : false,
        preview: token ? `${token.substring(0, 20)}...` : 'null'
      });
      
      if (token) {
        // Aggressively clean the token - remove ALL whitespace characters
        mapboxToken = token
          .replace(/[\r\n\t\f\v\s]/g, '') // Remove all whitespace variants
          .replace(/[^\x20-\x7E]/g, '')   // Remove non-printable characters
          .trim();
        
        foundVariable = name;
        
        console.log(`After cleaning ${name}:`, {
          length: mapboxToken.length,
          preview: mapboxToken ? `${mapboxToken.substring(0, 20)}...` : 'empty',
          isValid: mapboxToken.length > 0
        });
        
        // Only use non-empty tokens
        if (mapboxToken.length > 0) {
          break;
        } else {
          mapboxToken = null;
        }
      }
    }
    
    console.log('Environment check:', {
      checkedVariables: possibleNames,
      foundVariable: foundVariable,
      hasToken: !!mapboxToken,
      tokenLength: mapboxToken?.length || 0,
      tokenPreview: mapboxToken ? `${mapboxToken.substring(0, 20)}...` : 'null'
    });
    
    if (!mapboxToken || mapboxToken.length === 0) {
      console.error('No valid Mapbox token found in any expected environment variable');
      return new Response(
        JSON.stringify({ 
          error: 'Mapbox token not configured or is empty after cleaning',
          checkedVariables: possibleNames,
          foundVariable: foundVariable,
          tokenWasEmpty: foundVariable ? true : false
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log('✅ Returning valid token:', {
      length: mapboxToken.length,
      preview: `${mapboxToken.substring(0, 20)}...`,
      startsWithPk: mapboxToken.startsWith('pk.') || mapboxToken.startsWith('sk.')
    });

    // Return the token
    return new Response(
      JSON.stringify({ 
        token: mapboxToken,
        length: mapboxToken.length,
        isValid: mapboxToken.length > 0
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error in get-mapbox-token function:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
})