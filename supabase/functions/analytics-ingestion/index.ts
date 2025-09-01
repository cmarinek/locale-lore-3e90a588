
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AnalyticsEvent {
  type: string;
  action: string;
  properties: Record<string, any>;
  timestamp: string;
  sessionId: string;
  userId?: string;
  url?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { events, sessionId } = await req.json();

    // Validate and process events
    const processedEvents = events.map((event: AnalyticsEvent) => ({
      ...event,
      processed_at: new Date().toISOString(),
      ip_hash: hashIP(req.headers.get('x-forwarded-for') || 'unknown'),
      user_agent_hash: hashUserAgent(req.headers.get('user-agent') || ''),
    }));

    // Store events in analytics tables
    for (const event of processedEvents) {
      await processEvent(supabase, event);
    }

    // Update real-time metrics
    await updateRealTimeMetrics(supabase, sessionId, processedEvents);

    return new Response(
      JSON.stringify({ success: true, processed: processedEvents.length }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Analytics ingestion error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to process analytics events' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function processEvent(supabase: any, event: AnalyticsEvent) {
  const baseData = {
    event_type: event.type,
    event_action: event.action,
    properties: event.properties,
    timestamp: event.timestamp,
    session_id: event.sessionId,
    user_id: event.userId,
    url: event.url,
    processed_at: event.processed_at,
    ip_hash: event.ip_hash,
    user_agent_hash: event.user_agent_hash,
  };

  // Store in main analytics table
  await supabase.from('analytics_events').insert(baseData);

  // Process specific event types
  switch (event.type) {
    case 'engagement':
      await processEngagementEvent(supabase, event);
      break;
    case 'content_performance':
      await processContentEvent(supabase, event);
      break;
    case 'geographic':
      await processGeographicEvent(supabase, event);
      break;
    case 'ab_test':
      await processABTestEvent(supabase, event);
      break;
    case 'revenue':
      await processRevenueEvent(supabase, event);
      break;
    case 'retention':
      await processRetentionEvent(supabase, event);
      break;
  }
}

async function processEngagementEvent(supabase: any, event: AnalyticsEvent) {
  const { data: existing } = await supabase
    .from('engagement_metrics')
    .select('*')
    .eq('session_id', event.sessionId)
    .eq('date', new Date(event.timestamp).toISOString().split('T')[0])
    .single();

  if (existing) {
    // Update existing session metrics
    await supabase
      .from('engagement_metrics')
      .update({
        page_views: existing.page_views + 1,
        last_activity: event.timestamp,
        actions: [...(existing.actions || []), event.properties],
      })
      .eq('id', existing.id);
  } else {
    // Create new session metrics
    await supabase.from('engagement_metrics').insert({
      session_id: event.sessionId,
      user_id: event.userId,
      date: new Date(event.timestamp).toISOString().split('T')[0],
      page_views: 1,
      first_activity: event.timestamp,
      last_activity: event.timestamp,
      actions: [event.properties],
    });
  }
}

async function processContentEvent(supabase: any, event: AnalyticsEvent) {
  const contentId = event.properties.contentId;
  const date = new Date(event.timestamp).toISOString().split('T')[0];

  await supabase.from('content_performance').upsert({
    content_id: contentId,
    date,
    views: 1,
    total_dwell_time: event.properties.dwellTime || 0,
    interactions: event.properties.interactions || 0,
    scroll_depth: event.properties.scrollDepth || 0,
  });
}

async function processGeographicEvent(supabase: any, event: AnalyticsEvent) {
  await supabase.from('geographic_analytics').insert({
    session_id: event.sessionId,
    user_id: event.userId,
    latitude: event.properties.latitude,
    longitude: event.properties.longitude,
    region: event.properties.region,
    country: event.properties.country,
    timestamp: event.timestamp,
  });
}

async function processABTestEvent(supabase: any, event: AnalyticsEvent) {
  await supabase.from('ab_test_events').insert({
    test_name: event.properties.testName,
    variant: event.properties.variant,
    user_id: event.userId,
    session_id: event.sessionId,
    converted: event.properties.converted,
    timestamp: event.timestamp,
  });

  // Update test statistics
  const { data: testStats } = await supabase
    .from('ab_test_statistics')
    .select('*')
    .eq('test_name', event.properties.testName)
    .eq('variant', event.properties.variant)
    .single();

  if (testStats) {
    const exposures = event.properties.converted ? testStats.exposures : testStats.exposures + 1;
    const conversions = event.properties.converted ? testStats.conversions + 1 : testStats.conversions;

    await supabase
      .from('ab_test_statistics')
      .update({
        exposures,
        conversions,
        conversion_rate: conversions / exposures,
        updated_at: new Date().toISOString(),
      })
      .eq('id', testStats.id);
  } else {
    await supabase.from('ab_test_statistics').insert({
      test_name: event.properties.testName,
      variant: event.properties.variant,
      exposures: 1,
      conversions: event.properties.converted ? 1 : 0,
      conversion_rate: event.properties.converted ? 1 : 0,
    });
  }
}

async function processRevenueEvent(supabase: any, event: AnalyticsEvent) {
  await supabase.from('revenue_events').insert({
    user_id: event.userId,
    amount: event.properties.amount,
    currency: event.properties.currency,
    revenue_type: event.action,
    properties: event.properties,
    timestamp: event.timestamp,
  });

  // Update daily revenue aggregates
  const date = new Date(event.timestamp).toISOString().split('T')[0];
  await supabase.from('daily_revenue').upsert({
    date,
    total_revenue: event.properties.amount,
    transaction_count: 1,
  });
}

async function processRetentionEvent(supabase: any, event: AnalyticsEvent) {
  await supabase.from('retention_events').insert({
    user_id: event.userId,
    cohort: event.properties.cohort,
    milestone: event.action,
    days_active: event.properties.daysActive,
    timestamp: event.timestamp,
  });
}

async function updateRealTimeMetrics(supabase: any, sessionId: string, events: any[]) {
  const now = new Date();
  const today = now.toISOString().split('T')[0];

  // Update real-time dashboard metrics
  await supabase.from('realtime_metrics').upsert({
    date: today,
    active_sessions: 1,
    events_processed: events.length,
    last_updated: now.toISOString(),
  });
}

function hashIP(ip: string): string {
  // Simple hash function for IP anonymization
  let hash = 0;
  for (let i = 0; i < ip.length; i++) {
    const char = ip.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash).toString(36);
}

function hashUserAgent(userAgent: string): string {
  // Extract browser and OS info without fingerprinting
  const browser = userAgent.includes('Chrome') ? 'Chrome' :
                 userAgent.includes('Firefox') ? 'Firefox' :
                 userAgent.includes('Safari') ? 'Safari' : 'Other';
                 
  const os = userAgent.includes('Windows') ? 'Windows' :
             userAgent.includes('Mac') ? 'macOS' :
             userAgent.includes('Linux') ? 'Linux' :
             userAgent.includes('Android') ? 'Android' :
             userAgent.includes('iOS') ? 'iOS' : 'Other';
             
  return `${browser}-${os}`;
}
