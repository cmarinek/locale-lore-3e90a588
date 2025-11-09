
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
  apiVersion: "2023-10-16",
});

const supabaseClient = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
  { auth: { persistSession: false } }
);

serve(async (req) => {
  const signature = req.headers.get("stripe-signature");
  const body = await req.text();
  
  if (!signature) {
    return new Response("No signature", { status: 400 });
  }

  try {
    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      Deno.env.get("STRIPE_WEBHOOK_SECRET") || ""
    );

    console.log(`Received webhook: ${event.type}`);

    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutComplete(event.data.object as Stripe.Checkout.Session);
        break;
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        await handleSubscriptionChange(event.data.object as Stripe.Subscription);
        break;
      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
        break;
      case 'invoice.payment_succeeded':
        await handlePaymentSucceeded(event.data.object as Stripe.Invoice);
        break;
      case 'invoice.payment_failed':
        await handlePaymentFailed(event.data.object as Stripe.Invoice);
        break;
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Webhook error:", error);
    return new Response(`Webhook error: ${error.message}`, { status: 400 });
  }
});

// Helper function to send emails
async function sendEmail(to: string, subject: string, type: string, data: any) {
  try {
    const hasResendKey = Deno.env.get("RESEND_API_KEY");
    if (!hasResendKey) {
      console.log('Resend API key not configured, skipping email');
      return;
    }

    await supabaseClient.functions.invoke('send-payment-email', {
      body: { to, subject, type, data }
    });
    console.log(`Email sent to ${to}: ${type}`);
  } catch (error) {
    console.error(`Failed to send email to ${to}:`, error);
  }
}

async function handleCheckoutComplete(session: Stripe.Checkout.Session) {
  const { customer, subscription, metadata, amount_total, mode } = session;
  
  if (!metadata?.user_id) return;

  // Update payment session status
  await supabaseClient
    .from('payment_sessions')
    .update({ status: 'completed' })
    .eq('session_id', session.id);

  if (mode === 'subscription' && subscription) {
    // Handle subscription creation
    const subscriptionData = await stripe.subscriptions.retrieve(subscription as string);
    await createOrUpdateSubscription(subscriptionData, metadata.user_id);
  } else if (mode === 'payment') {
    // Handle one-time payment
    await supabaseClient
      .from('payments')
      .insert({
        user_id: metadata.user_id,
        stripe_payment_id: session.payment_intent,
        amount: amount_total,
        currency: session.currency,
        type: metadata.type || 'one_time',
        tier: metadata.tier,
        status: 'completed',
      });
  }
}

async function handleSubscriptionChange(subscription: Stripe.Subscription) {
  const customer = await stripe.customers.retrieve(subscription.customer as string);
  if (!customer || customer.deleted) return;

  const { data: user } = await supabaseClient
    .from('users')
    .select('id')
    .eq('email', (customer as Stripe.Customer).email)
    .single();

  if (user) {
    await createOrUpdateSubscription(subscription, user.id);
  }
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const customer = await stripe.customers.retrieve(subscription.customer as string);
  const email = customer && !customer.deleted ? customer.email : null;

  await supabaseClient
    .from('subscriptions')
    .update({
      status: 'canceled',
      canceled_at: new Date().toISOString(),
    })
    .eq('stripe_subscription_id', subscription.id);

  // Send cancellation email
  if (email) {
    const endDate = new Date(subscription.current_period_end * 1000).toLocaleDateString();
    await sendEmail(
      email,
      'Subscription Cancelled',
      'subscription_cancelled',
      { endDate }
    );
  }

  console.log(`Subscription deleted: ${subscription.id}`);
}

async function handlePaymentSucceeded(invoice: Stripe.Invoice) {
  if (invoice.subscription) {
    const subscription = await stripe.subscriptions.retrieve(invoice.subscription as string);
    const customer = await stripe.customers.retrieve(subscription.customer as string);
    
    if (!customer || customer.deleted) return;

    const { data: user } = await supabaseClient
      .from('users')
      .select('id')
      .eq('email', (customer as Stripe.Customer).email)
      .single();

    if (user) {
      await supabaseClient
        .from('payments')
        .insert({
          user_id: user.id,
          stripe_payment_id: invoice.payment_intent,
          amount: invoice.amount_paid,
          currency: invoice.currency,
          type: 'recurring',
          status: 'completed',
          invoice_id: invoice.id,
        });

      // Send payment success email
      const email = (customer as Stripe.Customer).email;
      if (email) {
        await sendEmail(
          email,
          'Payment Successful',
          'payment_success',
          { amount: `$${(invoice.amount_paid / 100).toFixed(2)}` }
        );
      }
    }
  }
}

async function handlePaymentFailed(invoice: Stripe.Invoice) {
  if (invoice.subscription) {
    const subscription = await stripe.subscriptions.retrieve(invoice.subscription as string);
    const customer = await stripe.customers.retrieve(subscription.customer as string);

    await supabaseClient
      .from('subscriptions')
      .update({ status: 'past_due' })
      .eq('stripe_subscription_id', invoice.subscription);

    // Send payment failed email
    if (customer && !customer.deleted) {
      const email = (customer as Stripe.Customer).email;
      if (email) {
        await sendEmail(
          email,
          'Payment Failed - Action Required',
          'payment_failed',
          { reason: 'Payment could not be processed' }
        );
      }
    }
  }

  console.log(`Subscription marked as past_due: ${invoice.subscription}`);
}

async function createOrUpdateSubscription(subscription: Stripe.Subscription, userId: string) {
  const priceId = subscription.items.data[0]?.price.id;
  const price = priceId ? await stripe.prices.retrieve(priceId) : null;
  
  let tier = 'basic';
  if (price) {
    const amount = price.unit_amount || 0;
    if (amount >= 2999) tier = 'pro';
    else if (amount >= 1999) tier = 'premium';
  }

  const subscriptionData = {
    user_id: userId,
    stripe_subscription_id: subscription.id,
    stripe_customer_id: subscription.customer as string,
    status: subscription.status,
    tier: tier,
    current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
    current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
    trial_end: subscription.trial_end ? new Date(subscription.trial_end * 1000).toISOString() : null,
  };

  await supabaseClient
    .from('subscriptions')
    .upsert(subscriptionData, { onConflict: 'stripe_subscription_id' });
}
