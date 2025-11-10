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
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) throw new Error('No authorization header');

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) throw new Error('Unauthorized');

    const { friendshipId, accept } = await req.json();

    if (!friendshipId || accept === undefined) {
      throw new Error('Friendship ID and accept status required');
    }

    console.log(`User ${user.id} responding to request ${friendshipId}: ${accept ? 'accept' : 'reject'}`);

    // Get the friendship request
    const { data: friendship, error: fetchError } = await supabase
      .from('friendships')
      .select('*')
      .eq('id', friendshipId)
      .eq('friend_id', user.id)
      .eq('status', 'pending')
      .single();

    if (fetchError || !friendship) {
      throw new Error('Friend request not found or already responded to');
    }

    if (accept) {
      // Accept: Update status to 'accepted' and create reverse relationship
      const { error: updateError } = await supabase
        .from('friendships')
        .update({ 
          status: 'accepted',
          responded_at: new Date().toISOString()
        })
        .eq('id', friendshipId);

      if (updateError) throw updateError;

      // Create reverse friendship for bidirectional relationship
      const { error: reverseError } = await supabase
        .from('friendships')
        .insert({
          user_id: user.id,
          friend_id: friendship.user_id,
          status: 'accepted',
          requested_at: new Date().toISOString(),
          responded_at: new Date().toISOString(),
        });

      if (reverseError) {
        console.error('Error creating reverse friendship:', reverseError);
      }

      console.log('Friend request accepted');
    } else {
      // Reject: Update status to 'rejected'
      const { error: updateError } = await supabase
        .from('friendships')
        .update({ 
          status: 'rejected',
          responded_at: new Date().toISOString()
        })
        .eq('id', friendshipId);

      if (updateError) throw updateError;

      console.log('Friend request rejected');
    }

    return new Response(
      JSON.stringify({ success: true }),
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
