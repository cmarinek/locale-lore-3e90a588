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

    // Create build log entry
    const { error: insertError } = await supabase
      .from('build_logs')
      .insert({
        build_id: buildId,
        platform,
        status: 'pending',
        user_id: user.id,
        app_name: appName,
        bundle_id: bundleId,
        progress: 0
      })

    if (insertError) {
      throw new Error(`Failed to create build log: ${insertError.message}`)
    }

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
      .update({ 
        status: 'building',
        started_at: new Date().toISOString(),
        progress: 5
      })
      .eq('build_id', buildId)

    console.log(`Starting ${platform} build for ${appName} (${bundleId})`)

    // Simulate real build process with progress updates
    const progressSteps = [10, 25, 40, 55, 70, 85, 95]
    for (const progress of progressSteps) {
      await new Promise(resolve => setTimeout(resolve, 2000)) // 2 second intervals
      
      // Check if build was cancelled
      const { data: buildCheck } = await supabase
        .from('build_logs')
        .select('status')
        .eq('build_id', buildId)
        .single()
      
      if (buildCheck?.status === 'cancelled') {
        console.log(`Build ${buildId} was cancelled`)
        return
      }
      
      await supabase
        .from('build_logs')
        .update({ progress })
        .eq('build_id', buildId)
    }

    // Simulate actual build process
    if (platform === 'android') {
      await buildAndroidAPK(buildId, appName, bundleId, supabase)
    } else {
      await buildIOSIPA(buildId, appName, bundleId, supabase)
    }

    // Create dummy build file for demonstration
    const fileName = `${buildId}.${platform === 'android' ? 'apk' : 'ipa'}`
    const dummyContent = new TextEncoder().encode(`Dummy ${platform} build file for ${appName}`)
    
    // Upload to storage
    const { error: uploadError } = await supabase.storage
      .from('builds')
      .upload(fileName, dummyContent, {
        contentType: platform === 'android' ? 'application/vnd.android.package-archive' : 'application/octet-stream'
      })

    if (uploadError) {
      throw new Error(`Failed to upload build: ${uploadError.message}`)
    }

    // Update status to completed
    await supabase
      .from('build_logs')
      .update({ 
        status: 'completed',
        download_url: `${Deno.env.get('SUPABASE_URL')}/storage/v1/object/public/builds/${fileName}`,
        completed_at: new Date().toISOString(),
        progress: 100
      })
      .eq('build_id', buildId)

    console.log(`Build ${buildId} completed successfully`)

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

async function buildAndroidAPK(buildId: string, appName: string, bundleId: string, supabase: any) {
  console.log(`Building Android APK for ${appName} (${bundleId})`)
  
  // In a real implementation, this would:
  // 1. Clone the repository from GitHub
  // 2. Install dependencies: npm install
  // 3. Build web assets: npm run build
  // 4. Add Android platform: npx cap add android
  // 5. Sync Capacitor: npx cap sync android
  // 6. Build APK: cd android && ./gradlew assembleRelease
  // 7. Sign the APK with keystore
  // 8. Optimize and align the APK
  
  // Simulate build steps with database updates
  const steps = [
    'Cloning repository...',
    'Installing dependencies...',
    'Building web assets...',
    'Adding Android platform...',
    'Syncing Capacitor...',
    'Building APK...',
    'Signing APK...',
    'Finalizing build...'
  ]

  for (let i = 0; i < steps.length; i++) {
    console.log(steps[i])
    await new Promise(resolve => setTimeout(resolve, 1000))
  }
  
  console.log(`Android APK build completed: ${buildId}`)
}

async function buildIOSIPA(buildId: string, appName: string, bundleId: string, supabase: any) {
  console.log(`Building iOS IPA for ${appName} (${bundleId})`)
  
  // In a real implementation, this would:
  // 1. Clone the repository from GitHub
  // 2. Install dependencies: npm install
  // 3. Build web assets: npm run build
  // 4. Add iOS platform: npx cap add ios
  // 5. Sync Capacitor: npx cap sync ios
  // 6. Build with Xcode: xcodebuild archive
  // 7. Export IPA with provisioning profile
  // 8. Code sign with Apple certificates
  
  // Note: iOS builds require macOS environment and Apple Developer certificates
  
  const steps = [
    'Cloning repository...',
    'Installing dependencies...',
    'Building web assets...',
    'Adding iOS platform...',
    'Syncing Capacitor...',
    'Building with Xcode...',
    'Code signing...',
    'Exporting IPA...',
    'Finalizing build...'
  ]

  for (let i = 0; i < steps.length; i++) {
    console.log(steps[i])
    await new Promise(resolve => setTimeout(resolve, 1200))
  }
  
  console.log(`iOS IPA build completed: ${buildId}`)
}