import { serve } from "https://deno.land/std@0.208.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

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
    console.log('🗺️ Mapbox proxy function called');
    
    const MAPBOX_ACCESS_TOKEN = Deno.env.get('MAPBOX_ACCESS_TOKEN');
    if (!MAPBOX_ACCESS_TOKEN) {
      console.error('❌ MAPBOX_ACCESS_TOKEN not found in environment');
      return new Response(
        JSON.stringify({ error: 'Mapbox API key not configured' }), 
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const url = new URL(req.url);
    const action = url.searchParams.get('action');
    
    console.log('📍 Action requested:', action);

    switch (action) {
      case 'geocode': {
        const query = url.searchParams.get('query');
        if (!query) {
          return new Response(
            JSON.stringify({ error: 'Query parameter required' }), 
            { 
              status: 400, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          );
        }

        const mapboxUrl = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?access_token=${MAPBOX_ACCESS_TOKEN}&limit=5`;
        
        console.log('🔍 Geocoding query:', query);
        const response = await fetch(mapboxUrl);
        const data = await response.json();
        
        return new Response(JSON.stringify(data), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      case 'reverse-geocode': {
        const lng = url.searchParams.get('lng');
        const lat = url.searchParams.get('lat');
        
        if (!lng || !lat) {
          return new Response(
            JSON.stringify({ error: 'lng and lat parameters required' }), 
            { 
              status: 400, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          );
        }

        const mapboxUrl = `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${MAPBOX_ACCESS_TOKEN}&types=place,locality,neighborhood`;
        
        console.log('📍 Reverse geocoding:', lat, lng);
        const response = await fetch(mapboxUrl);
        const data = await response.json();
        
        return new Response(JSON.stringify(data), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      case 'directions': {
        const coordinates = url.searchParams.get('coordinates');
        const profile = url.searchParams.get('profile') || 'walking';
        
        if (!coordinates) {
          return new Response(
            JSON.stringify({ error: 'coordinates parameter required' }), 
            { 
              status: 400, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          );
        }

        const mapboxUrl = `https://api.mapbox.com/directions/v5/mapbox/${profile}/${coordinates}?access_token=${MAPBOX_ACCESS_TOKEN}&geometries=geojson`;
        
        console.log('🗺️ Getting directions for:', coordinates);
        const response = await fetch(mapboxUrl);
        const data = await response.json();
        
        return new Response(JSON.stringify(data), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      case 'places': {
        const query = url.searchParams.get('query');
        const proximity = url.searchParams.get('proximity');
        
        if (!query) {
          return new Response(
            JSON.stringify({ error: 'query parameter required' }), 
            { 
              status: 400, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          );
        }

        let mapboxUrl = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?access_token=${MAPBOX_ACCESS_TOKEN}&types=poi,place&limit=10`;
        
        if (proximity) {
          mapboxUrl += `&proximity=${proximity}`;
        }
        
        console.log('🏢 Searching places:', query);
        const response = await fetch(mapboxUrl);
        const data = await response.json();
        
        return new Response(JSON.stringify(data), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      default:
        return new Response(
          JSON.stringify({ error: 'Invalid action. Supported: geocode, reverse-geocode, directions, places' }), 
          { 
            status: 400, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
    }

  } catch (error) {
    console.error('❌ Mapbox proxy error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }), 
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
})