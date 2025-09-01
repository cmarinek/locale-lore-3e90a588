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
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { action, ...params } = await req.json();
    
    console.log('Bulk import processor action:', action, params);

    switch (action) {
      case 'create_job':
        return await createJob(supabase, params);
      case 'start_processing':
        return await startProcessing(supabase, params);
      case 'pause_job':
        return await pauseJob(supabase, params);
      case 'resume_job':
        return await resumeJob(supabase, params);
      case 'cancel_job':
        return await cancelJob(supabase, params);
      case 'get_jobs':
        return await getJobs(supabase, params);
      default:
        throw new Error('Invalid action');
    }

  } catch (error) {
    console.error('Error in bulk-import-processor function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      details: 'Bulk import processing failed'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function createJob(supabase: any, params: any) {
  const { 
    name, 
    source_type = 'wikipedia', 
    target_count = 100, 
    configuration = {} 
  } = params;

  const { data: job, error } = await supabase
    .from('acquisition_jobs')
    .insert({
      name,
      source_type,
      target_count,
      configuration: {
        categories: configuration.categories || ['history', 'science', 'culture', 'geography', 'nature'],
        regions: configuration.regions || [],
        include_images: configuration.include_images !== false,
        auto_categorize: configuration.auto_categorize !== false,
        content_moderation: configuration.content_moderation !== false,
        ...configuration
      },
      created_by: null // System created
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create job: ${error.message}`);
  }

  console.log('Created acquisition job:', job.id);

  return new Response(JSON.stringify({ 
    success: true,
    job: job
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

async function startProcessing(supabase: any, params: any) {
  const { jobId } = params;

  // Get job details
  const { data: job, error: jobError } = await supabase
    .from('acquisition_jobs')
    .select('*')
    .eq('id', jobId)
    .single();

  if (jobError || !job) {
    throw new Error('Job not found');
  }

  if (job.status === 'running') {
    return new Response(JSON.stringify({ 
      success: true,
      message: 'Job is already running'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  // Start the harvesting process
  const harvesterUrl = `${Deno.env.get('SUPABASE_URL')}/functions/v1/fact-harvester`;
  
  try {
    // Start harvest job
    const harvestResponse = await fetch(harvesterUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${Deno.env.get('SUPABASE_ANON_KEY')}`
      },
      body: JSON.stringify({
        action: 'start_harvest',
        jobId: job.id,
        categories: job.configuration.categories || ['general'],
        targetCount: job.target_count,
        regions: job.configuration.regions
      })
    });

    if (!harvestResponse.ok) {
      throw new Error('Failed to start harvest job');
    }

    // Process in background
    EdgeRuntime.waitUntil(processJobInBackground(supabase, job.id));

    return new Response(JSON.stringify({ 
      success: true,
      message: 'Processing started',
      jobId: job.id
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Failed to start processing:', error);
    
    // Update job status to failed
    await supabase
      .from('acquisition_jobs')
      .update({ 
        status: 'failed',
        error_log: [error.message]
      })
      .eq('id', job.id);

    throw error;
  }
}

async function processJobInBackground(supabase: any, jobId: string) {
  console.log('Starting background processing for job:', jobId);
  
  const harvesterUrl = `${Deno.env.get('SUPABASE_URL')}/functions/v1/fact-harvester`;
  const batchSize = 10;
  const maxRetries = 3;
  let retryCount = 0;

  while (retryCount < maxRetries) {
    try {
      // Get job status
      const statusResponse = await fetch(harvesterUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${Deno.env.get('SUPABASE_ANON_KEY')}`
        },
        body: JSON.stringify({
          action: 'get_status',
          jobId: jobId
        })
      });

      const statusData = await statusResponse.json();
      
      if (statusData.status === 'completed' || statusData.status === 'failed') {
        console.log('Job completed with status:', statusData.status);
        break;
      }

      // Process a batch
      const batchResponse = await fetch(harvesterUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${Deno.env.get('SUPABASE_ANON_KEY')}`
        },
        body: JSON.stringify({
          action: 'process_batch',
          jobId: jobId,
          batchSize: batchSize
        })
      });

      const batchData = await batchResponse.json();
      
      if (batchData.processed === 0) {
        // No more items to process, mark job as completed
        await supabase
          .from('acquisition_jobs')
          .update({ 
            status: 'completed',
            completed_at: new Date().toISOString()
          })
          .eq('id', jobId);
        break;
      }

      console.log(`Processed batch for job ${jobId}: ${batchData.processed} items`);
      
      // Wait between batches to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      retryCount = 0; // Reset retry count on success
      
    } catch (error) {
      console.error(`Background processing error (attempt ${retryCount + 1}):`, error);
      retryCount++;
      
      if (retryCount >= maxRetries) {
        // Mark job as failed
        await supabase
          .from('acquisition_jobs')
          .update({ 
            status: 'failed',
            error_log: [`Background processing failed after ${maxRetries} retries: ${error.message}`]
          })
          .eq('id', jobId);
        break;
      }
      
      // Wait before retry
      await new Promise(resolve => setTimeout(resolve, 5000 * retryCount));
    }
  }
  
  console.log('Background processing completed for job:', jobId);
}

async function pauseJob(supabase: any, params: any) {
  const { jobId } = params;

  const { error } = await supabase
    .from('acquisition_jobs')
    .update({ 
      status: 'paused',
      progress_data: { paused_at: new Date().toISOString() }
    })
    .eq('id', jobId);

  if (error) {
    throw new Error(`Failed to pause job: ${error.message}`);
  }

  return new Response(JSON.stringify({ 
    success: true,
    message: 'Job paused successfully'
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

async function resumeJob(supabase: any, params: any) {
  const { jobId } = params;

  const { error } = await supabase
    .from('acquisition_jobs')
    .update({ 
      status: 'running',
      progress_data: { resumed_at: new Date().toISOString() }
    })
    .eq('id', jobId);

  if (error) {
    throw new Error(`Failed to resume job: ${error.message}`);
  }

  // Resume processing in background
  const { data: job } = await supabase
    .from('acquisition_jobs')
    .select('*')
    .eq('id', jobId)
    .single();

  if (job) {
    EdgeRuntime.waitUntil(processJobInBackground(supabase, job.id));
  }

  return new Response(JSON.stringify({ 
    success: true,
    message: 'Job resumed successfully'
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

async function cancelJob(supabase: any, params: any) {
  const { jobId } = params;

  const { error } = await supabase
    .from('acquisition_jobs')
    .update({ 
      status: 'failed',
      progress_data: { cancelled_at: new Date().toISOString() },
      error_log: ['Job cancelled by user']
    })
    .eq('id', jobId);

  if (error) {
    throw new Error(`Failed to cancel job: ${error.message}`);
  }

  return new Response(JSON.stringify({ 
    success: true,
    message: 'Job cancelled successfully'
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

async function getJobs(supabase: any, params: any) {
  const { limit = 50, offset = 0, status } = params;

  let query = supabase
    .from('acquisition_jobs')
    .select(`
      *,
      queue_count:acquisition_queue(count)
    `)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (status) {
    query = query.eq('status', status);
  }

  const { data: jobs, error } = await query;

  if (error) {
    throw new Error(`Failed to get jobs: ${error.message}`);
  }

  return new Response(JSON.stringify({ 
    success: true,
    jobs: jobs || []
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}