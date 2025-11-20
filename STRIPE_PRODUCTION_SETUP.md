# Stripe Production Setup Guide
## LocaleLore Payment Processing Configuration

**Last Updated:** November 20, 2025
**Domain:** localelore.org
**Estimated Setup Time:** 2-3 hours

---

## 🎯 OVERVIEW

This guide walks you through configuring Stripe for production use on LocaleLore. Complete each section in order.

**Prerequisites:**
- Stripe account created
- Business information ready
- Bank account for payouts
- Domain localelore.org configured

---

## 📋 QUICK CHECKLIST

Use this to track your progress:

- [ ] Complete Stripe account verification
- [ ] Activate account for live payments
- [ ] Create subscription products in Stripe
- [ ] Create webhook endpoint
- [ ] Configure API keys in environment
- [ ] Set up customer portal
- [ ] Configure email notifications
- [ ] Test with real payment method
- [ ] Set up tax collection (if required)
- [ ] Review security settings
- [ ] Set up fraud prevention rules
- [ ] Configure billing settings

---

## 1️⃣ STRIPE ACCOUNT VERIFICATION

### Step 1.1: Complete Business Information

1. Go to https://dashboard.stripe.com/account/onboarding
2. Complete all required sections:
   - **Business type:** LLC, Sole Proprietorship, etc.
   - **Legal business name:** [Your registered entity name]
   - **Business address:** [Your registered address]
   - **Phone number:** Business phone
   - **Website:** https://localelore.org
   - **Product description:** "Location-based storytelling platform with subscription tiers"
   - **Business category:** Software / SaaS

### Step 1.2: Verify Bank Account

1. Go to: https://dashboard.stripe.com/settings/payouts
2. Click **Add bank account**
3. Enter your bank details:
   - Routing number
   - Account number
   - Account type (Checking/Savings)
4. Stripe will make 2 small deposits (takes 1-2 business days)
5. Verify amounts when they arrive

### Step 1.3: Identity Verification

1. Stripe may require ID verification
2. Upload government-issued ID
3. Take selfie if requested
4. Processing time: Usually instant, up to 2 days

### Step 1.4: Activate Live Payments

1. Once verified, toggle **View test data** → **OFF** (top right)
2. You should see "Live mode" badge
3. If not activated, complete any remaining verification steps

**⚠️ DO NOT PROCEED until account is fully activated for live payments**

---

## 2️⃣ CREATE SUBSCRIPTION PRODUCTS

### Step 2.1: Create Basic Plan ($9.99/month)

1. Go to: https://dashboard.stripe.com/products
2. Click **+ Add product**
3. Configure:
   - **Name:** Basic Plan
   - **Description:** Essential storytelling features for casual explorers
   - **Pricing model:** Standard pricing
   - **Price:** $9.99 USD
   - **Billing period:** Monthly (recurring every 1 month)
   - **Currency:** USD
4. Click **Save product**
5. **IMPORTANT:** Copy the Price ID (starts with `price_...`)
   - Example: `price_1AbC2dEfG3hIjKlM4nOpQrSt`
   - Save this as `STRIPE_PRICE_ID_BASIC`

### Step 2.2: Create Premium Plan ($19.99/month)

1. Click **+ Add product**
2. Configure:
   - **Name:** Premium Plan
   - **Description:** Advanced features for dedicated storytellers
   - **Pricing model:** Standard pricing
   - **Price:** $19.99 USD
   - **Billing period:** Monthly (recurring every 1 month)
   - **Currency:** USD
3. Click **Save product**
4. **Copy Price ID** → Save as `STRIPE_PRICE_ID_PREMIUM`

### Step 2.3: Create Pro Plan ($29.99/month)

1. Click **+ Add product**
2. Configure:
   - **Name:** Pro Plan
   - **Description:** Premium features for power users and professionals
   - **Pricing model:** Standard pricing
   - **Price:** $29.99 USD
   - **Billing period:** Monthly (recurring every 1 month)
   - **Currency:** USD
3. Click **Save product**
4. **Copy Price ID** → Save as `STRIPE_PRICE_ID_PRO`

### Step 2.4: Optional - Create Annual Plans (15% discount)

If you want to offer annual billing:

**Basic Annual:** $101.88/year (save $17.88)
**Premium Annual:** $203.88/year (save $35.88)
**Pro Annual:** $305.88/year (save $53.88)

Repeat steps above but select:
- **Billing period:** Yearly (recurring every 12 months)
- **Price:** Discounted annual amount

---

## 3️⃣ CONFIGURE WEBHOOKS

Webhooks notify your backend when payment events occur (successful payment, failed payment, subscription cancelled, etc.).

### Step 3.1: Create Webhook Endpoint

1. Go to: https://dashboard.stripe.com/webhooks
2. Click **+ Add endpoint**
3. Configure:
   - **Endpoint URL:** `https://[your-supabase-project].supabase.co/functions/v1/stripe-webhooks`
   - Replace `[your-supabase-project]` with your actual Supabase project ID
   - Example: `https://abcdefghijklmnop.supabase.co/functions/v1/stripe-webhooks`
4. **Select events to listen to:**
   - `checkout.session.completed` ✅
   - `customer.subscription.created` ✅
   - `customer.subscription.updated` ✅
   - `customer.subscription.deleted` ✅
   - `invoice.paid` ✅
   - `invoice.payment_failed` ✅
   - `invoice.payment_action_required` ✅
   - `customer.created` ✅
   - `customer.updated` ✅
5. Click **Add endpoint**

### Step 3.2: Get Webhook Signing Secret

1. Click on your newly created endpoint
2. Find **Signing secret** section
3. Click **Reveal**
4. Copy the secret (starts with `whsec_...`)
5. **Save this as `STRIPE_WEBHOOK_SECRET`**

**⚠️ CRITICAL:** Never share this secret publicly. It verifies webhook authenticity.

### Step 3.3: Test Webhook (Optional)

1. Install Stripe CLI: https://stripe.com/docs/stripe-cli
2. Run: `stripe listen --forward-to https://your-project.supabase.co/functions/v1/stripe-webhooks`
3. Trigger test event: `stripe trigger checkout.session.completed`
4. Check Supabase logs for successful webhook processing

---

## 4️⃣ GET API KEYS

### Step 4.1: Get Publishable Key (Frontend)

1. Go to: https://dashboard.stripe.com/apikeys
2. **Make sure you're in LIVE mode** (toggle off "View test data")
3. Find **Publishable key** section
4. Copy the key (starts with `pk_live_...`)
5. **Save this as `VITE_STRIPE_PUBLISHABLE_KEY`**
   - Goes in `.env.production` file (frontend)

### Step 4.2: Get Secret Key (Backend)

1. In same page, find **Secret key** section
2. Click **Reveal live key token**
3. Copy the key (starts with `sk_live_...`)
4. **Save this as `STRIPE_SECRET_KEY`**
   - Goes in Supabase Edge Function secrets (backend)

**⚠️ WARNING:**
- NEVER commit `sk_live_` keys to git
- NEVER expose `sk_live_` keys in frontend code
- Use `pk_live_` only for frontend
- Use `sk_live_` only for backend

---

## 5️⃣ SET ENVIRONMENT VARIABLES

### Step 5.1: Frontend Variables (`.env.production`)

Create/update `.env.production` in project root:

```bash
# STRIPE CONFIGURATION
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_xxxxxxxxxxxxxxxxxxxxx  # From Step 4.1
```

### Step 5.2: Backend Secrets (Supabase Dashboard)

Go to: **Supabase Dashboard** → **Project Settings** → **Edge Functions** → **Secrets**

Add these secrets:

```bash
# Stripe API Keys
STRIPE_SECRET_KEY=sk_live_xxxxxxxxxxxxxxxxxxxxx  # From Step 4.2
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxxxxxxx  # From Step 3.2

# Stripe Price IDs
STRIPE_PRICE_ID_BASIC=price_xxxxxxxxxxxxxxxxxxxxx  # From Step 2.1
STRIPE_PRICE_ID_PREMIUM=price_xxxxxxxxxxxxxxxxxxxxx  # From Step 2.2
STRIPE_PRICE_ID_PRO=price_xxxxxxxxxxxxxxxxxxxxx  # From Step 2.3
```

### Step 5.3: Verify Configuration

Run this command to list Supabase secrets (values hidden):
```bash
supabase secrets list
```

Expected output should include:
- STRIPE_SECRET_KEY
- STRIPE_WEBHOOK_SECRET
- STRIPE_PRICE_ID_BASIC
- STRIPE_PRICE_ID_PREMIUM
- STRIPE_PRICE_ID_PRO

---

## 6️⃣ CONFIGURE CUSTOMER PORTAL

The customer portal allows users to manage their subscriptions, update payment methods, and view invoices.

### Step 6.1: Enable Customer Portal

1. Go to: https://dashboard.stripe.com/settings/billing/portal
2. Click **Activate** (if not already activated)
3. Configure settings:

**Functionality:**
- [x] Cancel subscriptions
- [x] Update payment method
- [x] View invoices
- [x] Update billing address
- [ ] Pause subscriptions (optional)

**Cancellation options:**
- Allow customers to cancel subscriptions: **Yes**
- When customers cancel, subscriptions should: **Cancel at end of billing period**
- Provide customers with retention offers: **Optional** (consider adding discount offer)
- Allow customers to provide feedback: **Yes** (select "Other" and custom text box)

**Business information:**
- Business name: [Your Legal Entity Name]
- Support email: support@localelore.org
- Privacy policy: https://localelore.org/privacy
- Terms of service: https://localelore.org/terms

4. Click **Save**

---

## 7️⃣ CONFIGURE EMAIL NOTIFICATIONS

### Step 7.1: Customize Email Settings

1. Go to: https://dashboard.stripe.com/settings/emails
2. Configure:

**Successful payments:**
- [x] Send receipts automatically
- **From name:** LocaleLore
- **Reply-to email:** support@localelore.org
- **Custom email template:** Optional (use Stripe's default or customize)

**Failed payments:**
- [x] Notify customers when payment fails
- **Retry schedule:** 3 days, 5 days, 7 days (default)

**Refund emails:**
- [x] Send refund notifications
- **From name:** LocaleLore
- **Reply-to email:** support@localelore.org

**Invoice emails:**
- [x] Send invoices automatically
- [x] Send payment failure emails

### Step 7.2: Add Brand Logo (Optional)

1. Go to: https://dashboard.stripe.com/settings/branding
2. Upload LocaleLore logo (recommended 512x512px PNG)
3. Set brand colors to match your theme
4. Save changes

---

## 8️⃣ TEST PAYMENT FLOW

**⚠️ IMPORTANT:** Always test with a real payment method before launch. Stripe test mode doesn't catch all issues.

### Step 8.1: Create Test Subscription

1. Build your frontend with production environment variables:
   ```bash
   npm run build
   ```

2. Deploy to production or test locally:
   ```bash
   npm run preview
   ```

3. **Use a real payment method** (you can cancel immediately after):
   - Go to https://localelore.org/pricing (or your deployed URL)
   - Click **Subscribe** on Basic plan
   - Enter REAL credit card information
   - Complete checkout

4. Verify in Stripe Dashboard:
   - Go to: https://dashboard.stripe.com/payments
   - Should see successful payment
   - Go to: https://dashboard.stripe.com/subscriptions
   - Should see active subscription

5. Check your application:
   - User should be upgraded to Basic tier
   - Profile should show "Basic Plan"
   - Premium features should unlock

### Step 8.2: Test Customer Portal

1. Log in to LocaleLore as the test user
2. Go to account settings → Billing
3. Click "Manage Subscription"
4. Should redirect to Stripe Customer Portal
5. Try:
   - Viewing invoice
   - Updating payment method (add another card)
   - Cancelling subscription
6. Verify cancellation works correctly

### Step 8.3: Test Webhook Events

1. Monitor Supabase Edge Function logs:
   ```bash
   supabase functions logs stripe-webhooks
   ```

2. Trigger events in your app:
   - Create subscription
   - Update payment method
   - Cancel subscription
   - Wait for failed payment (test by cancelling card)

3. Check logs for successful webhook processing

### Step 8.4: Test Failed Payment

1. In Stripe Dashboard, go to: https://dashboard.stripe.com/subscriptions
2. Click your test subscription
3. Click **Actions** → **Update payment method**
4. Add a card that will decline: `4000 0000 0000 0341`
5. Wait for next billing cycle or manually create invoice
6. Verify:
   - Payment fails
   - User receives email notification
   - App shows payment failed state
   - Retry logic kicks in

---

## 9️⃣ CONFIGURE TAX COLLECTION (If Required)

### Step 9.1: Check Tax Requirements

**Do you need to collect taxes?**
- Selling digital goods in EU? → **VAT required**
- Selling in US states with digital goods tax? → **Sales tax may be required**
- Check: https://stripe.com/tax

### Step 9.2: Enable Stripe Tax (Recommended)

1. Go to: https://dashboard.stripe.com/settings/tax
2. Click **Enable Stripe Tax**
3. Configure:
   - **Business location:** [Your country/state]
   - **Tax registration:** Enter tax IDs if you have them
   - **Tax collection:** Enable automatic tax calculation
4. Stripe will automatically calculate and collect tax based on customer location

**Pricing:**
- 0.5% of transaction volume
- Example: $10 subscription = $0.05 tax calculation fee
- Worth it to avoid manual tax compliance

---

## 🔟 SECURITY & FRAUD PREVENTION

### Step 10.1: Enable Radar for Fraud Protection

1. Go to: https://dashboard.stripe.com/settings/radar
2. **Radar for Fraud Teams** is included free with Stripe
3. Review default rules:
   - Block payments with high risk scores
   - Require 3D Secure for risky payments
   - Block payments from risky countries (optional)

### Step 10.2: Enable 3D Secure

1. Go to: https://dashboard.stripe.com/settings/payment_methods
2. Under **Credit and debit cards**:
   - [x] Use 3D Secure 2 when recommended by Radar
   - [x] Request 3D Secure for all customers (optional, adds friction)
3. Recommended: **Use when recommended** (balances security and UX)

### Step 10.3: Set Up Dispute Notifications

1. Go to: https://dashboard.stripe.com/settings/notifications
2. Enable notifications for:
   - [x] Disputes created
   - [x] Disputes require response
   - [x] Disputes closed
3. Add email: support@localelore.org

### Step 10.4: Review Blocked Countries

1. Go to: https://dashboard.stripe.com/settings/radar/rules
2. Consider blocking high-risk countries if needed
3. **Be careful:** Legitimate users may be affected

---

## 1️⃣1️⃣ BILLING SETTINGS

### Step 11.1: Configure Statement Descriptor

What appears on customer's credit card statement:

1. Go to: https://dashboard.stripe.com/settings/public
2. **Statement descriptor:** Enter `LOCALELORE` (max 22 characters)
3. **Shortened descriptor:** `LOCALELORE` (max 10 characters, for small screens)
4. **Support phone:** [Your business phone]
5. Save changes

**What customers see:**
```
LOCALELORE          $9.99
support@localelore.org
```

### Step 11.2: Configure Billing Thresholds

1. Go to: https://dashboard.stripe.com/settings/billing/automatic
2. **Billing threshold:** $100 minimum (default)
3. Recommended: Keep at $100 to reduce ACH transfer fees

### Step 11.3: Set Invoice Memo (Optional)

1. Go to: https://dashboard.stripe.com/settings/billing/invoices
2. **Invoice memo:** Add default message
   - Example: "Thank you for your LocaleLore subscription! Questions? Contact support@localelore.org"

---

## 1️⃣2️⃣ FINAL VERIFICATION CHECKLIST

Before going live, verify ALL items:

### Account Status
- [ ] Stripe account fully verified (no warnings in dashboard)
- [ ] Bank account connected and verified
- [ ] Payouts enabled (check https://dashboard.stripe.com/settings/payouts)
- [ ] Business information complete
- [ ] In **Live mode** (not test mode)

### Products & Pricing
- [ ] Basic Plan created ($9.99/month) with correct Price ID
- [ ] Premium Plan created ($19.99/month) with correct Price ID
- [ ] Pro Plan created ($29.99/month) with correct Price ID
- [ ] All Price IDs saved to environment variables

### Webhooks
- [ ] Webhook endpoint created with correct URL
- [ ] All required events selected (9 events minimum)
- [ ] Webhook signing secret saved to environment variables
- [ ] Webhook tested successfully

### API Keys
- [ ] Publishable key (`pk_live_...`) in frontend `.env.production`
- [ ] Secret key (`sk_live_...`) in Supabase secrets
- [ ] NEVER committed secret key to git
- [ ] All keys in LIVE mode (not test mode)

### Customer Portal
- [ ] Customer portal activated
- [ ] Cancellation policy configured
- [ ] Business information added
- [ ] Links to privacy policy and terms

### Email Notifications
- [ ] Receipt emails enabled
- [ ] Failed payment emails enabled
- [ ] From name set to "LocaleLore"
- [ ] Reply-to set to support@localelore.org

### Testing
- [ ] Created real subscription successfully
- [ ] Subscription appears in Stripe dashboard
- [ ] User upgraded in LocaleLore app
- [ ] Customer portal works
- [ ] Webhook events processed correctly
- [ ] Failed payment tested
- [ ] Cancellation works correctly

### Security
- [ ] Radar fraud protection enabled
- [ ] 3D Secure configured
- [ ] Dispute notifications enabled
- [ ] Statement descriptor configured

### Tax (If Applicable)
- [ ] Stripe Tax enabled (if collecting tax)
- [ ] Tax registrations entered
- [ ] Test tax calculation works

---

## 🚨 COMMON ISSUES & SOLUTIONS

### Issue 1: "No such customer" error
**Cause:** Customer ID mismatch between Stripe and your database
**Fix:**
1. Check `users` table for correct `stripe_customer_id`
2. Ensure customer is created before subscription
3. Review `create-stripe-customer` edge function

### Issue 2: Webhook signature verification fails
**Cause:** Wrong webhook secret or payload tampered
**Fix:**
1. Verify `STRIPE_WEBHOOK_SECRET` matches Stripe dashboard
2. Check webhook endpoint URL is correct
3. Ensure raw body is passed to verification (not parsed JSON)

### Issue 3: Payment succeeds but user not upgraded
**Cause:** Webhook not processing or database update failing
**Fix:**
1. Check Supabase function logs: `supabase functions logs stripe-webhooks`
2. Verify webhook events are being received
3. Check database for failed transactions
4. Ensure RLS policies allow updates

### Issue 4: Customer portal shows wrong business info
**Cause:** Business information not configured
**Fix:**
1. Go to: https://dashboard.stripe.com/settings/billing/portal
2. Update business information
3. Refresh customer portal

### Issue 5: Card declined errors
**Cause:** Various reasons (insufficient funds, fraud, etc.)
**Fix:**
1. Check Stripe Dashboard → Payments → Failed payments
2. Review decline code
3. Common codes:
   - `insufficient_funds`: Customer needs to add funds
   - `card_declined`: Generic decline, retry with different card
   - `fraudulent`: Flagged by Radar, review manually

### Issue 6: Double subscriptions created
**Cause:** User clicked subscribe button multiple times
**Fix:**
1. Add loading state to subscribe button
2. Disable button after first click
3. Check for existing subscription before creating new one

---

## 📊 MONITORING & MAINTENANCE

### Daily Checks
- [ ] Review failed payments: https://dashboard.stripe.com/payments?status=failed
- [ ] Check webhook delivery: https://dashboard.stripe.com/webhooks
- [ ] Monitor dispute notifications

### Weekly Checks
- [ ] Review subscription churn
- [ ] Check for unusual activity in Radar
- [ ] Verify payouts are processing

### Monthly Checks
- [ ] Review Stripe fees and optimize
- [ ] Check for expired cards
- [ ] Send re-engagement emails to churned users
- [ ] Review and respond to any disputes

---

## 🎉 LAUNCH READINESS

When ALL items in the Final Verification Checklist are complete:

1. **Announce subscriptions are live**
   - Update website banner
   - Send email to mailing list
   - Post on social media

2. **Monitor closely for first 48 hours**
   - Watch for webhook errors
   - Check Stripe dashboard frequently
   - Respond immediately to any payment issues

3. **Be ready for support requests**
   - Payment questions
   - Cancellation requests
   - Refund requests

---

## 📞 SUPPORT RESOURCES

**Stripe Documentation:**
- Subscriptions: https://stripe.com/docs/billing/subscriptions/overview
- Webhooks: https://stripe.com/docs/webhooks
- Customer Portal: https://stripe.com/docs/billing/subscriptions/customer-portal

**Stripe Support:**
- Email: support@stripe.com
- Chat: Available in dashboard (bottom right)
- Phone: Check dashboard for your region

**LocaleLore Support:**
- Questions about this guide: support@localelore.org
- Edge function issues: Check `supabase/functions/stripe-webhooks/`
- Frontend issues: Check `src/pages/Pricing.tsx`

---

## ✅ COMPLETION

Once you've completed all steps:

1. Check off ALL items in **Final Verification Checklist**
2. Document your Stripe configuration (Price IDs, etc.) in a secure location
3. Mark "Configure Stripe for Production" as COMPLETE in your launch checklist
4. Move on to next pre-launch task

**Estimated Stripe Setup Status:** 🟢 READY FOR PRODUCTION

---

**Last Updated:** November 20, 2025
**Next Review:** Before launch
**Document Version:** 1.0
