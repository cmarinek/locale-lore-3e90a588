import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    const user = userData.user;
    if (!user) throw new Error("User not authenticated");

    const { factId, isUpvote } = await req.json();

    // Check rate limiting
    const rateLimitResult = await checkRateLimit(supabaseClient, user.id, 'vote');
    if (!rateLimitResult.allowed) {
      return new Response(JSON.stringify({ 
        error: "Rate limit exceeded. Please slow down.",
        retryAfter: rateLimitResult.retryAfter 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 429,
      });
    }

    // Process the vote
    const { data: existingVote } = await supabaseClient
      .from('votes')
      .select('*')
      .eq('fact_id', factId)
      .eq('user_id', user.id)
      .single();

    let voteAction = 'created';
    
    if (existingVote) {
      if (existingVote.is_upvote === isUpvote) {
        // Same vote - remove it
        await supabaseClient
          .from('votes')
          .delete()
          .eq('id', existingVote.id);
        voteAction = 'removed';
      } else {
        // Different vote - update it
        await supabaseClient
          .from('votes')
          .update({ is_upvote: isUpvote })
          .eq('id', existingVote.id);
        voteAction = 'updated';
      }
    } else {
      // New vote
      await supabaseClient
        .from('votes')
        .insert({
          fact_id: factId,
          user_id: user.id,
          is_upvote: isUpvote
        });
    }

    // Update vote counts on the fact
    await updateFactVoteCounts(supabaseClient, factId);
    
    // Update user reputation
    await updateUserReputation(supabaseClient, user.id, 'vote_cast');
    
    // Check for achievements
    await checkAchievements(supabaseClient, user.id);

    return new Response(JSON.stringify({ 
      success: true, 
      action: voteAction,
      message: `Vote ${voteAction} successfully`
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});

async function checkRateLimit(supabase: any, userId: string, actionType: string) {
  const now = new Date();
  const windowMinutes = 1; // 1 minute window
  const maxActions = actionType === 'vote' ? 30 : 10; // 30 votes or 10 comments per minute

  const { data: rateLimit } = await supabase
    .from('user_rate_limits')
    .select('*')
    .eq('user_id', userId)
    .eq('action_type', actionType)
    .single();

  if (!rateLimit) {
    // First action, create rate limit record
    await supabase
      .from('user_rate_limits')
      .insert({
        user_id: userId,
        action_type: actionType,
        action_count: 1,
        window_start: now.toISOString(),
        last_action: now.toISOString()
      });
    return { allowed: true };
  }

  const windowStart = new Date(rateLimit.window_start);
  const timeDiff = now.getTime() - windowStart.getTime();
  const isWithinWindow = timeDiff < (windowMinutes * 60 * 1000);

  if (isWithinWindow && rateLimit.action_count >= maxActions) {
    const retryAfter = Math.ceil((windowMinutes * 60 * 1000 - timeDiff) / 1000);
    return { allowed: false, retryAfter };
  }

  if (isWithinWindow) {
    // Update count within window
    await supabase
      .from('user_rate_limits')
      .update({
        action_count: rateLimit.action_count + 1,
        last_action: now.toISOString()
      })
      .eq('id', rateLimit.id);
  } else {
    // Reset window
    await supabase
      .from('user_rate_limits')
      .update({
        action_count: 1,
        window_start: now.toISOString(),
        last_action: now.toISOString()
      })
      .eq('id', rateLimit.id);
  }

  return { allowed: true };
}

async function updateFactVoteCounts(supabase: any, factId: string) {
  const { data: votes } = await supabase
    .from('votes')
    .select('is_upvote')
    .eq('fact_id', factId);

  const upvotes = votes?.filter((v: any) => v.is_upvote).length || 0;
  const downvotes = votes?.filter((v: any) => !v.is_upvote).length || 0;

  await supabase
    .from('facts')
    .update({
      vote_count_up: upvotes,
      vote_count_down: downvotes
    })
    .eq('id', factId);
}

async function updateUserReputation(supabase: any, userId: string, action: string) {
  const { data: reputation } = await supabase
    .from('user_reputation')
    .select('*')
    .eq('user_id', userId)
    .single();

  const updates: any = {
    last_activity_date: new Date().toISOString().split('T')[0],
    updated_at: new Date().toISOString()
  };

  if (action === 'vote_cast') {
    updates.votes_cast = (reputation?.votes_cast || 0) + 1;
    updates.total_score = (reputation?.total_score || 0) + 1;
  }

  if (reputation) {
    await supabase
      .from('user_reputation')
      .update(updates)
      .eq('user_id', userId);
  } else {
    await supabase
      .from('user_reputation')
      .insert({
        user_id: userId,
        ...updates
      });
  }
}

async function checkAchievements(supabase: any, userId: string) {
  const { data: reputation } = await supabase
    .from('user_reputation')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (!reputation) return;

  const { data: userAchievements } = await supabase
    .from('user_achievements')
    .select('achievement_id')
    .eq('user_id', userId);

  const earnedIds = userAchievements?.map((a: any) => a.achievement_id) || [];

  const { data: achievements } = await supabase
    .from('achievements')
    .select('*')
    .not('id', 'in', `(${earnedIds.length > 0 ? earnedIds.join(',') : 'null'})`);

  for (const achievement of achievements || []) {
    let earned = false;

    switch (achievement.slug) {
      case 'first_vote':
        earned = reputation.votes_cast >= 1;
        break;
      case 'veteran_voter':
        earned = reputation.votes_cast >= 100;
        break;
      case 'fact_checker':
        earned = reputation.facts_verified >= 10;
        break;
    }

    if (earned) {
      await supabase
        .from('user_achievements')
        .insert({
          user_id: userId,
          achievement_id: achievement.id
        });
    }
  }
}