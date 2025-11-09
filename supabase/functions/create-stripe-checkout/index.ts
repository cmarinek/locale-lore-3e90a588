
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
    if (!user?.email) throw new Error("User not authenticated or email not available");

    const { type = "subscription", trialDays, promoCode } = await req.json();

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2023-10-16",
    });

    // Check if customer exists
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    let customerId;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
    }

    // Single contributor pricing at $1.97/month
    const contributorPlan = { 
      amount: 197, 
      name: "Contributor", 
      features: ["Submit facts", "Comment and interact", "Participate in gamification", "Join the community"] 
    };

    const sessionConfig: any = {
      customer: customerId,
      customer_email: customerId ? undefined : user.email,
      billing_address_collection: 'required',
      tax_id_collection: { enabled: true },
      automatic_tax: { enabled: true },
      customer_update: {
        address: 'auto', // Allow Stripe to save billing address to customer
        shipping: 'auto', // Allow Stripe to save shipping address if collected
      },
      success_url: `${req.headers.get("origin")}/billing/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.get("origin")}/billing/canceled`,
      metadata: {
        user_id: user.id,
        tier: 'contributor',
        type: type,
      },
    };

    if (type === "subscription") {
      sessionConfig.mode = "subscription";
      sessionConfig.line_items = [
        {
          price_data: {
            currency: "usd",
            product_data: { 
              name: contributorPlan.name,
              description: contributorPlan.features.join(", ")
            },
            unit_amount: contributorPlan.amount,
            recurring: { interval: "month" },
          },
          quantity: 1,
        },
      ];

      // Add trial period if specified
      if (trialDays) {
        sessionConfig.subscription_data = {
          trial_period_days: trialDays,
        };
      }

      // Add promo code if provided
      if (promoCode) {
        try {
          const promotionCodes = await stripe.promotionCodes.list({
            code: promoCode,
            active: true,
            limit: 1,
          });
          if (promotionCodes.data.length > 0) {
            sessionConfig.discounts = [{ promotion_code: promotionCodes.data[0].id }];
          }
        } catch (error) {
          console.log("Invalid promo code:", promoCode);
        }
      }
    } else {
      // For one-time payments, still use contributor pricing for now
      sessionConfig.mode = "payment";
      sessionConfig.line_items = [
        {
          price_data: {
            currency: "usd",
            product_data: { 
              name: contributorPlan.name,
              description: "One-time contributor access"
            },
            unit_amount: contributorPlan.amount,
          },
          quantity: 1,
        },
      ];
    }

    const session = await stripe.checkout.sessions.create(sessionConfig);

    // Store session info in database
    await supabaseClient
      .from('payment_sessions')
      .insert({
        user_id: user.id,
        session_id: session.id,
        type: type,
        tier: 'contributor',
        amount: contributorPlan.amount,
        status: 'pending',
      });

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Stripe checkout error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
