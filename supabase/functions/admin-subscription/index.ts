
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
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
    // Verify admin access
    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data: userData } = await supabaseClient.auth.getUser(token);
    const user = userData.user;
    if (!user) throw new Error("User not authenticated");

    // Check if user is admin
    const { data: userRoles } = await supabaseClient
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id);

    const isAdmin = userRoles?.some(r => r.role === 'admin');
    if (!isAdmin) throw new Error("Unauthorized: Admin access required");

    const { subscriptionId, action, newTier } = await req.json();

    // Get subscription details
    const { data: subscription } = await supabaseClient
      .from('subscriptions')
      .select('*')
      .eq('id', subscriptionId)
      .single();

    if (!subscription) throw new Error("Subscription not found");

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2023-10-16",
    });

    let result;

    switch (action) {
      case 'cancel':
        result = await stripe.subscriptions.update(subscription.stripe_subscription_id, {
          cancel_at_period_end: true,
        });
        
        await supabaseClient
          .from('subscriptions')
          .update({ cancel_at_period_end: true })
          .eq('id', subscriptionId);
        break;

      case 'reactivate':
        result = await stripe.subscriptions.update(subscription.stripe_subscription_id, {
          cancel_at_period_end: false,
        });
        
        await supabaseClient
          .from('subscriptions')
          .update({ cancel_at_period_end: false })
          .eq('id', subscriptionId);
        break;

      case 'upgrade':
      case 'downgrade':
        const priceMap = {
          basic: Deno.env.get("STRIPE_BASIC_PRICE_ID"),
          premium: Deno.env.get("STRIPE_PREMIUM_PRICE_ID"),
          pro: Deno.env.get("STRIPE_PRO_PRICE_ID"),
        };

        const newPriceId = priceMap[newTier as keyof typeof priceMap];
        if (!newPriceId) throw new Error("Invalid tier");

        const stripeSubscription = await stripe.subscriptions.retrieve(subscription.stripe_subscription_id);
        
        result = await stripe.subscriptions.update(subscription.stripe_subscription_id, {
          items: [{
            id: stripeSubscription.items.data[0].id,
            price: newPriceId,
          }],
          proration_behavior: 'create_prorations',
        });

        await supabaseClient
          .from('subscriptions')
          .update({ tier: newTier })
          .eq('id', subscriptionId);
        break;

      default:
        throw new Error("Invalid action");
    }

    // Log admin action
    await supabaseClient
      .from('user_activity_log')
      .insert({
        user_id: user.id,
        activity_type: 'admin_subscription_action',
        activity_data: {
          subscription_id: subscriptionId,
          action,
          new_tier: newTier
        }
      });

    return new Response(JSON.stringify({ 
      success: true, 
      action,
      subscription: result 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Admin subscription action error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
