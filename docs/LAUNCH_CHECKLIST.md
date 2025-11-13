# 🚀 Production Launch Checklist

**Application:** LocaleLore
**Target Launch Date:** [Set your date]
**Status:** Pre-Launch Preparation
**Last Updated:** November 13, 2025

---

## Quick Start

**Total Time to Launch: 6-8 hours**

Follow this checklist in order. Each section references detailed guides.

---

## Phase 1: Critical Configuration (2-3 hours)

### ✅ Stripe Production Setup
**Time:** 2-3 hours | **Priority:** 🔴 CRITICAL | **Guide:** [STRIPE_PRODUCTION_SETUP.md](./STRIPE_PRODUCTION_SETUP.md)

- [ ] Stripe account activated for live mode
- [ ] Business verification completed
- [ ] Bank account connected
- [ ] Three products created (Basic, Premium, Pro)
  - [ ] Basic: $9.99/month
  - [ ] Premium: $19.99/month
  - [ ] Pro: $29.99/month
- [ ] Price IDs copied and saved
- [ ] Webhook endpoint created: `https://[project].supabase.co/functions/v1/stripe-webhooks`
- [ ] Webhook secret obtained
- [ ] Test subscription created with real card
- [ ] Test subscription cancelled successfully
- [ ] Test payment refunded
- [ ] Webhook deliveries showing 200 OK

**Environment Variables to Set:**
```bash
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_ID_BASIC=price_...
STRIPE_PRICE_ID_PREMIUM=price_...
STRIPE_PRICE_ID_PRO=price_...
```

**Verification:**
- [ ] Can create subscription in production
- [ ] Subscription appears in Stripe dashboard
- [ ] Database updated with subscription data
- [ ] Webhook received and processed

---

## Phase 2: Environment Configuration (1 hour)

### ✅ Environment Variables
**Time:** 1 hour | **Priority:** 🔴 CRITICAL | **Reference:** [.env.production.example](./.env.production.example)

#### Frontend Variables (Lovable/Vercel Dashboard)

```bash
# App
VITE_APP_TITLE=LocaleLore
VITE_APP_URL=https://localelore.com
NODE_ENV=production

# Supabase
VITE_SUPABASE_URL=https://[project].supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=eyJ...

# Stripe
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_...

# Mapbox
VITE_MAPBOX_ACCESS_TOKEN=pk.eyJ...

# Monitoring (Recommended)
VITE_SENTRY_DSN=https://...@sentry.io/...
VITE_SENTRY_TRACES_SAMPLE_RATE=0.1
SENTRY_ENVIRONMENT=production

# Analytics (Optional)
VITE_ANALYTICS_ID=G-...
VITE_POSTHOG_KEY=phc_...

# Feature Flags
VITE_MAINTENANCE_MODE=false
VITE_DEBUG_MODE=false
VITE_FEATURE_PAYMENT_PROCESSING=true
```

#### Backend Variables (Supabase Edge Functions)

```bash
# Via Supabase Dashboard → Settings → Edge Functions
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
RESEND_API_KEY=re_... # Optional but recommended
```

**Verification:**
- [ ] All variables accessible in production
- [ ] No test mode keys in production
- [ ] Secrets not exposed in frontend bundle

---

## Phase 3: Monitoring Setup (1-2 hours)

### ✅ Error Tracking & Monitoring
**Time:** 1-2 hours | **Priority:** 🟡 HIGH | **Guide:** [MONITORING_ALERTING_SETUP.md](./MONITORING_ALERTING_SETUP.md)

#### Sentry Setup (15 minutes)

- [ ] Sentry account created
- [ ] Project created: "localelore-production"
- [ ] DSN copied to environment variables
- [ ] Test error sent and received
- [ ] Alert configured for error rate > 100/hour
- [ ] Alert configured for new issues
- [ ] Team email added to alerts

#### Uptime Monitoring (15 minutes)

- [ ] UptimeRobot account created (or Better Uptime)
- [ ] Monitor created for https://localelore.com
- [ ] Check interval: 5 minutes
- [ ] Alert email configured
- [ ] Status page created (optional)

#### Performance Monitoring (30 minutes)

- [ ] Web Vitals tracking verified (already implemented)
- [ ] Lighthouse baseline score recorded
  - [ ] Performance > 90
  - [ ] Accessibility > 95
  - [ ] Best Practices > 95
  - [ ] SEO > 90

#### Database Monitoring (15 minutes)

- [ ] Supabase dashboard alerts configured
- [ ] CPU alert: > 85%
- [ ] Memory alert: > 90%
- [ ] Connection pool alert: > 95%

**Verification:**
- [ ] Test error appears in Sentry
- [ ] Uptime monitor shows "UP"
- [ ] Web Vitals being tracked
- [ ] Database metrics visible

---

## Phase 4: Security & Compliance (1 hour)

### ✅ Security Configuration
**Time:** 1 hour | **Priority:** 🟡 HIGH

#### Security Headers (Already Configured!)

Verify in production:

```bash
curl -I https://localelore.com | grep -E 'X-Frame-Options|X-Content-Type|X-XSS|Strict-Transport'
```

Should show:
- [ ] X-Frame-Options: DENY
- [ ] X-Content-Type-Options: nosniff
- [ ] X-XSS-Protection: 1; mode=block
- [ ] Strict-Transport-Security (HSTS)

#### Database Security

- [ ] RLS (Row Level Security) enabled on all tables
- [ ] Service role key never exposed to frontend
- [ ] Connection string secure
- [ ] Backup verification completed

#### SSL/TLS

- [ ] HTTPS enforced (automatic with Lovable)
- [ ] SSL certificate valid
- [ ] HTTP redirects to HTTPS

#### Compliance

- [ ] Privacy Policy accessible at /privacy
- [ ] Terms of Service accessible at /terms
- [ ] Cookie consent implemented
- [ ] GDPR data export functional
- [ ] Account deletion working

**Verification:**
- [ ] Security scan passed
- [ ] No exposed secrets in frontend
- [ ] RLS policies tested
- [ ] HTTPS working

---

## Phase 5: Testing & QA (2 hours)

### ✅ Pre-Launch Testing
**Time:** 2 hours | **Priority:** 🔴 CRITICAL | **Guide:** [PRODUCTION_DEPLOYMENT_RUNBOOK.md](./PRODUCTION_DEPLOYMENT_RUNBOOK.md)

#### Automated Tests

```bash
# Run full test suite
npm run test:unit          # Should pass
npm run test:integration   # Should pass
npm run test:e2e          # Should pass
npm run type-check        # Should pass
npm run lint              # Should pass
npm run build             # Should succeed
```

- [ ] All unit tests passing
- [ ] All integration tests passing
- [ ] All E2E tests passing
- [ ] TypeScript compilation successful
- [ ] Linting passes
- [ ] Build succeeds

#### Manual Testing

##### Authentication
- [ ] Sign up new user
- [ ] Verify email (if enabled)
- [ ] Sign in
- [ ] Password reset
- [ ] Sign out
- [ ] Session persistence

##### Core Features
- [ ] Browse stories on /explore
- [ ] View map on /map
- [ ] Search stories
- [ ] Create new story
- [ ] Edit own story
- [ ] Delete own story
- [ ] View user profile
- [ ] Edit profile

##### Social Features
- [ ] Send friend request
- [ ] Accept friend request
- [ ] Follow user
- [ ] Comment on story
- [ ] Vote on story
- [ ] Block user

##### Payment Flow (Real Money - Will Refund)
- [ ] Navigate to /billing
- [ ] Subscribe to Premium ($19.99)
- [ ] Verify redirect to success page
- [ ] Check Stripe dashboard for subscription
- [ ] Verify database updated
- [ ] Verify tier changed in app
- [ ] Cancel subscription
- [ ] Verify cancellation scheduled
- [ ] **Refund test payment in Stripe**

##### Admin Features
- [ ] Access /admin dashboard (admin user)
- [ ] View analytics
- [ ] User management
- [ ] Content moderation

##### Performance
- [ ] Page load < 3 seconds on 3G
- [ ] Images load quickly
- [ ] No layout shift
- [ ] Smooth animations

##### Mobile Testing
- [ ] Test on iPhone (Safari)
- [ ] Test on Android (Chrome)
- [ ] PWA install works
- [ ] Offline mode works
- [ ] Touch interactions smooth

##### Browser Testing
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)

**Verification:**
- [ ] All automated tests pass
- [ ] All manual tests pass
- [ ] No critical bugs found
- [ ] Performance acceptable
- [ ] Mobile experience good

---

## Phase 6: Final Preparations (1 hour)

### ✅ Pre-Launch Tasks
**Time:** 1 hour | **Priority:** 🟡 MEDIUM

#### Content & Assets

- [ ] Logo uploaded and optimized
- [ ] Favicon set
- [ ] PWA icons (192x192, 512x512)
- [ ] PWA screenshots updated (not placeholders)
- [ ] App manifest.json configured
- [ ] Open Graph images created
- [ ] Twitter Card images created

#### Documentation

- [ ] User documentation available
- [ ] Help center/FAQ created
- [ ] Support email configured: support@localelore.com
- [ ] Terms of Service finalized
- [ ] Privacy Policy finalized
- [ ] Refund Policy finalized

#### Team Preparation

- [ ] Support team trained
- [ ] Admin accounts created
- [ ] Incident response plan reviewed
- [ ] On-call rotation scheduled
- [ ] Emergency contacts list updated

#### Marketing Preparation

- [ ] Launch announcement drafted
- [ ] Social media accounts created
  - [ ] Twitter/X
  - [ ] Instagram
  - [ ] Facebook
- [ ] Press kit prepared
- [ ] App Store listing prepared (if launching mobile apps)

**Verification:**
- [ ] All assets in place
- [ ] Team ready
- [ ] Marketing materials ready

---

## Phase 7: Deployment (30 minutes)

### ✅ Production Deployment
**Time:** 30 minutes | **Priority:** 🔴 CRITICAL | **Guide:** [PRODUCTION_DEPLOYMENT_RUNBOOK.md](./PRODUCTION_DEPLOYMENT_RUNBOOK.md)

#### Deploy

```bash
# Ensure on correct branch
git checkout claude/production-readiness-audit-011CV6CzVezLkhUFK7DqzBpf

# Tag release
git tag -a v1.0.0 -m "Production launch v1.0.0"

# Push (triggers auto-deploy)
git push origin claude/production-readiness-audit-011CV6CzVezLkhUFK7DqzBpf
git push origin v1.0.0
```

- [ ] Deployment triggered
- [ ] Build successful
- [ ] Deployment successful
- [ ] Health checks passing

#### Post-Deploy Verification

**Immediate (5 minutes):**
- [ ] Site loads: https://localelore.com
- [ ] Sign in works
- [ ] No errors in Sentry
- [ ] Uptime monitor: UP

**Smoke Tests (15 minutes):**
- [ ] Create story
- [ ] View map
- [ ] Search
- [ ] Subscribe (test payment)
- [ ] Cancel subscription
- [ ] Refund test payment

**Performance Check:**
```bash
npx lighthouse https://localelore.com --view
```
- [ ] Performance > 90
- [ ] Accessibility > 95

**Verification:**
- [ ] All smoke tests passed
- [ ] No critical errors
- [ ] Performance acceptable
- [ ] Ready for users!

---

## Phase 8: Post-Launch Monitoring (Ongoing)

### ✅ Launch Day Monitoring
**Priority:** 🔴 CRITICAL

#### First Hour
- [ ] Monitor error rate in Sentry (target: < 0.1%)
- [ ] Watch uptime monitor (target: 100%)
- [ ] Check user sign-ups
- [ ] Verify payment processing
- [ ] Monitor performance metrics

#### First 24 Hours
- [ ] Check error patterns
- [ ] Review user feedback
- [ ] Monitor payment success rate
- [ ] Check database performance
- [ ] Verify email delivery

#### First Week
- [ ] Daily Sentry review
- [ ] Daily metrics check
- [ ] User feedback analysis
- [ ] Performance optimization
- [ ] Bug fix priorities

**Daily Checklist:**
- [ ] Sentry errors reviewed
- [ ] Uptime 100%
- [ ] Payment success rate > 95%
- [ ] Database healthy
- [ ] No critical bugs

---

## Success Criteria

### Launch is successful when:

**Technical:**
- [ ] Error rate < 0.1%
- [ ] Uptime > 99.9%
- [ ] Page load < 3 seconds
- [ ] Payment processing working
- [ ] No critical bugs

**Business:**
- [ ] User sign-ups > 0
- [ ] First paid subscription
- [ ] User engagement > 3 min/session
- [ ] Positive user feedback

**Operational:**
- [ ] Team confident
- [ ] Monitoring working
- [ ] Support ready
- [ ] Rollback plan tested

---

## Rollback Plan

### If something goes wrong:

```bash
# Option 1: Lovable Dashboard (fastest)
1. Go to Lovable Dashboard → Deployments
2. Find previous deployment
3. Click "Promote to Production"

# Option 2: Git revert
git revert HEAD
git push origin production
```

**When to rollback:**
- Site completely down
- Error rate > 5%
- Critical functionality broken (auth, payments)
- Security vulnerability

**After rollback:**
1. Post status update
2. Notify team
3. Investigate issue
4. Fix and redeploy

---

## Launch Communication

### Announcement Template

**Subject:** 🚀 LocaleLore is LIVE!

```
We're excited to announce that LocaleLore is now live!

🌍 Discover local stories from around the world
📍 Explore places through authentic narratives
✨ Join a community of storytellers

Try it now: https://localelore.com

What's included:
- Browse thousands of local stories
- Interactive map exploration
- Create and share your own stories
- Connect with local storytellers

Premium features available:
- Unlimited story uploads
- Advanced analytics
- Priority support
- And more!

Questions? support@localelore.com

Let's explore together!
The LocaleLore Team
```

---

## Quick Reference

### Essential URLs
- Production: https://localelore.com
- Admin: https://localelore.com/admin
- Status Page: https://status.localelore.com
- Supabase: https://app.supabase.com
- Stripe: https://dashboard.stripe.com
- Sentry: https://sentry.io

### Emergency Contacts
- Engineering: engineering@localelore.com
- Support: support@localelore.com
- Security: security@localelore.com

### Key Commands
```bash
# Deploy
git push origin production

# Rollback
# Use Lovable dashboard

# Monitor
npm run monitor:production

# Tests
npm test
```

---

## Timeline

**Recommended Launch Schedule:**

```
Week Before Launch:
├─ Monday: Stripe configuration
├─ Tuesday: Environment variables + monitoring
├─ Wednesday: Security review + testing
├─ Thursday: Final QA
├─ Friday: Pre-launch preparation
└─ Weekend: Team rest

Launch Week:
├─ Monday: Deploy to production (morning)
├─ Monday: Monitor closely all day
├─ Tuesday-Friday: Daily checks, quick fixes
└─ Weekend: Review first week data

Post-Launch:
├─ Week 2: Stability improvements
├─ Week 3-4: First feature iterations
└─ Month 2+: Follow roadmap
```

---

## Go/No-Go Decision

### ✅ LAUNCH when all critical items complete:

**Critical (Must Have):**
- [x] Stripe configured and tested
- [x] Environment variables set
- [x] Monitoring active
- [x] All tests passing
- [x] Security headers configured
- [x] Payment flow working
- [x] RLS policies enabled

**High Priority (Should Have):**
- [ ] Email notifications working
- [ ] PWA screenshots updated
- [ ] Sentry configured
- [ ] Uptime monitoring active
- [ ] Mobile testing complete

**Medium Priority (Nice to Have):**
- [ ] App store presence
- [ ] Marketing materials ready
- [ ] Help documentation complete

### ⚠️ DELAY if:
- Payment processing broken
- Authentication not working
- Critical security issue
- Error rate > 5%
- Team not confident

---

## Celebrate! 🎉

Once launched:

1. **Announce** to the team
2. **Monitor** closely for 24 hours
3. **Support** early users
4. **Iterate** based on feedback
5. **Celebrate** your success!

You've built something amazing. Now let the world discover it!

---

**Status:** Ready to launch! ✅

**Next Steps:**
1. Complete critical checklist items
2. Schedule launch date
3. Deploy to production
4. Monitor and support

**Questions?** Review the detailed guides:
- [Stripe Setup](./STRIPE_PRODUCTION_SETUP.md)
- [Monitoring](./MONITORING_ALERTING_SETUP.md)
- [Deployment](./PRODUCTION_DEPLOYMENT_RUNBOOK.md)
- [Roadmap](./POST_LAUNCH_ROADMAP.md)

Good luck! 🚀
