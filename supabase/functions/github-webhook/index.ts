import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface WebhookPayload {
  action: 'in_progress' | 'completed' | 'failed'
  build_id: string
  platform: 'android' | 'ios'
  progress?: number
  download_url?: string
  error_message?: string
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const payload: WebhookPayload = await req.json()
    console.log('GitHub webhook payload:', payload)

    const { build_id, action, platform, progress, download_url, error_message } = payload

    // Update build status in database
    const updateData: any = {
      platform,
      updated_at: new Date().toISOString(),
    }

    switch (action) {
      case 'in_progress':
        updateData.status = 'building'
        updateData.progress = progress || 0
        if (!updateData.started_at) {
          updateData.started_at = new Date().toISOString()
        }
        break

      case 'completed':
        updateData.status = 'completed'
        updateData.progress = 100
        updateData.completed_at = new Date().toISOString()
        updateData.download_url = download_url
        break

      case 'failed':
        updateData.status = 'failed'
        updateData.error_message = error_message
        updateData.completed_at = new Date().toISOString()
        break
    }

    const { data, error } = await supabase
      .from('build_logs')
      .update(updateData)
      .eq('build_id', build_id)
      .select()

    if (error) {
      console.error('Error updating build status:', error)
      return new Response(
        JSON.stringify({ error: 'Failed to update build status' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log('Build status updated:', data)

    return new Response(
      JSON.stringify({ success: true, data }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Webhook error:', error)
    return new Response(
      JSON.stringify({ error: 'Webhook processing failed' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})