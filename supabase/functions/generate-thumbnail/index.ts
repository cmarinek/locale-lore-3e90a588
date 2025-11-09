
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
      // For images, use Supabase's built-in transformation
      const url = new URL(fileUrl);
      url.searchParams.set('width', '300');
      url.searchParams.set('height', '300');
      url.searchParams.set('resize', 'cover');
      thumbnailUrl = url.toString();
    } else if (mimeType.startsWith('video/')) {
      // For videos, generate thumbnail using video frame extraction
      try {
        // Fetch the video file
        const videoResponse = await fetch(fileUrl);
        if (!videoResponse.ok) {
          throw new Error('Failed to fetch video');
        }

        // Use Supabase storage to store the generated thumbnail
        const thumbnailName = `thumbnail_${Date.now()}.jpg`;
        const bucketName = 'media-files'; // Assuming media-files bucket exists
        
        // For now, create a data URI placeholder since Deno doesn't have FFmpeg
        // In production, use an FFmpeg service or wasm-based solution
        const canvas = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Crect width='300' height='300' fill='%23333'/%3E%3Ctext x='50%25' y='50%25' fill='white' text-anchor='middle' dominant-baseline='middle' font-size='20' font-family='Arial'%3EVideo%3C/text%3E%3C/svg%3E`;
        
        // Try to upload to storage, fallback to data URI
        try {
          const { data: uploadData, error: uploadError } = await supabase.storage
            .from(bucketName)
            .upload(`thumbnails/${thumbnailName}`, new Blob([canvas]), {
              contentType: 'image/svg+xml',
              upsert: true
            });

          if (uploadError) throw uploadError;

          const { data: urlData } = supabase.storage
            .from(bucketName)
            .getPublicUrl(`thumbnails/${thumbnailName}`);

          thumbnailUrl = urlData.publicUrl;
        } catch {
          thumbnailUrl = canvas;
        }
      } catch (error) {
        console.error('Video thumbnail generation error:', error);
        // Fallback to SVG placeholder
        thumbnailUrl = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Crect width='300' height='300' fill='%23333'/%3E%3Ctext x='50%25' y='50%25' fill='white' text-anchor='middle' dominant-baseline='middle' font-size='20' font-family='Arial'%3EVideo%3C/text%3E%3C/svg%3E`;
      }
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
