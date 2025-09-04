import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    console.log('Starting story maintenance tasks...');

    // 1. Clean up expired stories
    console.log('Cleaning up expired stories...');
    const { error: cleanupError } = await supabaseClient.rpc('cleanup_expired_stories');
    
    if (cleanupError) {
      console.error('Error cleaning up expired stories:', cleanupError);
    } else {
      console.log('Successfully cleaned up expired stories');
    }

    // 2. Update trending stories
    console.log('Updating trending stories...');
    const { error: trendingError } = await supabaseClient.rpc('update_trending_stories');
    
    if (trendingError) {
      console.error('Error updating trending stories:', trendingError);
    } else {
      console.log('Successfully updated trending stories');
    }

    // 3. Get analytics for the last 24 hours
    const { data: analytics, error: analyticsError } = await supabaseClient
      .from('stories')
      .select('id, view_count, like_count, comment_count, created_at')
      .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

    if (analyticsError) {
      console.error('Error fetching analytics:', analyticsError);
    } else {
      const totalViews = analytics?.reduce((sum, story) => sum + story.view_count, 0) || 0;
      const totalLikes = analytics?.reduce((sum, story) => sum + story.like_count, 0) || 0;
      const totalComments = analytics?.reduce((sum, story) => sum + story.comment_count, 0) || 0;
      
      console.log(`Analytics for last 24h: ${analytics?.length || 0} stories, ${totalViews} views, ${totalLikes} likes, ${totalComments} comments`);
    }

    // 4. Clean up old media files from stories that are no longer active
    console.log('Checking for orphaned media files...');
    const { data: inactiveStories, error: inactiveError } = await supabaseClient
      .from('stories')
      .select('media_urls')
      .eq('is_active', false)
      .lt('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()); // Older than 7 days

    if (inactiveError) {
      console.error('Error fetching inactive stories:', inactiveError);
    } else if (inactiveStories && inactiveStories.length > 0) {
      console.log(`Found ${inactiveStories.length} inactive stories older than 7 days`);
      
      // Extract file paths and remove from storage
      const filesToDelete: string[] = [];
      inactiveStories.forEach(story => {
        if (story.media_urls) {
          story.media_urls.forEach((url: string) => {
            // Extract file path from Supabase storage URL
            const matches = url.match(/\/storage\/v1\/object\/public\/media\/(.+)/);
            if (matches && matches[1]) {
              filesToDelete.push(matches[1]);
            }
          });
        }
      });

      if (filesToDelete.length > 0) {
        const { error: deleteError } = await supabaseClient.storage
          .from('media')
          .remove(filesToDelete);

        if (deleteError) {
          console.error('Error deleting media files:', deleteError);
        } else {
          console.log(`Successfully deleted ${filesToDelete.length} orphaned media files`);
        }
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Story maintenance completed successfully',
        timestamp: new Date().toISOString()
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Story maintenance error:', error);
    
    return new Response(
      JSON.stringify({ 
        error: 'Story maintenance failed', 
        details: error.message,
        timestamp: new Date().toISOString()
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});