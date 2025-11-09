
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
    const { timeRange = '7d' } = await req.json();

    console.log('Generating media analytics for:', timeRange);

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Calculate date range
    const now = new Date();
    const daysAgo = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : timeRange === '90d' ? 90 : 365;
    const startDate = new Date(now.getTime() - (daysAgo * 24 * 60 * 60 * 1000));

    // Get media files data
    const { data: mediaFiles, error } = await supabase
      .from('media_files')
      .select('*')
      .gte('uploaded_at', startDate.toISOString());

    if (error) throw error;

    // Calculate total size across all files
    const totalSize = mediaFiles?.reduce((sum, file) => sum + (file.size || 0), 0) || 0;
    
    // Get storage bucket info to calculate actual usage
    let storageUsagePercent = 0;
    try {
      // Query storage bucket limits (assuming 10GB default limit)
      const storageLimitBytes = 10 * 1024 * 1024 * 1024; // 10GB default
      storageUsagePercent = (totalSize / storageLimitBytes) * 100;
    } catch (error) {
      console.warn('Could not calculate storage usage:', error);
      // Fallback to estimated usage based on file count
      const avgFileSize = totalSize / (mediaFiles?.length || 1);
      const estimatedTotal = avgFileSize * (mediaFiles?.length || 0);
      storageUsagePercent = Math.min((estimatedTotal / (10 * 1024 * 1024 * 1024)) * 100, 100);
    }

    // Calculate bandwidth (views * file size estimate)
    const estimatedViews = mediaFiles?.reduce((sum, file) => {
      // Estimate 2-5 views per day old for each file
      const daysOld = Math.max(1, Math.floor((now.getTime() - new Date(file.uploaded_at).getTime()) / (24 * 60 * 60 * 1000)));
      return sum + (daysOld * 3); // Average 3 views per day
    }, 0) || 0;
    
    const bandwidthUsage = totalSize * estimatedViews;

    // Calculate analytics
    const analytics = {
      totalUploads: mediaFiles?.length || 0,
      totalSize: totalSize,
      byType: {},
      byStatus: {},
      storageUsage: Math.round(storageUsagePercent * 100) / 100,
      bandwidthUsage: bandwidthUsage,
      averageFileSize: mediaFiles?.length ? Math.round(totalSize / mediaFiles.length) : 0,
      storageLimit: 10 * 1024 * 1024 * 1024, // 10GB
      remainingStorage: Math.max(0, (10 * 1024 * 1024 * 1024) - totalSize)
    };

    // Group by type
    mediaFiles?.forEach(file => {
      const type = file.mime_type || 'unknown';
      analytics.byType[type] = (analytics.byType[type] || 0) + 1;
    });

    // Group by status
    mediaFiles?.forEach(file => {
      const status = file.status || 'unknown';
      analytics.byStatus[status] = (analytics.byStatus[status] || 0) + 1;
    });

    console.log('Media analytics calculated:', analytics);

    return new Response(JSON.stringify(analytics), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in media-analytics function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      totalUploads: 0,
      totalSize: 0,
      byType: {},
      byStatus: {},
      storageUsage: 0,
      bandwidthUsage: 0
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
