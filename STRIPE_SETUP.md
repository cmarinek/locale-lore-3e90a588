# Stripe Setup Guide

## Required Configuration

### 1. Get Your Stripe Keys

Go to your Stripe Dashboard:
- **Test Mode**: https://dashboard.stripe.com/test/apikeys
- **Live Mode**: https://dashboard.stripe.com/apikeys

You'll need:
- ✅ **Publishable Key** (starts with `pk_test_` or `pk_live_`)
- ✅ **Secret Key** (starts with `sk_test_` or `sk_live_`)
- ✅ **Webhook Secret** (from webhook setup below)

### 2. Add Publishable Key to Lovable

In your Lovable project settings, add this environment variable:

```
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_key_here
```

**Important**: This is a publishable key, so it's safe to use on the frontend.

### 3. Configure Webhook

1. Go to: https://dashboard.stripe.com/test/webhooks
2. Click **+ Add endpoint**
3. Set endpoint URL to:
   ```
   https://mwufulzthoqrwbwtvogx.supabase.co/functions/v1/stripe-webhooks
   ```
4. Select these events:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`

5. Copy the **Signing secret** (starts with `whsec_`)

### 4. Verify Supabase Secrets

Make sure these secrets are configured in your Supabase project:
- `STRIPE_SECRET_KEY` - Your Stripe secret key
- `STRIPE_WEBHOOK_SECRET` - The webhook signing secret from step 3

Check them here:
https://supabase.com/dashboard/project/mwufulzthoqrwbwtvogx/settings/functions

### 5. Create Stripe Products & Prices

Create your subscription tiers in Stripe:

**Basic Tier** ($19.99/month):
```bash
stripe products create --name="Basic Plan" --description="Basic features"
stripe prices create --product=prod_xxx --unit-amount=1999 --currency=usd --recurring[interval]=month
```

**Premium Tier** ($29.99/month):
```bash
stripe products create --name="Premium Plan" --description="Premium features"
stripe prices create --product=prod_xxx --unit-amount=2999 --currency=usd --recurring[interval]=month
```

**Pro Tier** ($49.99/month):
```bash
stripe products create --name="Pro Plan" --description="All features"
stripe prices create --product=prod_xxx --unit-amount=4999 --currency=usd --recurring[interval]=month
```

Save the price IDs (they start with `price_`).

### 6. Test the Integration

1. Use Stripe test card: `4242 4242 4242 4242`
2. Any future expiry date
3. Any 3-digit CVC
4. Any billing ZIP code

### 7. Go Live Checklist

Before switching to production:

- [ ] Switch Stripe to **Live Mode**
- [ ] Update `VITE_STRIPE_PUBLISHABLE_KEY` with live publishable key
- [ ] Update `STRIPE_SECRET_KEY` secret with live secret key
- [ ] Update webhook URL in Stripe dashboard (use same URL)
- [ ] Update `STRIPE_WEBHOOK_SECRET` with live webhook secret
- [ ] Create live products and prices
- [ ] Test one real transaction
- [ ] Enable Stripe Radar for fraud protection
- [ ] Set up email receipts in Stripe settings

## Troubleshooting

### Webhook not receiving events
- Check webhook URL is correct
- Verify webhook is active in Stripe dashboard
- Check edge function logs: https://supabase.com/dashboard/project/mwufulzthoqrwbwtvogx/functions/stripe-webhooks/logs

### Payment not creating subscription
- Check console logs during checkout
- Verify all Stripe secrets are set correctly
- Check database tables have proper RLS policies
- Review edge function logs for errors

## Security Notes

✅ **Safe to commit**:
- Publishable keys (pk_test_, pk_live_)

❌ **NEVER commit**:
- Secret keys (sk_test_, sk_live_)
- Webhook secrets (whsec_)

These are stored securely in Supabase secrets.
