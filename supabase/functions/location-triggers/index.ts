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

    const { user_id, latitude, longitude, radius = 1000 } = await req.json();

    console.log('Checking location triggers for user:', user_id, 'at', latitude, longitude);

    if (!latitude || !longitude) {
      throw new Error('Location coordinates required');
    }

    // Get nearby location triggers
    const { data: nearbyTriggers, error } = await supabase
      .rpc('get_nearby_triggers', {
        user_lat: latitude,
        user_lng: longitude,
        max_distance: radius
      });

    if (error) {
      console.error('Error fetching nearby triggers:', error);
      throw error;
    }

    if (!nearbyTriggers || nearbyTriggers.length === 0) {
      console.log('No nearby triggers found');
      return new Response(JSON.stringify({
        triggers: [],
        notifications_sent: 0
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Found nearby triggers:', nearbyTriggers.length);

    // Check user's notification history to avoid spam
    const { data: recentNotifications } = await supabase
      .from('user_notifications')
      .select('data')
      .eq('user_id', user_id)
      .eq('notification_type', 'location_trigger')
      .gte('delivered_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()); // Last 24 hours

    const recentTriggerIds = recentNotifications?.map(n => n.data?.trigger_id).filter(Boolean) || [];

    // Filter out recently triggered notifications
    const newTriggers = nearbyTriggers.filter(trigger => 
      !recentTriggerIds.includes(trigger.trigger_id) &&
      trigger.distance_meters <= 500 // Only very close triggers
    );

    if (newTriggers.length === 0) {
      console.log('No new triggers to send');
      return new Response(JSON.stringify({
        triggers: nearbyTriggers,
        notifications_sent: 0,
        reason: 'All triggers recently sent or too far'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get user preferences
    const { data: userPrefs } = await supabase
      .from('user_preferences')
      .select('notification_preferences')
      .eq('user_id', user_id)
      .single();

    if (userPrefs?.notification_preferences?.enabled === false) {
      console.log('User has notifications disabled');
      return new Response(JSON.stringify({
        triggers: nearbyTriggers,
        notifications_sent: 0,
        reason: 'User notifications disabled'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Send notifications for new triggers (limit to 1 per request to avoid spam)
    const triggerToNotify = newTriggers[0];
    const distanceText = triggerToNotify.distance_meters < 100 
      ? 'right here' 
      : `${Math.round(triggerToNotify.distance_meters)}m away`;

    const notification = {
      user_id,
      notification_type: 'location_trigger',
      title: `🏛️ ${triggerToNotify.title}`,
      body: `${triggerToNotify.body} (${distanceText})`,
      data: {
        trigger_id: triggerToNotify.trigger_id,
        fact_id: triggerToNotify.fact_id,
        distance: triggerToNotify.distance_meters,
        location: { latitude, longitude }
      }
    };

    const { error: notificationError } = await supabase
      .from('user_notifications')
      .insert(notification);

    if (notificationError) {
      console.error('Error creating notification:', notificationError);
      throw notificationError;
    }

    // Update user's last location
    await supabase
      .from('user_preferences')
      .upsert({
        user_id,
        last_location: `POINT(${longitude} ${latitude})`
      });

    console.log('Location trigger notification sent successfully');

    return new Response(JSON.stringify({
      triggers: nearbyTriggers,
      notifications_sent: 1,
      sent_notification: {
        title: notification.title,
        body: notification.body,
        distance: triggerToNotify.distance_meters
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in location-triggers function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      details: 'Failed to process location triggers'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});