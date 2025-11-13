# Stripe Production Configuration Guide

**Last Updated:** November 13, 2025
**Estimated Time:** 2-3 hours
**Difficulty:** Medium
**Status:** 🔴 CRITICAL - Required for Launch

---

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Stripe Dashboard Setup](#stripe-dashboard-setup)
3. [Product & Price Configuration](#product--price-configuration)
4. [Webhook Configuration](#webhook-configuration)
5. [Environment Variables](#environment-variables)
6. [Testing Checklist](#testing-checklist)
7. [Common Issues](#common-issues)
8. [Production Readiness Verification](#production-readiness-verification)

---

## Prerequisites

Before starting, ensure you have:

- [ ] Stripe account created (https://dashboard.stripe.com)
- [ ] Business verified (required for live mode)
- [ ] Bank account connected for payouts
- [ ] Tax information submitted
- [ ] Access to production environment variables (Supabase/Lovable dashboard)
- [ ] Test payment method (real credit card for testing)

---

## Stripe Dashboard Setup

### Step 1: Activate Your Account

1. **Go to:** https://dashboard.stripe.com/account/onboarding
2. **Complete:**
   - Business details
   - Bank account information
   - Tax identification
   - Identity verification
3. **Verify:** Check that "Payments" are enabled in live mode

### Step 2: Get Your API Keys

1. **Navigate to:** https://dashboard.stripe.com/apikeys
2. **Toggle:** Switch from "Test mode" to "Live mode" (top right)
3. **Copy:**
   ```
   Publishable key: pk_live_...
   Secret key: sk_live_... (click "Reveal live key token")
   ```
4. **Store securely:** These are your production credentials

⚠️ **CRITICAL:** Never commit these keys to version control!

---

## Product & Price Configuration

### Step 3: Create Subscription Products

Navigate to: https://dashboard.stripe.com/products

#### Product 1: Basic Tier

```yaml
Product Name: LocaleLore Basic
Description: Essential features for casual explorers
Statement Descriptor: LOCALELORE BASIC
```

**Pricing:**
- **Amount:** $9.99/month (or your preferred price)
- **Billing Period:** Monthly
- **Currency:** USD
- **Billing Scheme:** Per-unit pricing

After creation, copy the **Price ID**: `price_...` → Save as `STRIPE_PRICE_ID_BASIC`

#### Product 2: Premium Tier

```yaml
Product Name: LocaleLore Premium
Description: Advanced features for active contributors
Statement Descriptor: LOCALELORE PREMIUM
```

**Pricing:**
- **Amount:** $19.99/month
- **Billing Period:** Monthly
- **Currency:** USD

Copy **Price ID**: `price_...` → Save as `STRIPE_PRICE_ID_PREMIUM`

#### Product 3: Pro Tier

```yaml
Product Name: LocaleLore Pro
Description: Full access with priority support
Statement Descriptor: LOCALELORE PRO
```

**Pricing:**
- **Amount:** $29.99/month
- **Billing Period:** Monthly
- **Currency:** USD

Copy **Price ID**: `price_...` → Save as `STRIPE_PRICE_ID_PRO`

### Step 4: Configure Product Settings

For each product:

1. **Tax Behavior:** "Exclusive of tax" (recommended)
2. **Allow Promotion Codes:** Yes
3. **Trial Period:** Optional (e.g., 14 days)
4. **Setup Fee:** Optional

---

## Webhook Configuration

### Step 5: Create Webhook Endpoint

1. **Navigate to:** https://dashboard.stripe.com/webhooks
2. **Click:** "Add endpoint"
3. **Endpoint URL:** `https://your-project.supabase.co/functions/v1/stripe-webhooks`

   Replace with your actual Supabase project URL

4. **Description:** "LocaleLore Production Webhooks"
5. **API Version:** Use latest (currently 2023-10-16)

### Step 6: Select Events to Listen

Select the following events:

```yaml
Required Events:
  - checkout.session.completed
  - customer.subscription.created
  - customer.subscription.updated
  - customer.subscription.deleted
  - invoice.payment_succeeded
  - invoice.payment_failed
  - customer.created
  - customer.updated

Optional (Recommended):
  - payment_intent.succeeded
  - payment_intent.payment_failed
  - charge.refunded
  - charge.dispute.created
```

### Step 7: Get Webhook Secret

After creating the webhook:

1. **Click** on the webhook endpoint
2. **Reveal** the signing secret
3. **Copy:** `whsec_...`
4. **Save as:** `STRIPE_WEBHOOK_SECRET`

---

## Environment Variables

### Step 8: Configure Frontend Variables

**In Lovable Dashboard or Vercel:**

```bash
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_51...
```

**Verification:**
```javascript
// This should NOT throw an error
console.log(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY?.startsWith('pk_live_'))
```

### Step 9: Configure Backend Variables (Supabase Edge Functions)

**Navigate to:** Supabase Dashboard → Settings → Edge Functions

Add the following secrets:

```bash
# Secret keys (DO NOT expose to frontend)
STRIPE_SECRET_KEY=sk_live_51...
STRIPE_WEBHOOK_SECRET=whsec_...

# Price IDs
STRIPE_PRICE_ID_BASIC=price_...
STRIPE_PRICE_ID_PREMIUM=price_...
STRIPE_PRICE_ID_PRO=price_...
```

**Via Supabase CLI:**
```bash
# If using Supabase CLI locally
supabase secrets set STRIPE_SECRET_KEY=sk_live_51...
supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_...
supabase secrets set STRIPE_PRICE_ID_BASIC=price_...
supabase secrets set STRIPE_PRICE_ID_PREMIUM=price_...
supabase secrets set STRIPE_PRICE_ID_PRO=price_...
```

---

## Testing Checklist

### Step 10: End-to-End Payment Testing

⚠️ **Use a real credit card** (you'll be charged, but can refund immediately)

#### Test 1: Subscription Creation

- [ ] Navigate to `/billing` in your app
- [ ] Click "Upgrade to Premium"
- [ ] Complete checkout with real card
- [ ] Verify redirect to success page
- [ ] Check Stripe dashboard for new subscription
- [ ] Verify user's tier updated in database (`subscriptions` table)
- [ ] Confirm webhook received in Supabase logs

**Expected Database Record:**
```sql
SELECT * FROM subscriptions WHERE user_id = 'your-user-id';

-- Should show:
-- status: 'active'
-- tier: 'premium'
-- stripe_subscription_id: 'sub_...'
-- current_period_end: [future date]
```

#### Test 2: Payment Success Email

- [ ] Check if payment confirmation email sent
- [ ] Verify email contains correct amount
- [ ] Check "from" address is correct

**Note:** Requires `RESEND_API_KEY` configured

#### Test 3: Subscription Cancellation

- [ ] Go to billing settings
- [ ] Click "Cancel Subscription"
- [ ] Confirm cancellation
- [ ] Verify status shows "Cancels at [end date]"
- [ ] Check database: `cancel_at_period_end` = true

#### Test 4: Payment Failure

Use test card: `4000000000000341` (requires authentication, will fail)

- [ ] Start checkout
- [ ] Use failing test card
- [ ] Verify error message shown
- [ ] Confirm no subscription created
- [ ] Check Stripe dashboard for failed payment

#### Test 5: Webhook Delivery

- [ ] Navigate to Stripe Dashboard → Webhooks → Your endpoint
- [ ] Check "Recent deliveries" section
- [ ] Verify all events have 200 status code
- [ ] Click on an event to see request/response

**If webhook failing:**
```bash
# Check Supabase Edge Function logs
supabase functions logs stripe-webhooks --limit 50
```

#### Test 6: Subscription Upgrade/Downgrade

- [ ] Start with Basic tier
- [ ] Upgrade to Premium
- [ ] Verify proration invoice created
- [ ] Check immediate tier change in app
- [ ] Downgrade to Basic
- [ ] Verify change applies at period end

#### Test 7: Invoice Generation

- [ ] Wait for first billing cycle OR
- [ ] Use Stripe Dashboard to manually create invoice
- [ ] Verify invoice stored in `invoices` table
- [ ] Check invoice email sent (if Resend configured)

---

## Common Issues

### Issue 1: "No such price: price_..."

**Cause:** Price ID doesn't exist or is from test mode

**Solution:**
1. Verify you're in LIVE mode in Stripe dashboard
2. Copy price IDs again from Products page
3. Update environment variables
4. Restart application

### Issue 2: Webhook signature verification failed

**Cause:** Incorrect webhook secret or raw body not used

**Solution:**
```typescript
// Verify webhook secret is correct
console.log('Expected:', Deno.env.get('STRIPE_WEBHOOK_SECRET'))
console.log('Received signature:', req.headers.get('stripe-signature'))

// Ensure raw body is used (already implemented in stripe-webhooks/index.ts)
const body = await req.text(); // ✅ Correct
// const body = await req.json(); // ❌ Wrong - breaks signature
```

### Issue 3: Subscription created but database not updated

**Cause:** Edge function error or database permissions

**Solution:**
1. Check Supabase Edge Function logs:
   ```bash
   supabase functions logs stripe-webhooks
   ```
2. Verify `subscriptions` table RLS policy allows service role
3. Check user_id mapping is correct

### Issue 4: Customer email not found

**Cause:** User's Supabase auth email doesn't match Stripe customer email

**Solution:**
```typescript
// In checkout session creation, ensure email is passed:
const session = await stripe.checkout.sessions.create({
  customer_email: user.email, // ← Critical
  metadata: {
    user_id: user.id // ← Also critical for webhook
  }
})
```

### Issue 5: Test mode keys in production

**Symptoms:**
- Checkout works but shows "TEST MODE" banner
- Real cards declined
- Webhooks not received

**Solution:**
1. Double-check all keys start with `pk_live_` and `sk_live_`
2. Restart frontend and backend after updating
3. Clear browser cache

---

## Production Readiness Verification

### Final Checklist

#### Stripe Dashboard ✅

- [ ] Live mode activated
- [ ] Business details complete
- [ ] Bank account connected
- [ ] Tax information submitted
- [ ] All 3 products created (Basic, Premium, Pro)
- [ ] Webhook endpoint created and verified
- [ ] Recent webhook deliveries show 200 status

#### Environment Variables ✅

- [ ] `VITE_STRIPE_PUBLISHABLE_KEY` starts with `pk_live_`
- [ ] `STRIPE_SECRET_KEY` starts with `sk_live_`
- [ ] `STRIPE_WEBHOOK_SECRET` starts with `whsec_`
- [ ] All 3 price IDs configured
- [ ] Variables accessible in production environment

#### Database ✅

- [ ] `subscriptions` table exists
- [ ] `payments` table exists
- [ ] `payment_sessions` table exists
- [ ] `invoices` table exists
- [ ] RLS policies allow service role writes

#### Application Testing ✅

- [ ] Can create subscription with real card
- [ ] Subscription appears in Stripe dashboard
- [ ] Database updated with subscription data
- [ ] User tier changed in app
- [ ] Webhooks received successfully
- [ ] Can cancel subscription
- [ ] Can upgrade/downgrade tiers
- [ ] Refund processed successfully (test one)

#### Monitoring ✅

- [ ] Webhook delivery monitoring set up
- [ ] Failed payment alerts configured
- [ ] Subscription churn tracking enabled
- [ ] Revenue metrics dashboard created

---

## Post-Setup Tasks

### 1. Create Promotion Codes (Optional)

**Navigate to:** https://dashboard.stripe.com/coupons

Example codes:
```yaml
LAUNCH50:
  - 50% off first month
  - Applies to all tiers
  - Limited to 100 users

EARLYBIRD:
  - 25% off for 3 months
  - Applies to Premium/Pro
  - Expires: 30 days from now
```

### 2. Set Up Billing Portal

**Navigate to:** https://dashboard.stripe.com/settings/billing/portal

Configure:
- [ ] Allow customers to cancel subscriptions
- [ ] Allow customers to update payment methods
- [ ] Allow customers to view invoice history
- [ ] Customize branding (logo, colors)

### 3. Configure Email Receipts

**Navigate to:** https://dashboard.stripe.com/settings/emails

Customize:
- [ ] Payment confirmation emails
- [ ] Invoice emails
- [ ] Subscription renewal reminders
- [ ] Add company logo and branding

### 4. Set Up Tax Collection (if applicable)

**Navigate to:** https://dashboard.stripe.com/settings/tax

Enable automatic tax collection for:
- [ ] US states where you have nexus
- [ ] EU VAT (if serving EU customers)
- [ ] Other jurisdictions as needed

---

## Quick Reference

### Essential Stripe URLs

| Resource | URL |
|----------|-----|
| Dashboard | https://dashboard.stripe.com |
| API Keys | https://dashboard.stripe.com/apikeys |
| Products | https://dashboard.stripe.com/products |
| Webhooks | https://dashboard.stripe.com/webhooks |
| Customers | https://dashboard.stripe.com/customers |
| Subscriptions | https://dashboard.stripe.com/subscriptions |
| Logs | https://dashboard.stripe.com/logs |
| Developers | https://dashboard.stripe.com/developers |

### Useful Stripe CLI Commands

```bash
# Install Stripe CLI
brew install stripe/stripe-cli/stripe

# Login to your account
stripe login

# Forward webhooks to local development
stripe listen --forward-to localhost:54321/functions/v1/stripe-webhooks

# Test a webhook event
stripe trigger checkout.session.completed

# View recent events
stripe events list --limit 10

# Get specific subscription
stripe subscriptions retrieve sub_...

# Refund a payment
stripe refunds create --payment-intent pi_...
```

---

## Support & Resources

- **Stripe Documentation:** https://stripe.com/docs
- **Webhook Testing:** https://stripe.com/docs/webhooks/test
- **API Reference:** https://stripe.com/docs/api
- **Discord Support:** https://discord.gg/stripe (community)
- **Email Support:** support@stripe.com (response within 24h)

---

## Timeline

**Total Time: 2-3 hours**

| Task | Duration |
|------|----------|
| Stripe account setup | 30 min |
| Product/price configuration | 30 min |
| Webhook setup | 20 min |
| Environment variables | 15 min |
| Testing subscriptions | 45 min |
| Verification & debugging | 30 min |

---

## ✅ Success Criteria

Your Stripe integration is production-ready when:

1. ✅ All tests pass with real payment methods
2. ✅ Webhooks consistently deliver with 200 status
3. ✅ Database accurately reflects subscription state
4. ✅ Users can subscribe, upgrade, downgrade, and cancel
5. ✅ No test mode warnings in production
6. ✅ Monitoring alerts configured
7. ✅ At least one successful refund processed

---

**Next Step:** Once Stripe is configured, proceed to [Monitoring & Alerting Setup](./MONITORING_ALERTING_SETUP.md)
