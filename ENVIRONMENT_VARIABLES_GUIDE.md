# Production Environment Variables Setup Guide
## LocaleLore - Complete Configuration

**Last Updated:** November 20, 2025
**Domain:** localelore.org ✅
**Support Email:** support@localelore.org ✅

---

## 🎯 OVERVIEW

This guide lists ALL environment variables needed for LocaleLore to run in production.

**Where to configure:**
- **Frontend (Vite):** `.env.production` file (NOT committed to git)
- **Backend (Supabase):** Supabase Dashboard → Project Settings → Edge Functions → Secrets

---

## 📱 FRONTEND ENVIRONMENT VARIABLES

### `.env.production` File

Create this file in your project root (it's gitignored):

```bash
# ============================================
# SUPABASE CONFIGURATION
# ============================================
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here

# ============================================
# CAPTCHA CONFIGURATION
# ============================================
# hCaptcha (Sign up at https://www.hcaptcha.com/)
VITE_HCAPTCHA_SITE_KEY=your_hcaptcha_site_key_here

# OPTIONAL: Skip CAPTCHA in development
VITE_SKIP_CAPTCHA=false  # Set to true ONLY for local development

# ============================================
# STRIPE CONFIGURATION
# ============================================
# Get from https://dashboard.stripe.com/apikeys
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_...  # ⚠️ MUST use pk_live_ for production

# ============================================
# MAP CONFIGURATION
# ============================================
# Get from https://account.mapbox.com/access-tokens/
VITE_MAPBOX_TOKEN=pk.your_mapbox_token_here

# ============================================
# ANALYTICS & MONITORING
# ============================================
# Sentry (Get from https://sentry.io/)
VITE_SENTRY_DSN=https://...@sentry.io/...
VITE_SENTRY_ENVIRONMENT=production
VITE_SENTRY_TRACES_SAMPLE_RATE=0.1  # 10% of transactions

# Google Analytics (Optional)
VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX

# ============================================
# APPLICATION CONFIGURATION
# ============================================
VITE_APP_URL=https://localelore.org
VITE_APP_NAME=LocaleLore
VITE_APP_ENV=production

# ============================================
# FEATURE FLAGS (Optional)
# ============================================
VITE_ENABLE_PWA=true
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_ERROR_TRACKING=true
```

---

## 🔧 BACKEND ENVIRONMENT VARIABLES

### Supabase Edge Function Secrets

Configure in: **Supabase Dashboard** → **Project Settings** → **Edge Functions** → **Secrets**

```bash
# ============================================
# STRIPE CONFIGURATION (CRITICAL)
# ============================================
# Get from https://dashboard.stripe.com/apikeys
STRIPE_SECRET_KEY=sk_live_...  # ⚠️ MUST use sk_live_ for production

# Get from Stripe Dashboard → Developers → Webhooks
STRIPE_WEBHOOK_SECRET=whsec_...  # Created when you configure webhook endpoint

# Product Price IDs (from Stripe Dashboard → Products)
STRIPE_PRICE_ID_BASIC=price_...  # $9.99/month Basic plan
STRIPE_PRICE_ID_PREMIUM=price_...  # $19.99/month Premium plan
STRIPE_PRICE_ID_PRO=price_...  # $29.99/month Pro plan

# One-Time Purchase Price IDs (if applicable)
STRIPE_PRICE_ID_FEATURE_PACK=price_...  # $49.99 one-time
STRIPE_PRICE_ID_ANALYTICS=price_...  # $99.99 one-time

# ============================================
# SUPABASE CONFIGURATION
# ============================================
# These should already be set by Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key  # Has admin access

# ============================================
# CAPTCHA VERIFICATION
# ============================================
# Get from https://dashboard.hcaptcha.com/settings
HCAPTCHA_SECRET_KEY=0x...  # Secret key for backend verification

# Optional: Use reCAPTCHA instead
# RECAPTCHA_SECRET_KEY=your_recaptcha_secret
# RECAPTCHA_MIN_SCORE=0.5  # For reCAPTCHA v3
# CAPTCHA_PROVIDER=hcaptcha  # or 'recaptcha'

# OPTIONAL: Skip CAPTCHA in development
# SKIP_CAPTCHA=true  # NEVER set in production

# ============================================
# EMAIL SERVICE (CRITICAL FOR NOTIFICATIONS)
# ============================================
# SendGrid (Recommended - https://sendgrid.com/)
SENDGRID_API_KEY=SG.your_api_key_here
SENDGRID_FROM_EMAIL=noreply@localelore.org
SENDGRID_FROM_NAME=LocaleLore

# OR Resend (Alternative - https://resend.com/)
# RESEND_API_KEY=re_your_api_key_here
# RESEND_FROM_EMAIL=noreply@localelore.org

# OR AWS SES (Alternative)
# AWS_SES_REGION=us-east-1
# AWS_SES_ACCESS_KEY_ID=your_access_key
# AWS_SES_SECRET_ACCESS_KEY=your_secret_key
# AWS_SES_FROM_EMAIL=noreply@localelore.org

# ============================================
# EMAIL TEMPLATES
# ============================================
# SendGrid Template IDs (create in SendGrid dashboard)
SENDGRID_TEMPLATE_WELCOME=d-...
SENDGRID_TEMPLATE_EMAIL_VERIFY=d-...
SENDGRID_TEMPLATE_PASSWORD_RESET=d-...
SENDGRID_TEMPLATE_FRIEND_REQUEST=d-...
SENDGRID_TEMPLATE_COMMENT_NOTIFICATION=d-...
SENDGRID_TEMPLATE_LIKE_NOTIFICATION=d-...
SENDGRID_TEMPLATE_ACHIEVEMENT_UNLOCKED=d-...
SENDGRID_TEMPLATE_SUBSCRIPTION_CONFIRMED=d-...
SENDGRID_TEMPLATE_PAYMENT_FAILED=d-...
SENDGRID_TEMPLATE_SUBSCRIPTION_CANCELLED=d-...

# ============================================
# THIRD-PARTY APIS
# ============================================
# OpenAI (for AI features like categorization, if used)
# OPENAI_API_KEY=sk-...
# OPENAI_MODEL=gpt-4

# Mapbox (for server-side geocoding, if needed)
# MAPBOX_SECRET_TOKEN=sk.your_mapbox_secret_token

# ============================================
# MONITORING & LOGGING
# ============================================
# Sentry (Error tracking)
SENTRY_DSN=https://...@sentry.io/...
SENTRY_ENVIRONMENT=production
SENTRY_TRACES_SAMPLE_RATE=0.1

# ============================================
# SECURITY
# ============================================
# JWT Secret (for custom JWT operations, if needed)
# JWT_SECRET=your_very_long_random_secret_key_here

# Encryption keys (if encrypting sensitive data)
# ENCRYPTION_KEY=your_encryption_key_here

# ============================================
# RATE LIMITING (Database-backed, no config needed)
# ============================================
# Rate limits are configured in code via rate-limit.ts
# No environment variables needed

# ============================================
# FEATURE FLAGS
# ============================================
ENABLE_EMAIL_NOTIFICATIONS=true
ENABLE_AI_FEATURES=false  # Set to true when AI features are ready
ENABLE_MOBILE_APP=true  # For Capacitor mobile builds
ENABLE_ANALYTICS=true

# ============================================
# BUSINESS CONFIGURATION
# ============================================
SUPPORT_EMAIL=support@localelore.org  # ✅ Already configured
LEGAL_EMAIL=legal@localelore.org  # TODO: Set up forwarding
PRIVACY_EMAIL=privacy@localelore.org  # TODO: Set up forwarding
SECURITY_EMAIL=security@localelore.org  # TODO: Set up forwarding

# ============================================
# EXTERNAL SERVICES
# ============================================
# CDN Configuration (if using a CDN like Cloudflare)
# CDN_URL=https://cdn.localelore.org
# CDN_API_KEY=your_cdn_api_key

# ============================================
# DEVELOPMENT/TESTING (DO NOT SET IN PRODUCTION)
# ============================================
# NODE_ENV=production  # Automatically set by platform
# DEBUG=false
# SKIP_CAPTCHA=false  # NEVER TRUE in production
```

---

## 🔑 HOW TO SET SUPABASE SECRETS

### Using Supabase Dashboard (Recommended):

1. Go to https://supabase.com/dashboard
2. Select your project
3. Navigate to: **Project Settings** → **Edge Functions**
4. Click **Secrets** tab
5. Click **Add New Secret**
6. Enter name and value
7. Click **Save**

### Using Supabase CLI (Alternative):

```bash
# Set a single secret
supabase secrets set STRIPE_SECRET_KEY=sk_live_...

# Set multiple secrets from file
supabase secrets set --env-file .env.production.secrets

# List all secrets (values hidden)
supabase secrets list

# Unset a secret
supabase secrets unset STRIPE_SECRET_KEY
```

---

## ✅ CONFIGURATION CHECKLIST

### Frontend Variables (in `.env.production`)

- [ ] ✅ `VITE_SUPABASE_URL` - From Supabase project settings
- [ ] ✅ `VITE_SUPABASE_ANON_KEY` - From Supabase project settings
- [ ] ⚠️ `VITE_HCAPTCHA_SITE_KEY` - Sign up at hcaptcha.com
- [ ] ⚠️ `VITE_STRIPE_PUBLISHABLE_KEY` - Use `pk_live_` for production
- [ ] ✅ `VITE_MAPBOX_TOKEN` - Should already be configured
- [ ] ⚠️ `VITE_SENTRY_DSN` - If using Sentry (recommended)
- [ ] ✅ `VITE_APP_URL=https://localelore.org`

### Backend Secrets (in Supabase Dashboard)

**CRITICAL (Must configure before launch):**
- [ ] ⚠️ `STRIPE_SECRET_KEY` - Use `sk_live_` for production
- [ ] ⚠️ `STRIPE_WEBHOOK_SECRET` - From Stripe webhook configuration
- [ ] ⚠️ `STRIPE_PRICE_ID_BASIC` - Create product in Stripe
- [ ] ⚠️ `STRIPE_PRICE_ID_PREMIUM` - Create product in Stripe
- [ ] ⚠️ `STRIPE_PRICE_ID_PRO` - Create product in Stripe
- [ ] ⚠️ `HCAPTCHA_SECRET_KEY` - From hCaptcha dashboard

**HIGH PRIORITY (Should configure before launch):**
- [ ] ⚠️ `SENDGRID_API_KEY` - For email notifications
- [ ] ⚠️ `SENDGRID_FROM_EMAIL=noreply@localelore.org`
- [ ] ⚠️ `SENTRY_DSN` - For error tracking

**MEDIUM PRIORITY (Can configure post-launch):**
- [ ] Email template IDs (SendGrid)
- [ ] Feature flags as needed

**ALREADY CONFIGURED:**
- [x] `SUPABASE_URL` - Auto-configured
- [x] `SUPABASE_ANON_KEY` - Auto-configured
- [x] `SUPABASE_SERVICE_ROLE_KEY` - Auto-configured

---

## 🚨 CRITICAL WARNINGS

### ⚠️ NEVER Commit These to Git:
- `.env.production` file
- Any file containing API keys or secrets
- Stripe secret keys (`sk_live_*`, `sk_test_*`)
- Database passwords
- Service role keys

### ⚠️ Production vs Test Mode:
- **Stripe:** Use `pk_live_` and `sk_live_` keys (NOT `pk_test_` or `sk_test_`)
- **CAPTCHA:** Use production site key (not test/localhost key)
- **Supabase:** Use production project (not staging/dev project)

### ⚠️ Security Best Practices:
- Rotate secrets every 90 days
- Use different keys for staging and production
- Never share secrets in Slack/email/support tickets
- Use environment-specific configs
- Monitor for leaked secrets (GitHub secret scanning)

---

## 🔄 HOW TO GET EACH KEY

### 1. Supabase Keys
**Location:** Supabase Dashboard → Project Settings → API
- `VITE_SUPABASE_URL`: Your project URL
- `VITE_SUPABASE_ANON_KEY`: Project API keys → anon (public)
- `SUPABASE_SERVICE_ROLE_KEY`: Project API keys → service_role (secret)

### 2. Stripe Keys
**Location:** https://dashboard.stripe.com/apikeys
1. Switch to **Live mode** (toggle in top right)
2. Go to **Developers** → **API keys**
3. Copy **Publishable key** (`pk_live_...`) for frontend
4. Reveal and copy **Secret key** (`sk_live_...`) for backend

### 3. Stripe Price IDs
**Location:** https://dashboard.stripe.com/products
1. Create product: **Basic Plan** - $9.99/month recurring
2. Create product: **Premium Plan** - $19.99/month recurring
3. Create product: **Pro Plan** - $29.99/month recurring
4. Copy each price ID (starts with `price_...`)

### 4. Stripe Webhook Secret
**Location:** https://dashboard.stripe.com/webhooks
1. Click **Add endpoint**
2. Endpoint URL: `https://your-project.supabase.co/functions/v1/stripe-webhooks`
3. Select events: `checkout.session.completed`, `customer.subscription.*`, `invoice.*`
4. Add endpoint
5. Click endpoint → **Signing secret** → Reveal → Copy (`whsec_...`)

### 5. hCaptcha Keys
**Location:** https://dashboard.hcaptcha.com/
1. Sign up for free account
2. Add new site: `localelore.org`
3. Copy **Sitekey** for frontend
4. Copy **Secret** for backend

### 6. SendGrid API Key
**Location:** https://app.sendgrid.com/settings/api_keys
1. Sign up for account (free tier: 100 emails/day)
2. Go to **Settings** → **API Keys**
3. Click **Create API Key**
4. Name: "LocaleLore Production"
5. Permissions: **Full Access**
6. Create & Copy key (starts with `SG.`)

### 7. Mapbox Token
**Location:** https://account.mapbox.com/access-tokens/
1. Should already have this configured
2. If not: Create token with public scopes
3. Add `localelore.org` to allowed URLs

### 8. Sentry DSN
**Location:** https://sentry.io/
1. Sign up for account (free tier available)
2. Create new project: **LocaleLore**
3. Platform: **React**
4. Copy DSN from project settings

---

## 🧪 TESTING CONFIGURATION

### Verify Frontend Variables:

```bash
# Build with production env
npm run build

# Check if build includes correct API URLs
grep -r "supabase" dist/
grep -r "stripe" dist/

# Should see localelore.org and live/production keys
```

### Verify Backend Secrets:

```bash
# List all configured secrets
supabase secrets list

# Expected output should include:
# STRIPE_SECRET_KEY
# STRIPE_WEBHOOK_SECRET
# HCAPTCHA_SECRET_KEY
# SENDGRID_API_KEY
# etc.
```

### Test Stripe Configuration:

```bash
# Use Stripe CLI to test webhook
stripe listen --forward-to https://your-project.supabase.co/functions/v1/stripe-webhooks

# Trigger test event
stripe trigger checkout.session.completed
```

---

## 📝 ENVIRONMENT-SPECIFIC CONFIGS

### Local Development (`.env.local`):
```bash
VITE_SUPABASE_URL=http://localhost:54321
VITE_SKIP_CAPTCHA=true
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

### Staging (`.env.staging`):
```bash
VITE_APP_URL=https://staging.localelore.org
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...  # Use test mode
```

### Production (`.env.production`):
```bash
VITE_APP_URL=https://localelore.org
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_...  # Use live mode
VITE_SKIP_CAPTCHA=false  # Never skip in production
```

---

## 🆘 TROUBLESHOOTING

### "Supabase URL not defined"
→ Check `.env.production` file exists and has `VITE_SUPABASE_URL`

### "Stripe publishable key invalid"
→ Ensure using `pk_live_` (not `pk_test_`) in production

### "hCaptcha verification failed"
→ Check `VITE_HCAPTCHA_SITE_KEY` (frontend) and `HCAPTCHA_SECRET_KEY` (backend) match

### "Email not sending"
→ Verify `SENDGRID_API_KEY` is set in Supabase secrets
→ Check SendGrid dashboard for errors
→ Verify `FROM_EMAIL` is verified in SendGrid

### "Webhook not receiving events"
→ Check webhook endpoint URL is correct
→ Verify `STRIPE_WEBHOOK_SECRET` matches Stripe dashboard
→ Test with Stripe CLI: `stripe listen --forward-to ...`

---

## ✅ FINAL VERIFICATION

Before launch, verify ALL critical variables are set:

```bash
# Frontend
cat .env.production | grep -E "(SUPABASE_URL|STRIPE|HCAPTCHA|APP_URL)"

# Backend (run this in Supabase SQL Editor)
SELECT name FROM supabase_functions.secrets;
```

**Expected Secrets:**
- `STRIPE_SECRET_KEY` ✅
- `STRIPE_WEBHOOK_SECRET` ✅
- `STRIPE_PRICE_ID_BASIC` ✅
- `STRIPE_PRICE_ID_PREMIUM` ✅
- `STRIPE_PRICE_ID_PRO` ✅
- `HCAPTCHA_SECRET_KEY` ✅
- `SENDGRID_API_KEY` ✅

If any are missing → **DO NOT LAUNCH**

---

## 📞 SUPPORT

**Questions about configuration?**
- Email: support@localelore.org
- Check: STRIPE_PRODUCTION_SETUP.md (for Stripe-specific setup)
- Check: FINAL_RELEASE_ASSESSMENT.md (for overall launch checklist)

---

**Last Updated:** November 20, 2025
**Status:** Ready for configuration
**Next Step:** Configure all ⚠️ marked variables before launch
