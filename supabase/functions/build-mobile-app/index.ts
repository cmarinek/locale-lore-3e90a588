import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface BuildRequest {
  platform: 'android' | 'ios'
  app_name: string
  bundle_id: string
  build_config?: any
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!
    const githubToken = Deno.env.get('GITHUB_TOKEN')!
    const githubRepo = Deno.env.get('GITHUB_REPO')! // Format: "owner/repo"
    
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: { persistSession: false }
    })

    // Get the authorization header
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'No authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Set the auth token for this request
    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Authentication failed' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Check if user has admin role
    const { data: userRole, error: roleError } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .single()

    if (roleError || userRole?.role !== 'admin') {
      return new Response(
        JSON.stringify({ error: 'Admin access required' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const buildRequest: BuildRequest = await req.json()
    console.log('Build request:', buildRequest)

    // Create initial build log entry
    const buildId = crypto.randomUUID()
    const { data: buildLog, error: insertError } = await supabase
      .from('build_logs')
      .insert({
        build_id: buildId,
        user_id: user.id,
        platform: buildRequest.platform,
        app_name: buildRequest.app_name,
        bundle_id: buildRequest.bundle_id,
        build_config: buildRequest.build_config || {},
        status: 'pending',
        progress: 0
      })
      .select()
      .single()

    if (insertError) {
      console.error('Error creating build log:', insertError)
      return new Response(
        JSON.stringify({ error: 'Failed to create build log' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Trigger GitHub Actions workflow
    const workflowType = buildRequest.platform === 'android' ? 'build-android' : 'build-ios'
    
    const githubResponse = await fetch(`https://api.github.com/repos/${githubRepo}/dispatches`, {
      method: 'POST',
      headers: {
        'Authorization': `token ${githubToken}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        event_type: workflowType,
        client_payload: {
          build_id: buildId,
          platform: buildRequest.platform,
          app_name: buildRequest.app_name,
          bundle_id: buildRequest.bundle_id,
          build_config: buildRequest.build_config || {}
        }
      })
    })

    if (!githubResponse.ok) {
      console.error('GitHub Actions trigger failed:', await githubResponse.text())
      
      // Update build status to failed
      await supabase
        .from('build_logs')
        .update({
          status: 'failed',
          error_message: 'Failed to trigger GitHub Actions workflow',
          completed_at: new Date().toISOString()
        })
        .eq('build_id', buildId)

      return new Response(
        JSON.stringify({ error: 'Failed to trigger build workflow' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log(`GitHub Actions workflow triggered for ${buildRequest.platform} build`)

    return new Response(
      JSON.stringify({ 
        success: true, 
        build_id: buildId,
        message: `${buildRequest.platform} build triggered via GitHub Actions`
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Build error:', error)
    return new Response(
      JSON.stringify({ error: 'Build initiation failed' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})