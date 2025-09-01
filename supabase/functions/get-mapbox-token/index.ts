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
    // Get the Mapbox token from environment variables
    // When using Supabase secrets, they appear as environment variables
    const mapboxToken = Deno.env.get('MAPBOX_PUBLIC_TOKEN');
    
    console.log('Available environment variables:', Object.keys(Deno.env.toObject()));
    console.log('MAPBOX_PUBLIC_TOKEN value:', mapboxToken ? 'Found' : 'Not found');
    
    if (!mapboxToken) {
      console.error('MAPBOX_PUBLIC_TOKEN not found in environment variables');
      return new Response(
        JSON.stringify({ 
          error: 'Mapbox token not configured',
          availableEnvVars: Object.keys(Deno.env.toObject()).filter(key => key.includes('MAPBOX'))
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