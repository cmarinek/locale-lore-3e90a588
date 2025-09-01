
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

    const { paymentId, amount } = await req.json();

    // Get payment details
    const { data: payment } = await supabaseClient
      .from('payments')
      .select('*')
      .eq('id', paymentId)
      .single();

    if (!payment) throw new Error("Payment not found");

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2023-10-16",
    });

    // Create refund in Stripe
    const refund = await stripe.refunds.create({
      payment_intent: payment.stripe_payment_id,
      amount: amount ? amount * 100 : undefined, // Convert to cents or full refund
    });

    // Update payment status in database
    await supabaseClient
      .from('payments')
      .update({ 
        status: amount && amount < payment.amount / 100 ? 'partially_refunded' : 'refunded' 
      })
      .eq('id', paymentId);

    // Log admin action
    await supabaseClient
      .from('user_activity_log')
      .insert({
        user_id: user.id,
        activity_type: 'admin_refund',
        activity_data: {
          payment_id: paymentId,
          refund_amount: refund.amount / 100,
          stripe_refund_id: refund.id
        }
      });

    return new Response(JSON.stringify({ 
      success: true, 
      refund_id: refund.id,
      amount: refund.amount / 100
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Admin refund error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
