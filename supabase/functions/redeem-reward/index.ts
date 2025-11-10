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

    // Get user from auth header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      throw new Error('Unauthorized');
    }

    const { rewardId } = await req.json();

    if (!rewardId) {
      throw new Error('Reward ID is required');
    }

    console.log(`Processing reward redemption for user ${user.id}, reward ${rewardId}`);

    // 1. Get reward details
    const { data: reward, error: rewardError } = await supabase
      .from('rewards_catalog')
      .select('*')
      .eq('id', rewardId)
      .eq('is_active', true)
      .single();

    if (rewardError || !reward) {
      throw new Error('Reward not found or inactive');
    }

    // 2. Check if user already redeemed (for one-time rewards)
    if (reward.is_one_time) {
      const { data: existingRedemption } = await supabase
        .from('user_rewards')
        .select('id')
        .eq('user_id', user.id)
        .eq('reward_id', rewardId)
        .single();

      if (existingRedemption) {
        throw new Error('Reward already redeemed');
      }
    }

    // 3. Get user's current points
    const { data: userLevel, error: levelError } = await supabase
      .from('user_levels')
      .select('total_xp, available_points')
      .eq('user_id', user.id)
      .single();

    if (levelError || !userLevel) {
      throw new Error('User level not found');
    }

    const currentPoints = userLevel.available_points ?? userLevel.total_xp ?? 0;

    // 4. Check if user has enough points
    if (currentPoints < reward.cost_points) {
      throw new Error(`Insufficient points. Required: ${reward.cost_points}, Available: ${currentPoints}`);
    }

    // 5. Deduct points from user_levels
    const newPoints = currentPoints - reward.cost_points;
    const { error: updateError } = await supabase
      .from('user_levels')
      .update({ available_points: newPoints })
      .eq('user_id', user.id);

    if (updateError) {
      console.error('Error updating user points:', updateError);
      throw new Error('Failed to deduct points');
    }

    // 6. Create user_rewards entry
    const { error: rewardRedemptionError } = await supabase
      .from('user_rewards')
      .insert({
        user_id: user.id,
        reward_id: rewardId,
        points_spent: reward.cost_points,
      });

    if (rewardRedemptionError) {
      // Rollback points deduction
      await supabase
        .from('user_levels')
        .update({ available_points: currentPoints })
        .eq('user_id', user.id);
      
      console.error('Error creating reward redemption:', rewardRedemptionError);
      throw new Error('Failed to redeem reward');
    }

    // 7. Apply reward effect based on type
    if (reward.reward_type === 'title' || reward.reward_type === 'avatar_border') {
      const metadata = reward.metadata || {};
      const updateData: any = {};

      if (reward.reward_type === 'title') {
        updateData.custom_title = metadata.title || reward.name;
      } else if (reward.reward_type === 'avatar_border') {
        updateData.avatar_border = metadata.border_color || '#FFD700';
      }

      await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', user.id);
    }

    // 8. Create notification
    await supabase
      .from('enhanced_notifications')
      .insert({
        user_id: user.id,
        title: 'Reward Redeemed! 🎉',
        body: `You've successfully redeemed ${reward.name}`,
        type: 'reward_redeemed',
        category: 'gamification',
        data: {
          reward_id: rewardId,
          reward_name: reward.name,
          points_spent: reward.cost_points,
        },
      });

    console.log(`Reward redeemed successfully for user ${user.id}`);

    return new Response(
      JSON.stringify({
        success: true,
        reward: reward.name,
        pointsSpent: reward.cost_points,
        remainingPoints: newPoints,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in redeem-reward function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
