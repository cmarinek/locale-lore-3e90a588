import { serve } from 'https://deno.land/std@0.190.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

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

    console.log('Starting leaderboard update...');

    // Calculate and update all leaderboard types
    await Promise.all([
      updateXPLeaderboard(supabase),
      updateSubmissionsLeaderboard(supabase),
      updateReputationLeaderboard(supabase),
      updateStreakLeaderboard(supabase),
    ]);

    console.log('Leaderboard update completed successfully');

    return new Response(
      JSON.stringify({ success: true, message: 'Leaderboards updated successfully' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error updating leaderboards:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function updateXPLeaderboard(supabase: any) {
  console.log('Updating XP leaderboard...');
  
  // Get top users by total XP
  const { data: topUsers, error } = await supabase
    .from('user_levels')
    .select('user_id, total_xp')
    .order('total_xp', { ascending: false })
    .limit(100);

  if (error) throw error;

  // Clear existing XP leaderboard entries
  await supabase
    .from('leaderboards')
    .delete()
    .eq('leaderboard_type', 'total_xp');

  // Insert new leaderboard entries
  const leaderboardEntries = topUsers?.map((user: any, index: number) => ({
    user_id: user.user_id,
    leaderboard_type: 'total_xp',
    score: user.total_xp,
    rank: index + 1,
    period_start: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString(),
    period_end: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toISOString(),
  })) || [];

  if (leaderboardEntries.length > 0) {
    await supabase.from('leaderboards').insert(leaderboardEntries);
  }

  console.log(`Updated XP leaderboard with ${leaderboardEntries.length} entries`);
}

async function updateSubmissionsLeaderboard(supabase: any) {
  console.log('Updating submissions leaderboard...');
  
  const { data: topUsers, error } = await supabase
    .from('user_statistics')
    .select('user_id, facts_submitted')
    .order('facts_submitted', { ascending: false })
    .limit(100);

  if (error) throw error;

  await supabase
    .from('leaderboards')
    .delete()
    .eq('leaderboard_type', 'facts_submitted');

  const leaderboardEntries = topUsers?.map((user: any, index: number) => ({
    user_id: user.user_id,
    leaderboard_type: 'facts_submitted',
    score: user.facts_submitted,
    rank: index + 1,
    period_start: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString(),
    period_end: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toISOString(),
  })) || [];

  if (leaderboardEntries.length > 0) {
    await supabase.from('leaderboards').insert(leaderboardEntries);
  }

  console.log(`Updated submissions leaderboard with ${leaderboardEntries.length} entries`);
}

async function updateReputationLeaderboard(supabase: any) {
  console.log('Updating reputation leaderboard...');
  
  const { data: topUsers, error } = await supabase
    .from('profiles')
    .select('id, reputation_score')
    .order('reputation_score', { ascending: false })
    .limit(100);

  if (error) throw error;

  await supabase
    .from('leaderboards')
    .delete()
    .eq('leaderboard_type', 'reputation');

  const leaderboardEntries = topUsers?.map((user: any, index: number) => ({
    user_id: user.id,
    leaderboard_type: 'reputation',
    score: user.reputation_score,
    rank: index + 1,
    period_start: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString(),
    period_end: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toISOString(),
  })) || [];

  if (leaderboardEntries.length > 0) {
    await supabase.from('leaderboards').insert(leaderboardEntries);
  }

  console.log(`Updated reputation leaderboard with ${leaderboardEntries.length} entries`);
}

async function updateStreakLeaderboard(supabase: any) {
  console.log('Updating streak leaderboard...');
  
  const { data: topUsers, error } = await supabase
    .from('user_statistics')
    .select('user_id, current_streak')
    .order('current_streak', { ascending: false })
    .limit(100);

  if (error) throw error;

  await supabase
    .from('leaderboards')
    .delete()
    .eq('leaderboard_type', 'streak');

  const leaderboardEntries = topUsers?.map((user: any, index: number) => ({
    user_id: user.user_id,
    leaderboard_type: 'streak',
    score: user.current_streak,
    rank: index + 1,
    period_start: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString(),
    period_end: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toISOString(),
  })) || [];

  if (leaderboardEntries.length > 0) {
    await supabase.from('leaderboards').insert(leaderboardEntries);
  }

  console.log(`Updated streak leaderboard with ${leaderboardEntries.length} entries`);
}
