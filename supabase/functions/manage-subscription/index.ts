
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
    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data } = await supabaseClient.auth.getUser(token);
    const user = data.user;
    if (!user?.email) throw new Error("User not authenticated");

    const { action, tier, paymentMethodId } = await req.json();
    
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2023-10-16",
    });

    // Get user's subscription
    const { data: subscription } = await supabaseClient
      .from('subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single();

    if (!subscription) {
      throw new Error("No active subscription found");
    }

    const stripeSubscription = await stripe.subscriptions.retrieve(subscription.stripe_subscription_id);

    switch (action) {
      case 'upgrade':
      case 'downgrade':
        return await handleTierChange(stripe, stripeSubscription, tier);
      
      case 'cancel':
        return await handleCancellation(stripe, stripeSubscription);
      
      case 'reactivate':
        return await handleReactivation(stripe, stripeSubscription);
      
      case 'update_payment_method':
        return await handlePaymentMethodUpdate(stripe, stripeSubscription.customer as string, paymentMethodId);
      
      case 'create_portal_session':
        return await createPortalSession(stripe, stripeSubscription.customer as string, req);
      
      default:
        throw new Error("Invalid action");
    }
  } catch (error) {
    console.error("Subscription management error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});

async function handleTierChange(stripe: Stripe, subscription: Stripe.Subscription, newTier: string) {
  const priceMap = {
    basic: process.env.STRIPE_BASIC_PRICE_ID,
    premium: process.env.STRIPE_PREMIUM_PRICE_ID,
    pro: process.env.STRIPE_PRO_PRICE_ID,
  };

  const newPriceId = priceMap[newTier as keyof typeof priceMap];
  if (!newPriceId) {
    throw new Error("Invalid tier");
  }

  const updatedSubscription = await stripe.subscriptions.update(subscription.id, {
    items: [{
      id: subscription.items.data[0].id,
      price: newPriceId,
    }],
    proration_behavior: 'create_prorations',
  });

  return new Response(JSON.stringify({ 
    success: true, 
    subscription: updatedSubscription 
  }), {
    headers: { "Content-Type": "application/json" },
  });
}

async function handleCancellation(stripe: Stripe, subscription: Stripe.Subscription) {
  const canceledSubscription = await stripe.subscriptions.update(subscription.id, {
    cancel_at_period_end: true,
  });

  return new Response(JSON.stringify({ 
    success: true, 
    subscription: canceledSubscription 
  }), {
    headers: { "Content-Type": "application/json" },
  });
}

async function handleReactivation(stripe: Stripe, subscription: Stripe.Subscription) {
  const reactivatedSubscription = await stripe.subscriptions.update(subscription.id, {
    cancel_at_period_end: false,
  });

  return new Response(JSON.stringify({ 
    success: true, 
    subscription: reactivatedSubscription 
  }), {
    headers: { "Content-Type": "application/json" },
  });
}

async function handlePaymentMethodUpdate(stripe: Stripe, customerId: string, paymentMethodId: string) {
  await stripe.paymentMethods.attach(paymentMethodId, { customer: customerId });
  
  await stripe.customers.update(customerId, {
    invoice_settings: { default_payment_method: paymentMethodId },
  });

  return new Response(JSON.stringify({ success: true }), {
    headers: { "Content-Type": "application/json" },
  });
}

async function createPortalSession(stripe: Stripe, customerId: string, req: Request) {
  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: `${req.headers.get("origin")}/billing`,
  });

  return new Response(JSON.stringify({ url: session.url }), {
    headers: { "Content-Type": "application/json" },
  });
}
