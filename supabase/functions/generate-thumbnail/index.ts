
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
    const { fileUrl, mimeType } = await req.json();

    console.log('Generating thumbnail for:', { fileUrl, mimeType });

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    let thumbnailUrl = '';

    if (mimeType.startsWith('image/')) {
      // For images, create a resized version
      // This is a simplified implementation - in production you'd use an image processing service
      thumbnailUrl = `${fileUrl}?width=300&height=300&fit=cover`;
    } else if (mimeType.startsWith('video/')) {
      // For videos, extract a frame as thumbnail
      // This requires a video processing service like FFmpeg
      // For now, we'll use a placeholder
      thumbnailUrl = 'https://via.placeholder.com/300x300?text=Video+Thumbnail';
    }

    console.log('Generated thumbnail URL:', thumbnailUrl);

    return new Response(JSON.stringify({ thumbnailUrl }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in generate-thumbnail function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      thumbnailUrl: ''
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
