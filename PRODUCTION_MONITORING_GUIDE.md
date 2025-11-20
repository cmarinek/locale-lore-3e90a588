# Production Monitoring & Alerting Guide
## LocaleLore Operations Handbook

**Last Updated:** November 20, 2025
**Domain:** localelore.org
**Purpose:** Comprehensive monitoring setup for production

---

## 🎯 OVERVIEW

This guide covers all monitoring, logging, alerting, and observability setup for LocaleLore in production. Proper monitoring ensures you can:

- Detect issues before users report them
- Respond quickly to outages or errors
- Identify performance bottlenecks
- Track business metrics
- Make data-driven decisions

---

## 📋 MONITORING STACK OVERVIEW

| Component | Service | Purpose | Priority |
|-----------|---------|---------|----------|
| Error Tracking | Sentry | Track frontend/backend errors | 🔴 Critical |
| Uptime Monitoring | UptimeRobot | Detect downtime | 🔴 Critical |
| Application Logs | Supabase Logs | Debug issues, audit trail | 🔴 Critical |
| Payment Monitoring | Stripe Dashboard | Track payments, disputes | 🔴 Critical |
| Analytics | Google Analytics | User behavior, conversions | 🟡 High |
| Performance | Vercel Analytics | Page load, web vitals | 🟡 High |
| Database | Supabase Metrics | Query performance, connections | 🟡 High |
| Security | Supabase Auth Logs | Login attempts, threats | 🟡 High |

---

## 1️⃣ ERROR TRACKING (Sentry) - CRITICAL

### Why Sentry?
- Real-time error tracking for frontend and backend
- Stack traces with source maps
- User context (what user was doing when error occurred)
- Release tracking and version comparison
- Integration with Slack, email, etc.

### Step 1.1: Create Sentry Account

1. Go to: https://sentry.io/signup/
2. Sign up for free account (5,000 errors/month free)
3. Verify email
4. Create organization: "LocaleLore"

### Step 1.2: Create Projects

**Frontend Project:**
1. Click **Create Project**
2. Platform: **React**
3. Project name: **localelore-frontend**
4. Alert frequency: **On every new issue**
5. Create project
6. **Copy DSN** (looks like: `https://abc123@o456.ingest.sentry.io/789`)
7. Save as: `VITE_SENTRY_DSN`

**Backend Project (Edge Functions):**
1. Click **Create Project**
2. Platform: **Deno**
3. Project name: **localelore-backend**
4. Alert frequency: **On every new issue**
5. Create project
6. **Copy DSN**
7. Save as: `SENTRY_DSN` (Supabase secret)

### Step 1.3: Configure Frontend Integration

Already integrated in `src/main.tsx` and `src/utils/monitoring.ts`.

Add to `.env.production`:
```bash
VITE_SENTRY_DSN=https://your-key@o123456.ingest.sentry.io/7890123
VITE_SENTRY_ENVIRONMENT=production
VITE_SENTRY_TRACES_SAMPLE_RATE=0.1  # 10% of transactions
```

### Step 1.4: Configure Backend Integration

Already integrated in edge functions via `src/utils/logger.ts`.

Add to Supabase secrets:
```bash
SENTRY_DSN=https://your-key@o123456.ingest.sentry.io/7890123
SENTRY_ENVIRONMENT=production
SENTRY_TRACES_SAMPLE_RATE=0.1
```

### Step 1.5: Test Error Reporting

**Frontend:**
```typescript
// Trigger test error
throw new Error('Sentry frontend test error');
```
Visit: https://localelore.org (in production)
Open console, run: `throw new Error('Test')`
Check Sentry Dashboard → Issues

**Backend:**
Trigger edge function error (send invalid request)
Check Sentry Dashboard → Issues

### Step 1.6: Configure Alerts

1. Go to: **Alerts** → **Create Alert Rule**
2. Alert name: "Critical Error Spike"
3. Conditions:
   - When: **Error count** is **greater than** 10
   - In: **1 minute**
   - Environment: **production**
4. Action: Send email to support@localelore.org
5. Create rule

**Recommended Alert Rules:**
- Critical Error Spike (>10 errors/minute)
- New Issue Detected (any new error type)
- Error Spike by User (same user hitting errors repeatedly)
- Payment Error Spike (errors in stripe checkout)

### Step 1.7: Set Up Integrations

**Email Notifications:**
1. Settings → Integrations → Email
2. Add: support@localelore.org
3. Enable for: All projects
4. Alert types: All

**Slack (Optional):**
1. Settings → Integrations → Slack
2. Connect workspace
3. Choose channel: #alerts
4. Configure alert types

### Step 1.8: Monitor Regularly

**Daily:**
- Check for new critical errors
- Review error trends graph

**Weekly:**
- Review most common errors
- Prioritize fixes for top 3 errors
- Check error resolution rate

---

## 2️⃣ UPTIME MONITORING - CRITICAL

### Why Uptime Monitoring?
- Detect when site goes down before users report it
- Get notified within 1-5 minutes of downtime
- Track historical uptime percentage
- Identify patterns (time of day, day of week)

### Step 2.1: Choose Uptime Monitoring Service

**Recommended Options:**

| Service | Free Tier | Check Interval | Locations |
|---------|-----------|----------------|-----------|
| **UptimeRobot** | 50 monitors, 5 min | 5 minutes | 13 locations |
| **Better Uptime** | 10 monitors, 3 min | 3 minutes | 6 locations |
| **Pingdom** | 10 checks | 1 minute | Many |
| **StatusCake** | Unlimited checks | 5 minutes | 6 locations |

**Recommended:** UptimeRobot (best free tier)

### Step 2.2: Set Up UptimeRobot

1. Go to: https://uptimerobot.com/signUp
2. Sign up for free account
3. Verify email
4. Click **Add New Monitor**

**Monitor 1: Homepage**
- Monitor Type: **HTTP(s)**
- Friendly Name: **LocaleLore Homepage**
- URL: `https://localelore.org`
- Monitoring Interval: **5 minutes**
- Monitor Timeout: **30 seconds**
- HTTP Method: **GET (HEAD for faster results)**
- Alert Contacts: support@localelore.org

**Monitor 2: API Health Check**
- Monitor Type: **HTTP(s)**
- Friendly Name: **LocaleLore API**
- URL: `https://[your-supabase-project].supabase.co/functions/v1/health-check`
- Monitoring Interval: **5 minutes**
- Expected Status Code: **200**

**Monitor 3: Authentication**
- Monitor Type: **HTTP(s)**
- Friendly Name: **Supabase Auth**
- URL: `https://[your-supabase-project].supabase.co/auth/v1/health`
- Monitoring Interval: **5 minutes**

**Monitor 4: Database**
- Monitor Type: **HTTP(s)**
- Friendly Name: **Supabase Database**
- URL: `https://[your-supabase-project].supabase.co/rest/v1/`
- Monitoring Interval: **5 minutes**

### Step 2.3: Configure Alert Contacts

1. Click **Alert Contacts**
2. Add email: support@localelore.org
3. Add SMS (optional, recommended for critical alerts)
4. Add Slack (optional)

### Step 2.4: Configure Status Page (Optional)

1. Create public status page
2. URL: status.localelore.org (optional subdomain)
3. Show uptime percentage
4. Show incident history
5. Embed on /status page

---

## 3️⃣ APPLICATION LOGS - CRITICAL

### Supabase Function Logs

**View Logs:**
1. Supabase Dashboard → Edge Functions
2. Select function
3. Click **Logs** tab
4. Filter by: Error, Warning, Info

**Common Issues to Watch:**
- Authentication failures
- Rate limit exceeded errors
- Stripe webhook failures
- Database connection errors
- Timeout errors

**Log Monitoring Strategy:**

**Daily:**
```bash
# Check for errors in last 24 hours
supabase functions logs --filter "level=error" --since "24h"
```

**Watch specific function:**
```bash
# Real-time logs for stripe-webhooks
supabase functions logs stripe-webhooks --follow
```

**Search for specific error:**
```bash
supabase functions logs --search "stripe" --filter "level=error"
```

### Frontend Logs

**Browser Console Errors:**
- Use Sentry to capture console errors
- LocalStorage logs: Check `src/utils/logger.ts`

**Network Errors:**
- Monitor failed API calls in Sentry
- Track 4xx and 5xx responses

---

## 4️⃣ PAYMENT MONITORING - CRITICAL

### Stripe Dashboard Monitoring

**Daily Checks:**
1. Go to: https://dashboard.stripe.com/payments
2. Check for:
   - Failed payments (requires immediate action)
   - Disputes/chargebacks (respond within 7 days)
   - Refund requests
   - Subscription cancellations

**Set Up Stripe Email Alerts:**

1. Go to: https://dashboard.stripe.com/settings/notifications
2. Enable notifications for:
   - ✅ **Successful payments** (daily digest)
   - ✅ **Failed payments** (immediate)
   - ✅ **Disputes** (immediate)
   - ✅ **Refund requests** (immediate)
   - ✅ **Subscription events** (daily digest)

3. Add email: support@localelore.org

**Webhook Monitoring:**

1. Go to: https://dashboard.stripe.com/webhooks
2. Click your webhook endpoint
3. Check **Success rate** (should be >99%)
4. View **Recent attempts**
5. If failures, check:
   - Error messages
   - Supabase function logs
   - Webhook signing secret matches

**Key Metrics to Track:**

| Metric | Target | Where to Check |
|--------|--------|----------------|
| Payment success rate | >95% | Stripe Dashboard → Payments |
| Webhook delivery rate | >99% | Stripe Dashboard → Webhooks |
| Dispute rate | <1% | Stripe Dashboard → Disputes |
| Churn rate | <5%/month | Stripe Dashboard → Subscriptions |
| MRR (Monthly Recurring Revenue) | Track trend | Stripe Dashboard → Reports |

---

## 5️⃣ ANALYTICS - HIGH PRIORITY

### Google Analytics 4 Setup

**Step 5.1: Create GA4 Property**

1. Go to: https://analytics.google.com/
2. Click **Admin** (gear icon)
3. Click **Create Property**
4. Property name: **LocaleLore**
5. Timezone: Your timezone
6. Currency: USD
7. Create property

**Step 5.2: Set Up Data Stream**

1. Click **Data Streams** → **Add stream**
2. Platform: **Web**
3. Website URL: https://localelore.org
4. Stream name: **LocaleLore Production**
5. Enhanced measurement: **ON** (enables automatic tracking)
6. Create stream
7. **Copy Measurement ID** (G-XXXXXXXXXX)
8. Add to `.env.production`: `VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX`

**Step 5.3: Configure Events**

Already integrated in `src/utils/analytics.ts`.

**Key Events Tracked:**
- Page views (automatic)
- Sign up
- Log in
- Subscribe (payment intent)
- Story created
- Fact created
- Friend request sent
- Search performed

**Step 5.4: Set Up Conversions**

1. Admin → Events
2. Mark as conversion:
   - ✅ `subscribe_success`
   - ✅ `sign_up`
   - ✅ `story_created`

**Step 5.5: Create Dashboard**

1. Reports → Library → Create new report
2. Add key metrics:
   - Active users
   - New users
   - Conversion rate
   - Revenue (from Stripe integration)
   - Top pages
   - User journey flow

**Step 5.6: Set Up Alerts**

1. Admin → Custom Alerts
2. Create alert: **Traffic Drop**
   - Condition: Sessions decrease by >50% day over day
   - Frequency: Daily
   - Recipients: support@localelore.org

---

## 6️⃣ PERFORMANCE MONITORING - HIGH PRIORITY

### Core Web Vitals

**What to Monitor:**
- **LCP** (Largest Contentful Paint): Target <2.5s
- **FID** (First Input Delay): Target <100ms
- **CLS** (Cumulative Layout Shift): Target <0.1

**Tools:**

1. **Google PageSpeed Insights**
   - URL: https://pagespeed.web.dev/
   - Test: https://localelore.org
   - Run weekly
   - Target score: 90+ (mobile and desktop)

2. **Vercel Analytics** (if deployed on Vercel)
   - Automatic setup
   - Dashboard → Analytics
   - Track: Page load, web vitals, real user monitoring

3. **Lighthouse CI** (automated)
   ```bash
   npm install -g @lhci/cli
   lhci autorun --upload.target=temporary-public-storage
   ```

### Performance Budget

Set alerts if metrics exceed:
- LCP: >3.0s
- FID: >200ms
- CLS: >0.25
- Total page size: >3MB
- JavaScript bundle: >1MB

### Optimization Checklist

- [ ] Images optimized (WebP format, lazy loading)
- [ ] Code splitting implemented
- [ ] Critical CSS inlined
- [ ] Fonts optimized (font-display: swap)
- [ ] CDN configured (Vercel Edge Network)
- [ ] Gzip/Brotli compression enabled
- [ ] HTTP/2 enabled
- [ ] Service worker caching (PWA)

---

## 7️⃣ DATABASE MONITORING - HIGH PRIORITY

### Supabase Database Metrics

**Dashboard Location:** Supabase Dashboard → Database → Usage

**Key Metrics to Monitor:**

| Metric | Warning Threshold | Critical Threshold |
|--------|-------------------|-------------------|
| Database Size | >70% of limit | >90% of limit |
| Active Connections | >80 connections | >95 connections |
| Slow Queries | >1s avg | >3s avg |
| Disk I/O | >80% | >95% |
| CPU Usage | >70% | >90% |

**Set Up Database Alerts:**

1. Supabase Dashboard → Project Settings → Notifications
2. Enable email alerts for:
   - Database approaching storage limit
   - High CPU usage
   - High connection count
   - Long-running queries

**Query Performance:**

**Identify slow queries:**
```sql
-- Run in Supabase SQL Editor
SELECT
  query,
  calls,
  total_time,
  mean_time,
  max_time
FROM pg_stat_statements
ORDER BY mean_time DESC
LIMIT 20;
```

**Add indexes for slow queries:**
```sql
-- Example: Index on frequently queried column
CREATE INDEX idx_stories_location ON stories(latitude, longitude);
CREATE INDEX idx_facts_category ON facts(category_id);
```

---

## 8️⃣ SECURITY MONITORING - HIGH PRIORITY

### Supabase Auth Logs

**Monitor for:**
- Repeated failed login attempts (brute force)
- Account takeover attempts
- Suspicious IP addresses
- Rate limit violations

**View Auth Logs:**
1. Supabase Dashboard → Authentication → Logs
2. Filter by: Failed logins, suspicious activity
3. Check daily for anomalies

### Rate Limiting Monitoring

**Check rate limit hits:**
```sql
-- Run in Supabase SQL Editor
SELECT
  key,
  count,
  reset_at,
  last_request_at
FROM rate_limits
WHERE count >= (SELECT max(count) * 0.9 FROM rate_limits)
ORDER BY count DESC
LIMIT 50;
```

**High rate limit hits = potential attack or legitimate traffic spike**

### Security Alerts

**Set up alerts for:**
- Multiple failed login attempts from same IP
- Rate limit violations
- Unusual database query patterns
- Unexpected admin actions

---

## 9️⃣ BUSINESS METRICS DASHBOARD

### Key Metrics to Track

**Growth Metrics:**
- New signups per day/week/month
- Activation rate (% of signups who create content)
- Daily/Monthly Active Users (DAU/MAU)
- Retention rate (D1, D7, D30)

**Engagement Metrics:**
- Stories created per user
- Facts created per user
- Comments per story
- Avg time on site
- Pages per session

**Revenue Metrics:**
- MRR (Monthly Recurring Revenue)
- Churn rate
- LTV (Lifetime Value)
- CAC (Customer Acquisition Cost)
- Conversion rate (free → paid)

**Content Metrics:**
- Total stories
- Total facts
- Avg story quality (votes, comments)
- Content moderation queue size
- Flagged content count

### Tools for Business Metrics

**Option 1: Google Analytics + Stripe Integration**
- Free
- Manual data correlation

**Option 2: Mixpanel**
- More advanced user analytics
- Cohort analysis
- Funnel tracking
- $0-$999/month based on volume

**Option 3: Custom Dashboard**
- Build with your own database queries
- Export to Google Sheets or internal tool
- Full control

---

## 🔟 ALERTING STRATEGY

### Alert Priorities

**P0 - Critical (Immediate Response Required):**
- Site is down (>5 min)
- Payment processing broken
- Database connection failure
- Security breach detected
- Data loss event

**P1 - High (Response within 1 hour):**
- Error rate spike (>10 errors/min)
- Payment failure rate >5%
- Slow response times (>5s)
- Auth service degraded

**P2 - Medium (Response within 4 hours):**
- Failed background job
- Email delivery failures
- Image upload failures
- Search not working

**P3 - Low (Response within 24 hours):**
- Non-critical feature broken
- UI bug
- Minor performance degradation

### Alert Channels

| Priority | Email | SMS | Slack | PagerDuty |
|----------|-------|-----|-------|-----------|
| P0 | ✅ | ✅ | ✅ | ✅ (if using) |
| P1 | ✅ | 💡 | ✅ | 💡 |
| P2 | ✅ | ❌ | ✅ | ❌ |
| P3 | ✅ | ❌ | 💡 | ❌ |

### Alert Configuration Best Practices

1. **Don't over-alert:** Too many alerts = alert fatigue = ignored alerts
2. **Group related alerts:** Combine related issues into single alert
3. **Set thresholds carefully:** Avoid false positives
4. **Test alerts:** Trigger test alerts to verify delivery
5. **Document response procedures:** What to do for each alert type

---

## 1️⃣1️⃣ ON-CALL PROCEDURES

### Incident Response Plan

**Step 1: Acknowledge**
- Acknowledge alert within 5 minutes
- Post in #incidents channel: "Investigating [issue]"

**Step 2: Assess**
- Determine severity (P0-P3)
- Check monitoring dashboards:
  - Sentry for errors
  - UptimeRobot for downtime
  - Supabase logs for backend issues
  - Stripe for payment issues

**Step 3: Mitigate**
- **If site is down:** Check hosting provider status
- **If payments broken:** Check Stripe Dashboard → Webhooks
- **If database issues:** Check Supabase Dashboard → Database
- **If code issue:** Roll back recent deployment

**Step 4: Communicate**
- Post status update every 15-30 minutes
- Update status page (if configured)
- Email affected users if major impact

**Step 5: Resolve**
- Fix root cause
- Deploy fix
- Verify issue resolved
- Monitor for 30 minutes

**Step 6: Document**
- Write incident report
- Document root cause
- List action items to prevent recurrence

### Runbook for Common Issues

**Issue: Site is down**
```bash
1. Check UptimeRobot - confirm downtime
2. Check hosting provider status (Vercel/etc)
3. Check DNS: nslookup localelore.org
4. Check SSL cert: https://www.ssllabs.com/ssltest/
5. If all external checks pass, check Supabase
6. Roll back recent deploy if needed
```

**Issue: Payment processing broken**
```bash
1. Check Stripe Dashboard → Webhooks
2. Check webhook delivery success rate
3. Check Supabase function logs: stripe-webhooks
4. Verify webhook signing secret matches
5. Check Stripe API status: https://status.stripe.com
```

**Issue: High error rate**
```bash
1. Check Sentry for new errors
2. Identify common error pattern
3. Check recent deployments (possible bad deploy)
4. Roll back if needed
5. Fix and redeploy
```

---

## 1️⃣2️⃣ MONITORING CHECKLIST

### Daily Monitoring Tasks (5-10 minutes)

- [ ] Check Sentry for new critical errors
- [ ] Check UptimeRobot uptime status (should be 100%)
- [ ] Check Stripe Dashboard for failed payments
- [ ] Review Supabase function logs for errors
- [ ] Check email for alerts

### Weekly Monitoring Tasks (30 minutes)

- [ ] Review top 10 errors in Sentry
- [ ] Analyze payment trends in Stripe
- [ ] Check database usage in Supabase
- [ ] Review Google Analytics for traffic trends
- [ ] Run Lighthouse performance audit
- [ ] Check for security alerts

### Monthly Monitoring Tasks (1-2 hours)

- [ ] Generate monthly incident report
- [ ] Review and optimize slow database queries
- [ ] Analyze user retention and churn
- [ ] Review and optimize infrastructure costs
- [ ] Update monitoring thresholds if needed
- [ ] Test disaster recovery procedures

---

## 1️⃣3️⃣ COST OPTIMIZATION

### Monitoring Costs

**Free Tier Limits:**
- Sentry: 5,000 errors/month
- UptimeRobot: 50 monitors, 5-min interval
- Google Analytics: Unlimited
- Supabase: 500MB database, 2GB bandwidth
- Vercel: 100GB bandwidth

**When You'll Need to Pay:**
- Sentry: >5,000 errors/month = $26/month
- Supabase: >500MB database or >2GB bandwidth = $25/month
- Vercel: >100GB bandwidth = $20/month (Pro plan)

**Cost Management Tips:**
1. Optimize Sentry: Filter out noise, sample transactions
2. Use CDN: Reduce origin bandwidth (images, static assets)
3. Optimize database: Clean up old data, add indexes
4. Monitor usage: Set up billing alerts

---

## 1️⃣4️⃣ COMPLIANCE & AUDIT LOGGING

### What to Log

**User Actions:**
- Account creation/deletion
- Login/logout
- Password changes
- Data exports (GDPR)
- Content creation/deletion

**Payment Events:**
- Subscription start/cancel
- Payment success/failure
- Refund requests
- Disputes

**Admin Actions:**
- User role changes
- Content moderation decisions
- System configuration changes

**Security Events:**
- Failed login attempts
- Rate limit violations
- Suspicious activity

### Log Retention

| Log Type | Retention Period | Reason |
|----------|------------------|--------|
| Payment records | 7 years | Legal requirement |
| User audit logs | 1 year | GDPR compliance |
| Security logs | 90 days | Incident investigation |
| Application logs | 30 days | Debugging |
| Analytics data | 14 months (GA4) | Business analysis |

---

## 1️⃣5️⃣ PRODUCTION READINESS CHECKLIST

### Monitoring Setup Verification

- [ ] ✅ Sentry configured for frontend and backend
- [ ] ✅ UptimeRobot monitoring homepage and API
- [ ] ✅ Stripe email alerts enabled
- [ ] ✅ Supabase logs accessible
- [ ] 💡 Google Analytics configured
- [ ] 💡 Performance monitoring set up
- [ ] 💡 Database metrics monitored
- [ ] 💡 Security alerts configured

### Alert Configuration Verification

- [ ] ✅ Email alerts go to support@localelore.org
- [ ] 💡 SMS alerts configured for critical issues
- [ ] 💡 Slack integration set up
- [ ] ✅ Test alert sent and received

### Documentation Verification

- [ ] ✅ Incident response procedures documented
- [ ] ✅ Runbooks created for common issues
- [ ] ✅ Monitoring checklist created (this doc)
- [ ] 💡 Team trained on monitoring tools

---

## 📞 MONITORING TOOL SUPPORT

**Sentry Support:**
- Email: support@sentry.io
- Docs: https://docs.sentry.io/

**UptimeRobot Support:**
- Email: support@uptimerobot.com
- Docs: https://blog.uptimerobot.com/

**Google Analytics Support:**
- Help Center: https://support.google.com/analytics/
- Community: https://www.en.advertisercommunity.com/

**Supabase Support:**
- Email: support@supabase.com
- Discord: https://discord.supabase.com/
- Docs: https://supabase.com/docs

---

## ✅ COMPLETION

Once you've completed this guide:

1. Verify ALL monitoring tools configured
2. Test each alert type
3. Document your monitoring procedures
4. Train team on response procedures
5. Schedule regular monitoring reviews

**Monitoring Setup Status:** 🟢 READY FOR PRODUCTION

---

**Last Updated:** November 20, 2025
**Next Review:** Monthly
**Document Version:** 1.0

**Related Documents:**
- FINAL_LAUNCH_CHECKLIST.md
- ENVIRONMENT_VARIABLES_GUIDE.md
- STRIPE_PRODUCTION_SETUP.md
