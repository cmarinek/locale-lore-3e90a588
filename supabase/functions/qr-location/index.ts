import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Generate a short, unique code for QR sharing
function generateShortCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let result = ''
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    if (req.method === 'POST') {
      // Create a new QR code for location sharing
      const { location_name, latitude, longitude, created_by } = await req.json()

      if (!location_name || !latitude || !longitude) {
        throw new Error('Missing required location data')
      }

      // Generate unique code
      let code = generateShortCode()
      let attempts = 0
      while (attempts < 10) {
        const { data: existing } = await supabaseClient
          .from('location_qr_codes')
          .select('id')
          .eq('code', code)
          .single()

        if (!existing) break
        code = generateShortCode()
        attempts++
      }

      if (attempts >= 10) {
        throw new Error('Failed to generate unique code')
      }

      const { data, error } = await supabaseClient
        .from('location_qr_codes')
        .insert({
          code,
          location_name,
          latitude,
          longitude,
          created_by
        })
        .select()
        .single()

      if (error) throw error

      // Generate QR code URL (this would typically be a QR code service)
      const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(`https://app.yoursite.com/location/${code}`)}`

      return new Response(JSON.stringify({
        ...data,
        qr_url: qrUrl,
        share_url: `https://app.yoursite.com/location/${code}`
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })

    } else if (req.method === 'GET') {
      // Get location by QR code
      const url = new URL(req.url)
      const code = url.searchParams.get('code')

      if (!code) {
        throw new Error('QR code required')
      }

      // Increment scan count
      const { data, error } = await supabaseClient
        .from('location_qr_codes')
        .select('*')
        .eq('code', code.toUpperCase())
        .gt('expires_at', new Date().toISOString())
        .single()

      if (error || !data) {
        return new Response(JSON.stringify({ 
          error: 'QR code not found or expired' 
        }), {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      // Update scan count
      await supabaseClient
        .from('location_qr_codes')
        .update({ scan_count: data.scan_count + 1 })
        .eq('id', data.id)

      // Get facts near this location
      const { data: nearbyFacts } = await supabaseClient
        .from('facts')
        .select(`
          *,
          profiles!facts_author_id_fkey(username, avatar_url),
          categories!facts_category_id_fkey(slug, icon, color)
        `)
        .eq('status', 'verified')
        .lte('ST_DWithin(ST_Point(longitude, latitude), ST_Point(' + data.longitude + ', ' + data.latitude + '), 1000)', true)
        .order('vote_count_up', { ascending: false })
        .limit(10)

      return new Response(JSON.stringify({
        location: data,
        nearby_facts: nearbyFacts || []
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

  } catch (error) {
    console.error('QR location error:', error)
    return new Response(JSON.stringify({ 
      error: 'Request failed', 
      details: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})