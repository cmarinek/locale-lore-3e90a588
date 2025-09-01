
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { type, data } = await req.json()
    
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    const userAgent = req.headers.get('user-agent') || ''
    const sessionId = req.headers.get('x-session-id') || crypto.randomUUID()

    switch (type) {
      case 'performance':
        await supabaseClient.from('performance_metrics').insert({
          session_id: sessionId,
          metric_name: data.name,
          metric_value: data.value,
          labels: data.labels || {},
          user_agent: userAgent,
        })
        break

      case 'error':
        await supabaseClient.from('error_logs').insert({
          session_id: sessionId,
          error_message: data.message,
          error_stack: data.stack,
          error_context: data.context || {},
          url: data.url,
          user_agent: userAgent,
        })
        break

      case 'analytics':
        await supabaseClient.from('analytics_events').insert({
          session_id: sessionId,
          event_name: data.name,
          properties: data.properties || {},
          url: data.url,
          referrer: data.referrer,
        })
        break

      default:
        throw new Error('Invalid metric type')
    }

    return new Response(
      JSON.stringify({ success: true }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})
