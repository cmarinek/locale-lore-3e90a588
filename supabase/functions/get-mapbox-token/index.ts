import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve((req) => {
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
      if (token) {
        mapboxToken = token;
        foundVariable = name;
        break;
      }
    }
    
    console.log('Environment check:', {
      checkedVariables: possibleNames,
      foundVariable,
      hasToken: !!mapboxToken,
      allEnvVars: Object.keys(Deno.env.toObject())
    });
    
    if (!mapboxToken) {
      console.error('No Mapbox token found in any expected environment variable');
      return new Response(
        JSON.stringify({ 
          error: 'Mapbox token not configured',
          checkedVariables: possibleNames,
          availableEnvVars: Object.keys(Deno.env.toObject())
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Return the token
    return new Response(
      JSON.stringify({ token: mapboxToken }),
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