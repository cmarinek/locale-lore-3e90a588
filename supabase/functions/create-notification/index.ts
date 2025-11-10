import { serve } from 'https://deno.land/std@0.190.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { userId, title, body, type, category, actionUrl, data } = await req.json();

    if (!userId || !title || !body || !type || !category) {
      throw new Error('Missing required fields: userId, title, body, type, category');
    }

    console.log(`Creating notification for user ${userId}: ${title}`);

    // Create notification
    const { data: notification, error } = await supabase
      .from('enhanced_notifications')
      .insert({
        user_id: userId,
        title,
        body,
        type,
        category,
        action_url: actionUrl || null,
        data: data || {},
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating notification:', error);
      throw error;
    }

    console.log('Notification created successfully:', notification.id);

    return new Response(
      JSON.stringify({
        success: true,
        notification,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in create-notification function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
