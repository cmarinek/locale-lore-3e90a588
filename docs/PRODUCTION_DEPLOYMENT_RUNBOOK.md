# Production Deployment Runbook

**Last Updated:** November 13, 2025
**Version:** 1.0.0
**Owner:** Engineering Team

---

## 📋 Table of Contents

1. [Quick Reference](#quick-reference)
2. [Pre-Deployment Checklist](#pre-deployment-checklist)
3. [Deployment Steps](#deployment-steps)
4. [Post-Deployment Verification](#post-deployment-verification)
5. [Rollback Procedure](#rollback-procedure)
6. [Common Issues](#common-issues)
7. [Emergency Contacts](#emergency-contacts)

---

## Quick Reference

### Critical URLs

| Service | URL | Access |
|---------|-----|--------|
| Production App | https://localelore.com | Public |
| Admin Dashboard | https://localelore.com/admin | Admin only |
| Supabase Dashboard | https://app.supabase.com | Team |
| Stripe Dashboard | https://dashboard.stripe.com | Finance + Admin |
| Sentry | https://sentry.io | Engineering |
| Lovable Deploy | https://lovable.dev | Engineering |
| Status Page | https://status.localelore.com | Public |

### Deployment Timeline

```
Pre-deployment checks: 30 minutes
Deployment: 5-10 minutes (automatic)
Smoke tests: 15 minutes
Full verification: 30 minutes
---
Total: ~90 minutes for safe deployment
```

### Emergency Stop

```bash
# If something goes wrong during deployment:
1. Contact: admin@localelore.com
2. Rollback via: Lovable dashboard → Previous deployment → Promote
3. Post in: #incidents Slack channel
4. Update: status.localelore.com
```

---

## Pre-Deployment Checklist

### T-24 Hours Before Deployment

#### Code Quality

- [ ] All tests passing (`npm test`)
  ```bash
  npm run test:unit
  npm run test:integration
  npm run test:e2e
  ```

- [ ] TypeScript compilation successful
  ```bash
  npm run type-check
  ```

- [ ] Linting passes with no errors
  ```bash
  npm run lint
  ```

- [ ] Build succeeds locally
  ```bash
  npm run build
  ```

- [ ] Bundle size acceptable (< 500KB main bundle)
  ```bash
  npm run build
  npx vite-bundle-visualizer
  # Check that main bundle is under size limit
  ```

#### Database

- [ ] Database migrations tested in staging
  ```bash
  # Test migrations
  supabase db reset --db-url [staging-url]
  ```

- [ ] Backup created and verified
  ```bash
  # Verify latest backup exists
  # Navigate to Supabase → Database → Backups
  ```

- [ ] RLS policies reviewed and tested
  ```sql
  -- Test RLS in staging
  SET ROLE authenticated;
  SELECT * FROM subscriptions; -- Should only show user's own data
  ```

#### Environment Configuration

- [ ] All production environment variables set
  ```bash
  # Verify in Lovable dashboard:
  VITE_SUPABASE_URL=✅
  VITE_SUPABASE_PUBLISHABLE_KEY=✅
  VITE_STRIPE_PUBLISHABLE_KEY=✅ (starts with pk_live_)
  VITE_SENTRY_DSN=✅
  VITE_MAPBOX_ACCESS_TOKEN=✅
  ```

- [ ] Supabase Edge Function secrets configured
  ```bash
  # Verify in Supabase dashboard:
  STRIPE_SECRET_KEY=✅ (starts with sk_live_)
  STRIPE_WEBHOOK_SECRET=✅
  RESEND_API_KEY=✅ (optional but recommended)
  ```

- [ ] Feature flags set correctly
  ```bash
  VITE_MAINTENANCE_MODE=false
  VITE_DEBUG_MODE=false
  VITE_FEATURE_PAYMENT_PROCESSING=true
  ```

#### Third-Party Services

- [ ] Stripe webhooks configured and tested
  - Endpoint: `https://[project].supabase.co/functions/v1/stripe-webhooks`
  - Status: Active
  - Recent deliveries: 200 OK

- [ ] Mapbox token valid and not rate-limited

- [ ] Sentry project created and DSN active

- [ ] Email service configured (Resend)

#### Documentation

- [ ] CHANGELOG.md updated with release notes

- [ ] Breaking changes documented

- [ ] API changes communicated to team

- [ ] Known issues logged

### T-1 Hour Before Deployment

#### Final Checks

- [ ] No one else is deploying
  ```bash
  # Check #deployments Slack channel
  ```

- [ ] Monitoring systems healthy
  - [ ] Sentry: No ongoing incidents
  - [ ] Uptime monitor: 100% uptime
  - [ ] Database: Normal CPU/memory

- [ ] Support team notified of deployment window

- [ ] Stakeholders aware (if major release)

#### Smoke Test Preparation

- [ ] Test accounts ready
  - Admin: `admin-test@localelore.com`
  - User: `user-test@localelore.com`
  - Contributor: `contributor-test@localelore.com`

- [ ] Test payment method ready (real card for Stripe live testing)

- [ ] Browser testing environments ready
  - Chrome (latest)
  - Firefox (latest)
  - Safari (latest)
  - Mobile Chrome
  - Mobile Safari

---

## Deployment Steps

### Step 1: Create Release Branch

```bash
# Ensure you're on the latest main/production branch
git checkout main
git pull origin main

# Create release branch
git checkout -b release/v1.0.0

# Tag the release
git tag -a v1.0.0 -m "Production release v1.0.0"
git push origin v1.0.0
```

### Step 2: Trigger Deployment

#### Option A: Lovable Auto-Deploy

```bash
# Simply push to production branch
git push origin release/v1.0.0:production

# Lovable will automatically:
# 1. Run build
# 2. Deploy to production
# 3. Update DNS
```

**Monitor deployment:**
- Navigate to Lovable dashboard
- Watch build logs
- Wait for "Deployment successful" message
- Typical deployment time: 5-10 minutes

#### Option B: Manual Deploy Script

```bash
# Use production deploy script
npm run deploy:production

# This script:
# 1. Runs all tests
# 2. Builds production bundle
# 3. Deploys to Lovable
# 4. Runs smoke tests
```

### Step 3: Database Migrations (if needed)

```bash
# Migrations run automatically via GitHub Actions
# OR manually trigger:

supabase db push --db-url [production-url]

# Verify migrations applied:
supabase migration list --db-url [production-url]
```

### Step 4: Edge Functions Deployment (if changed)

```bash
# Deploy all edge functions
supabase functions deploy

# OR deploy specific function
supabase functions deploy stripe-webhooks
```

### Step 5: Monitor Deployment

**Watch these in real-time:**

1. **Build Logs** (Lovable dashboard)
   - Look for: "Build completed successfully"
   - Check for warnings (investigate later)

2. **Deployment Status**
   - Status: "Live"
   - Health checks: Passing

3. **Error Tracking** (Sentry)
   - New errors? Investigate immediately
   - Error rate spike? Consider rollback

---

## Post-Deployment Verification

### Immediate Checks (T+5 minutes)

#### Smoke Tests

**Test 1: Homepage Loads**
```bash
curl -I https://localelore.com
# Expected: HTTP/2 200
```

**Test 2: Authentication**
- [ ] Navigate to `/auth`
- [ ] Sign in with test account
- [ ] Verify redirect to dashboard
- [ ] Check session persists on refresh

**Test 3: Core Features**
- [ ] View stories on `/explore`
- [ ] Open map on `/map`
- [ ] Search works on `/search`
- [ ] Profile loads on `/profile`

**Test 4: Critical API Endpoints**
```javascript
// Open browser console on site
fetch('/api/health').then(r => r.json()).then(console.log)
// Expected: { status: 'healthy', timestamp: '...' }
```

**Test 5: Database Connection**
- [ ] Create a new story
- [ ] Verify it appears in feed
- [ ] Edit the story
- [ ] Delete the story

**Test 6: Real-time Features**
- [ ] Open app in two browsers
- [ ] Perform action in one (e.g., create story)
- [ ] Verify update appears in other browser

### Payment System Verification (T+15 minutes)

**⚠️ This uses real money - will refund after test**

**Test 7: Subscription Flow**
- [ ] Navigate to `/billing`
- [ ] Click "Upgrade to Premium"
- [ ] Complete checkout with real card
- [ ] Verify success redirect
- [ ] Check Stripe dashboard for subscription
- [ ] Verify database updated (`subscriptions` table)
- [ ] Confirm webhook delivered (200 status)

**Test 8: Webhook Processing**
```bash
# Check Stripe Dashboard → Webhooks → Endpoint
# Recent deliveries should show:
# - checkout.session.completed: 200 OK
# - customer.subscription.created: 200 OK
```

**Test 9: Cancel Subscription**
- [ ] Go to billing settings
- [ ] Cancel subscription
- [ ] Verify "Cancels on [date]" message
- [ ] Check database: `cancel_at_period_end = true`

**Cleanup:**
```bash
# Refund the test payment in Stripe dashboard
# Delete test subscription
```

### Performance Verification (T+30 minutes)

**Test 10: Lighthouse Audit**
```bash
# Run Lighthouse on production URL
npx lighthouse https://localelore.com --view

# Expected scores:
# Performance: > 90
# Accessibility: > 95
# Best Practices: > 95
# SEO: > 90
```

**Test 11: Web Vitals**
```javascript
// Check in browser console after page load
web-vitals.getCLS(console.log) // < 0.1
web-vitals.getLCP(console.log) // < 2500ms
web-vitals.getFID(console.log) // < 100ms
```

**Test 12: Bundle Size**
```bash
# Check Network tab in browser DevTools
# Main bundle: < 500KB
# Total page weight: < 2MB
```

### Security Verification (T+45 minutes)

**Test 13: Security Headers**
```bash
curl -I https://localelore.com | grep -E 'X-Frame-Options|X-Content-Type-Options|X-XSS-Protection|Strict-Transport-Security'

# Expected:
# X-Frame-Options: DENY
# X-Content-Type-Options: nosniff
# X-XSS-Protection: 1; mode=block
```

**Test 14: HTTPS Enforcement**
```bash
curl -I http://localelore.com
# Expected: 301 redirect to https://
```

**Test 15: RLS Policies**
```sql
-- Verify Row Level Security works
-- Try to access another user's data (should fail)
SELECT * FROM subscriptions WHERE user_id != auth.uid();
-- Expected: Empty result (RLS blocks unauthorized access)
```

### Monitoring Verification (T+60 minutes)

**Test 16: Error Tracking**
- [ ] Trigger test error: Throw error in browser console
- [ ] Verify appears in Sentry within 1 minute
- [ ] Check error details are complete (stack trace, breadcrumbs)

**Test 17: Uptime Monitoring**
- [ ] Check UptimeRobot dashboard
- [ ] Verify latest check is "UP"
- [ ] Check response time < 500ms

**Test 18: Stripe Webhook Monitoring**
- [ ] Check recent webhook deliveries
- [ ] All should be 200 OK
- [ ] Delivery time < 5 seconds

### Final Verification Checklist

- [ ] All smoke tests passed
- [ ] Payment system working
- [ ] Performance metrics acceptable
- [ ] Security headers present
- [ ] Error tracking active
- [ ] Uptime monitoring green
- [ ] No critical errors in Sentry
- [ ] Database queries performing well
- [ ] Real-time features working

---

## Rollback Procedure

### When to Rollback

**Immediate rollback if:**
- Critical functionality broken (auth, payments)
- Error rate > 5%
- Database corruption detected
- Security vulnerability introduced
- Site completely down

**Consider rollback if:**
- Error rate > 1%
- Performance degraded significantly
- Multiple user reports of issues

### Rollback Steps

#### Method 1: Lovable Dashboard (Fastest - 2 minutes)

1. **Navigate to:** Lovable Dashboard → Deployments
2. **Find:** Previous working deployment
3. **Click:** "Promote to Production"
4. **Verify:** Site restored to previous version
5. **Monitor:** Error rate returns to normal

#### Method 2: Git Revert (5 minutes)

```bash
# Revert the deployment commit
git revert HEAD
git push origin production

# Lovable auto-deploys the revert
# Wait for deployment to complete
```

#### Method 3: Database Rollback (if migrations failed)

```bash
# Restore from latest backup
# Navigate to Supabase → Database → Backups → Restore

# OR manually revert migrations
supabase migration down --db-url [production-url]
```

### Post-Rollback Actions

- [ ] Confirm site is functional
- [ ] Post incident update on status page
- [ ] Notify team in #incidents channel
- [ ] Document what went wrong
- [ ] Plan fix for next deployment
- [ ] Schedule post-mortem within 24 hours

---

## Common Issues

### Issue 1: Build Fails

**Symptoms:** Deployment fails during build step

**Diagnosis:**
```bash
npm run build
# Check error message
```

**Common Causes:**
- TypeScript errors
- Missing dependencies
- Environment variable issues

**Solution:**
1. Fix the build error locally
2. Test: `npm run build`
3. Commit fix
4. Retry deployment

### Issue 2: Site Loads but Features Broken

**Symptoms:** Homepage works but specific features fail

**Diagnosis:**
- Check browser console for errors
- Check Sentry for error patterns
- Check Supabase logs

**Solution:**
1. Identify broken feature
2. Check recent code changes
3. Rollback or hotfix
4. Deploy fix

### Issue 3: Database Connection Failures

**Symptoms:** "Unable to connect to database" errors

**Diagnosis:**
```bash
# Check Supabase dashboard
# Database → Settings → Connection info
# Verify connection string is correct
```

**Common Causes:**
- Connection pool exhausted
- Database maintenance
- Network issues
- Incorrect connection string

**Solution:**
1. Check Supabase status page
2. Increase connection pool size
3. Restart database (if needed)
4. Contact Supabase support

### Issue 4: Stripe Webhooks Failing

**Symptoms:** Subscriptions created but not reflected in app

**Diagnosis:**
```bash
# Check Stripe Dashboard → Webhooks → Recent deliveries
# Look for 4xx or 5xx errors
```

**Common Causes:**
- Incorrect webhook secret
- Edge function timeout
- Database write failure

**Solution:**
```bash
# Check Edge Function logs
supabase functions logs stripe-webhooks --limit 50

# Verify webhook secret
echo $STRIPE_WEBHOOK_SECRET

# Test webhook manually
stripe trigger checkout.session.completed
```

### Issue 5: Slow Performance

**Symptoms:** Pages loading slowly (> 3 seconds)

**Diagnosis:**
```bash
# Run Lighthouse
npx lighthouse https://localelore.com

# Check database slow queries
# Supabase → Database → Query Performance
```

**Common Causes:**
- Large bundle size
- Unoptimized images
- Slow database queries
- Missing indexes

**Solution:**
1. Identify slow queries
2. Add database indexes
3. Optimize images
4. Enable caching
5. Code splitting

---

## Emergency Contacts

### On-Call Rotation

| Role | Contact | Availability |
|------|---------|--------------|
| Engineering Lead | engineering@localelore.com | 24/7 |
| Product Owner | product@localelore.com | Business hours |
| DevOps | devops@localelore.com | 24/7 |
| Security | security@localelore.com | 24/7 |

### Vendor Support

| Service | Support | SLA |
|---------|---------|-----|
| Supabase | support@supabase.com | 24 hours |
| Stripe | support@stripe.com | 24 hours |
| Lovable | support@lovable.dev | 24 hours |
| Sentry | support@sentry.io | 24 hours |

### Escalation Path

```
Level 1: On-call engineer (responds within 15 min)
    ↓ (if not resolved in 30 min)
Level 2: Engineering lead (responds within 30 min)
    ↓ (if not resolved in 1 hour)
Level 3: CTO/Founder (responds within 1 hour)
```

---

## Deployment Communication Template

### Pre-Deployment Announcement

**Subject:** [Deployment] Production deployment scheduled for [DATE] at [TIME]

```
Team,

We're deploying version [X.Y.Z] to production on [DATE] at [TIME].

Changes:
- [Feature 1]
- [Feature 2]
- [Bug fixes]

Potential impact:
- [Downtime estimate: 0 minutes expected]
- [User-facing changes]

Rollback plan:
- Previous deployment available via Lovable dashboard
- ETA for rollback: < 5 minutes

Questions? Reply to this email or ping #deployments

Thanks,
Engineering Team
```

### Post-Deployment Update

**Subject:** [Deployment] v[X.Y.Z] deployed successfully ✅

```
Team,

Production deployment completed successfully.

Status: ✅ All systems operational
Version: v[X.Y.Z]
Deployed at: [TIMESTAMP]
Verification: All smoke tests passed

Metrics:
- Error rate: [X]%
- Response time: [X]ms
- Uptime: 100%

Known issues:
- [None / List any issues]

Next deployment: [DATE]

Status page: https://status.localelore.com

Thanks,
Engineering Team
```

---

## Deployment Metrics

### Track These Per Deployment

```yaml
Deployment Date: 2025-11-13
Version: v1.0.0
Deployer: engineering@localelore.com
Duration: 8 minutes
Tests: All passed
Build time: 4 minutes
Deploy time: 4 minutes
Rollback needed: No
Issues found: 0
User impact: 0 reports
Performance delta: +5% faster LCP
Error rate change: -0.02%
```

---

## Post-Deployment Review

### Within 24 Hours

- [ ] Review Sentry errors (should be < 10 new issues)
- [ ] Check performance metrics (Lighthouse, Web Vitals)
- [ ] Verify payment success rate (should be > 95%)
- [ ] Review user feedback/support tickets
- [ ] Check database performance
- [ ] Update deployment log

### Within 1 Week

- [ ] Conduct post-mortem if issues occurred
- [ ] Document lessons learned
- [ ] Update runbook with improvements
- [ ] Plan next deployment
- [ ] Celebrate success with team! 🎉

---

## Success Criteria

Deployment is successful when:

- [ ] All smoke tests passed
- [ ] Error rate < 0.1%
- [ ] No critical bugs reported
- [ ] Performance metrics stable or improved
- [ ] Payment processing working
- [ ] No rollback required
- [ ] Team confident in deployment

---

## Continuous Improvement

### After Each Deployment

1. **What went well?**
2. **What could be improved?**
3. **What will we do differently next time?**
4. **Update this runbook with learnings**

---

**Remember:**
- Take your time with verification
- Better to catch issues early
- Rollback is not failure - it's safety
- Communication is key
- Document everything

**Good luck with your deployment! 🚀**

---

**Last Updated:** November 13, 2025
**Next Review:** After first production deployment
**Owner:** Engineering Team
