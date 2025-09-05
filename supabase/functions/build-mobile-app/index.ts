import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface BuildRequest {
  platform: 'android' | 'ios'
  buildId: string
  appName: string
  bundleId: string
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        auth: {
          persistSession: false,
        },
      }
    )

    const authHeader = req.headers.get('Authorization')!
    const token = authHeader.replace('Bearer ', '')
    const { data: { user } } = await supabase.auth.getUser(token)

    if (!user) {
      return new Response('Unauthorized', { status: 401, headers: corsHeaders })
    }

    // Check if user is admin
    const { data: userRole } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .single()

    if (userRole?.role !== 'admin') {
      return new Response('Forbidden', { status: 403, headers: corsHeaders })
    }

    const { platform, buildId, appName, bundleId }: BuildRequest = await req.json()

    // Log build request
    await supabase
      .from('build_logs')
      .insert({
        build_id: buildId,
        platform,
        status: 'started',
        user_id: user.id,
        app_name: appName,
        bundle_id: bundleId
      })

    // Start background build process
    EdgeRuntime.waitUntil(buildMobileApp(platform, buildId, appName, bundleId, user.id, supabase))

    return new Response(
      JSON.stringify({
        success: true,
        buildId,
        message: `${platform} build started`
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    console.error('Build error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})

async function buildMobileApp(
  platform: 'android' | 'ios',
  buildId: string,
  appName: string,
  bundleId: string,
  userId: string,
  supabase: any
) {
  try {
    // Update status to building
    await supabase
      .from('build_logs')
      .update({ status: 'building' })
      .eq('build_id', buildId)

    // Simulate build process (in production, this would:)
    // 1. Clone the repository
    // 2. Install dependencies
    // 3. Run Capacitor build commands
    // 4. Sign the app with certificates
    // 5. Upload to secure storage
    
    if (platform === 'android') {
      await buildAndroidAPK(buildId, appName, bundleId)
    } else {
      await buildIOSIPA(buildId, appName, bundleId)
    }

    // Update status to completed
    await supabase
      .from('build_logs')
      .update({ 
        status: 'completed',
        download_url: `${Deno.env.get('SUPABASE_URL')}/storage/v1/object/public/builds/${buildId}.${platform === 'android' ? 'apk' : 'ipa'}`,
        completed_at: new Date().toISOString()
      })
      .eq('build_id', buildId)

  } catch (error) {
    console.error('Build failed:', error)
    
    // Update status to failed
    await supabase
      .from('build_logs')
      .update({ 
        status: 'failed',
        error_message: error.message,
        completed_at: new Date().toISOString()
      })
      .eq('build_id', buildId)
  }
}

async function buildAndroidAPK(buildId: string, appName: string, bundleId: string) {
  // Simulate Android build process
  console.log(`Building Android APK for ${appName} (${bundleId})`)
  
  // In production, this would:
  // 1. Run: npx cap add android
  // 2. Run: npx cap build android
  // 3. Sign the APK with keystore
  // 4. Upload to Supabase Storage
  
  // Simulate build time
  await new Promise(resolve => setTimeout(resolve, 12000))
  
  console.log(`Android APK build completed: ${buildId}`)
}

async function buildIOSIPA(buildId: string, appName: string, bundleId: string) {
  // Simulate iOS build process
  console.log(`Building iOS IPA for ${appName} (${bundleId})`)
  
  // In production, this would:
  // 1. Run: npx cap add ios
  // 2. Run: npx cap build ios
  // 3. Archive and export IPA with provisioning profile
  // 4. Upload to Supabase Storage
  
  // Note: iOS builds require macOS environment and Apple Developer certificates
  
  // Simulate build time
  await new Promise(resolve => setTimeout(resolve, 15000))
  
  console.log(`iOS IPA build completed: ${buildId}`)
}