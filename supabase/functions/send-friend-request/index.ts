import { serve } from 'https://deno.land/std@0.190.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';
import { checkRateLimit, RATE_LIMITS } from '../_shared/rate-limit.ts';

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
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) throw new Error('No authorization header');

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) throw new Error('Unauthorized');

    // Apply rate limiting - prevent friend request spam
    const rateLimitResult = await checkRateLimit(user.id, RATE_LIMITS.CREATE);
    if (!rateLimitResult.allowed) {
      return new Response(
        JSON.stringify({
          error: 'Too many friend requests. Please wait before sending more.',
          retryAfter: rateLimitResult.retryAfter
        }),
        {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    const { friendId } = await req.json();

    if (!friendId) throw new Error('Friend ID is required');
    if (friendId === user.id) throw new Error('Cannot send friend request to yourself');

    console.log(`User ${user.id} sending friend request to ${friendId}`);

    // Check if already friends or request exists
    const { data: existing } = await supabase
      .from('friendships')
      .select('*')
      .or(`and(user_id.eq.${user.id},friend_id.eq.${friendId}),and(user_id.eq.${friendId},friend_id.eq.${user.id})`)
      .single();

    if (existing) {
      if (existing.status === 'blocked') {
        throw new Error('Cannot send friend request');
      }
      if (existing.status === 'pending') {
        throw new Error('Friend request already sent');
      }
      if (existing.status === 'accepted') {
        throw new Error('Already friends');
      }
    }

    // Create friend request
    const { data: friendship, error } = await supabase
      .from('friendships')
      .insert({
        user_id: user.id,
        friend_id: friendId,
        status: 'pending',
      })
      .select()
      .single();

    if (error) throw error;

    console.log('Friend request created:', friendship.id);

    return new Response(
      JSON.stringify({ success: true, friendship }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
