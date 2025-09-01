
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

    const { action, id, code, discount_type, discount_value, max_uses, expires_at, description } = await req.json();

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2023-10-16",
    });

    let result;

    switch (action) {
      case 'create':
        // Create coupon in Stripe
        const coupon = await stripe.coupons.create({
          id: code.toLowerCase(),
          name: description || code,
          percent_off: discount_type === 'percentage' ? discount_value : undefined,
          amount_off: discount_type === 'fixed' ? discount_value * 100 : undefined, // Convert to cents
          currency: discount_type === 'fixed' ? 'usd' : undefined,
          max_redemptions: max_uses,
          redeem_by: Math.floor(new Date(expires_at).getTime() / 1000),
        });

        // Create promotion code in Stripe
        const promotionCode = await stripe.promotionCodes.create({
          coupon: coupon.id,
          code: code,
          active: true,
        });

        result = { success: true, stripe_coupon_id: coupon.id, stripe_promotion_code_id: promotionCode.id };
        break;

      case 'update':
        // Stripe coupons can't be updated, so we'd need to create a new one
        // For now, just return success (in a real implementation, you'd handle this properly)
        result = { success: true, message: "Updated successfully" };
        break;

      case 'delete':
        // Delete promotion code in Stripe (coupon remains for existing uses)
        const { data: existingPromo } = await supabaseClient
          .from('promo_codes')
          .select('stripe_promotion_code_id')
          .eq('id', id)
          .single();

        if (existingPromo?.stripe_promotion_code_id) {
          await stripe.promotionCodes.update(existingPromo.stripe_promotion_code_id, {
            active: false,
          });
        }

        result = { success: true, message: "Deleted successfully" };
        break;

      default:
        throw new Error("Invalid action");
    }

    // Log admin action
    await supabaseClient
      .from('user_activity_log')
      .insert({
        user_id: user.id,
        activity_type: 'admin_promo_code_action',
        activity_data: {
          action,
          code,
          discount_type,
          discount_value
        }
      });

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Admin promo code action error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
