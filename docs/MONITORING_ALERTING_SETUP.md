# Monitoring & Alerting Setup Guide

**Last Updated:** November 13, 2025
**Estimated Time:** 2-4 hours
**Difficulty:** Medium
**Priority:** 🟡 High - Recommended before launch

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Error Tracking with Sentry](#error-tracking-with-sentry)
3. [Performance Monitoring](#performance-monitoring)
4. [Uptime Monitoring](#uptime-monitoring)
5. [Database Monitoring](#database-monitoring)
6. [Payment Monitoring](#payment-monitoring)
7. [Alert Configuration](#alert-configuration)
8. [Dashboard Setup](#dashboard-setup)
9. [Incident Response](#incident-response)

---

## Overview

### Monitoring Stack

```
┌─────────────────────────────────────────────────────────┐
│                    LocaleLore Monitoring                │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Frontend          →  Sentry (Errors + Performance)    │
│  Backend/Edge Fns  →  Sentry + Supabase Logs           │
│  Database          →  Supabase Dashboard               │
│  Uptime            →  UptimeRobot / Better Uptime      │
│  Payments          →  Stripe Dashboard + Webhooks      │
│  Web Vitals        →  Custom Analytics + Sentry        │
│  User Analytics    →  PostHog / Plausible              │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### Critical Metrics to Monitor

| Metric | Target | Alert Threshold |
|--------|--------|-----------------|
| Error Rate | < 0.1% | > 1% |
| Uptime | > 99.9% | < 99.5% |
| Response Time (p95) | < 300ms | > 1000ms |
| LCP (Largest Contentful Paint) | < 2.5s | > 4s |
| Database CPU | < 70% | > 85% |
| Failed Payments | < 5% | > 10% |
| Webhook Failures | 0 | > 5 in 1 hour |

---

## Error Tracking with Sentry

### Step 1: Create Sentry Project

1. **Sign up:** https://sentry.io/signup/
2. **Create Organization:** "LocaleLore"
3. **Create Project:**
   - Platform: React
   - Project Name: localelore-production
   - Alert Frequency: "Alert me on every new issue"

### Step 2: Get Configuration

After project creation, you'll see:

```javascript
Sentry.init({
  dsn: "https://[key]@o[org].ingest.sentry.io/[project]",
  // ...
});
```

**Copy the DSN:** This is your `VITE_SENTRY_DSN`

### Step 3: Configure Environment Variables

```bash
# Frontend - add to Lovable/Vercel environment
VITE_SENTRY_DSN=https://...@o....ingest.sentry.io/...
VITE_SENTRY_TRACES_SAMPLE_RATE=0.1
VITE_SENTRY_REPLAYS_SESSION_SAMPLE_RATE=0.1
VITE_SENTRY_REPLAYS_ON_ERROR_SAMPLE_RATE=1.0
SENTRY_ENVIRONMENT=production
```

### Step 4: Verify Installation

The app already has Sentry integrated! Just add the DSN.

**Test it:**

```javascript
// In browser console (after deploying with DSN)
throw new Error("Test error - please ignore");

// Check Sentry dashboard for the error
```

### Step 5: Configure Sentry Alerts

**Navigate to:** Sentry → Settings → Alerts

#### Alert 1: Critical Error Rate

```yaml
Name: High Error Rate Alert
Condition: error.count is greater than 100 in 1 hour
Actions:
  - Send email to: admin@localelore.com
  - Send Slack notification (optional)
Frequency: Alert on every occurrence
```

#### Alert 2: New Issue Detection

```yaml
Name: New Issue Detected
Condition: A new issue is created
Actions:
  - Send email to: dev-team@localelore.com
Frequency: Alert immediately
```

#### Alert 3: Performance Degradation

```yaml
Name: Slow Page Load
Condition: p95(transaction.duration) > 3000ms in 10 minutes
Actions:
  - Send email to: admin@localelore.com
Frequency: At most once per 30 minutes
```

### Step 6: Set Up Issue Ownership

**Navigate to:** Sentry → Settings → Ownership Rules

```yaml
# Auto-assign issues based on file path
path:src/components/billing/* admin@localelore.com
path:src/components/auth/* security@localelore.com
path:supabase/functions/* backend-team@localelore.com

# Auto-assign based on error type
error.type:StripeError admin@localelore.com
error.type:AuthenticationError security@localelore.com
```

---

## Performance Monitoring

### Web Vitals Dashboard (Already Implemented!)

Your app already tracks Web Vitals. Just enable monitoring:

**File:** `src/utils/performance/monitoring.ts`

This tracks:
- ✅ LCP (Largest Contentful Paint)
- ✅ FID (First Input Delay) / INP
- ✅ CLS (Cumulative Layout Shift)
- ✅ FCP (First Contentful Paint)
- ✅ TTFB (Time to First Byte)

### Configure Performance Alerts

Create a custom dashboard to track these metrics.

#### Option A: Use Sentry Performance

Already configured! Just verify in Sentry → Performance

#### Option B: Use PostHog (Recommended for Product Analytics)

1. **Sign up:** https://posthog.com
2. **Get API key**
3. **Add to .env:**
   ```bash
   VITE_POSTHOG_KEY=phc_...
   VITE_POSTHOG_HOST=https://app.posthog.com
   ```

4. **Initialize in app:**

```typescript
// Add to src/main.tsx or app initialization
import posthog from 'posthog-js';

if (import.meta.env.VITE_POSTHOG_KEY) {
  posthog.init(import.meta.env.VITE_POSTHOG_KEY, {
    api_host: import.meta.env.VITE_POSTHOG_HOST,
    capture_pageview: true,
    capture_pageleave: true,
  });
}
```

---

## Uptime Monitoring

### Option A: UptimeRobot (Free, Simple)

1. **Sign up:** https://uptimerobot.com
2. **Create Monitor:**
   ```yaml
   Monitor Type: HTTPS
   Friendly Name: LocaleLore Production
   URL: https://localelore.com
   Monitoring Interval: 5 minutes
   Monitor Timeout: 30 seconds
   ```

3. **Add Alert Contacts:**
   - Email: admin@localelore.com
   - SMS: +1-xxx-xxx-xxxx (optional, requires paid plan)

4. **Create Status Page:**
   - Public URL: https://status.localelore.com
   - Shows uptime percentage
   - Historical incident log

### Option B: Better Uptime (More Features)

1. **Sign up:** https://betteruptime.com
2. **Create Monitor:**
   ```yaml
   URL: https://localelore.com
   Name: Production Website
   Check Frequency: Every 1 minute
   Locations: Multiple (US, EU, Asia)
   Expected Status Code: 200
   ```

3. **Set Up On-Call Schedule:**
   ```yaml
   Schedule: 24/7
   Escalation:
     - Step 1: Email admin@localelore.com (immediate)
     - Step 2: SMS to on-call engineer (after 5 min)
     - Step 3: Call backup contact (after 15 min)
   ```

### Critical Endpoints to Monitor

Create separate monitors for:

- [ ] **Main App:** `https://localelore.com`
- [ ] **API Health:** `https://your-project.supabase.co/rest/v1/` (with auth header)
- [ ] **Stripe Webhook:** Monitor webhook delivery success rate
- [ ] **Database:** Check connection via health endpoint

---

## Database Monitoring

### Supabase Built-in Monitoring

**Navigate to:** Supabase Dashboard → Reports

Monitor:
- **Database Size:** Alert if > 80% of plan limit
- **Connection Count:** Alert if > 80% of pool size
- **Slow Queries:** Review weekly
- **Error Rate:** Alert if > 1%

### Configure Database Alerts

**Navigate to:** Supabase Dashboard → Settings → Database

Set up alerts for:

```yaml
High CPU Usage:
  Threshold: 85%
  Duration: 5 minutes
  Action: Email alert

High Memory Usage:
  Threshold: 90%
  Duration: 5 minutes
  Action: Email alert

Connection Pool Exhaustion:
  Threshold: 95% of max connections
  Duration: 2 minutes
  Action: Email + Slack alert
```

### Slow Query Monitoring

1. **Enable pg_stat_statements:**
   ```sql
   -- Already enabled by Supabase
   ```

2. **Create weekly report query:**
   ```sql
   SELECT
     query,
     calls,
     total_exec_time,
     mean_exec_time,
     max_exec_time
   FROM pg_stat_statements
   ORDER BY mean_exec_time DESC
   LIMIT 20;
   ```

3. **Schedule:** Run this query weekly and review

---

## Payment Monitoring

### Stripe Dashboard Monitoring

**Navigate to:** https://dashboard.stripe.com/reports

#### Daily Checks:

- [ ] Successful payment rate (target: > 95%)
- [ ] Failed payment reasons
- [ ] Disputed charges
- [ ] Subscription churn rate

#### Configure Stripe Webhooks Monitoring

1. **Navigate to:** Stripe Dashboard → Webhooks → Your endpoint
2. **Check:** "Recent deliveries" tab daily
3. **Alert if:** Any 4xx or 5xx responses

### Create Payment Health Dashboard

**Key Metrics:**

```sql
-- Successful payment rate (last 24 hours)
SELECT
  COUNT(*) FILTER (WHERE status = 'completed') * 100.0 / COUNT(*) as success_rate
FROM payments
WHERE created_at > NOW() - INTERVAL '24 hours';

-- Should be > 95%

-- Failed payments with reasons
SELECT
  COUNT(*),
  metadata->>'failure_reason' as reason
FROM payments
WHERE status = 'failed'
  AND created_at > NOW() - INTERVAL '7 days'
GROUP BY reason
ORDER BY count DESC;

-- Subscription churn (monthly)
SELECT
  DATE_TRUNC('month', canceled_at) as month,
  COUNT(*) as churned_subscriptions
FROM subscriptions
WHERE canceled_at IS NOT NULL
GROUP BY month
ORDER BY month DESC
LIMIT 12;
```

---

## Alert Configuration

### Critical Alerts (Immediate Response)

| Alert | Trigger | Action | Response Time |
|-------|---------|--------|---------------|
| Site Down | 3 failed health checks | Email + SMS | < 5 min |
| Error Rate Spike | > 100 errors/hour | Email + Slack | < 15 min |
| Database Down | Connection failures | Email + SMS + Call | < 5 min |
| Payment Processing Failure | > 10 failed payments | Email | < 30 min |
| Security Event | Unusual auth attempts | Email | < 15 min |

### Warning Alerts (Next Business Day)

| Alert | Trigger | Action | Response Time |
|-------|---------|--------|---------------|
| Slow Performance | LCP > 4s for 10 min | Email | < 4 hours |
| High Database CPU | > 85% for 15 min | Email | < 2 hours |
| Low Disk Space | > 80% used | Email | < 24 hours |
| Webhook Delays | > 5 min delivery time | Email | < 4 hours |

### Info Alerts (Weekly Summary)

- User growth trends
- Popular features usage
- Performance improvements
- Cost optimization opportunities

---

## Dashboard Setup

### Create Admin Dashboard

**File:** `src/pages/AdminDashboard.tsx` (already exists!)

Add real-time monitoring widgets:

```typescript
// Add these components to the existing admin dashboard

<MonitoringWidget title="System Health">
  <HealthChecks />
  <ErrorRate />
  <ResponseTime />
</MonitoringWidget>

<MonitoringWidget title="User Metrics">
  <ActiveUsers />
  <NewSignups />
  <RetentionRate />
</MonitoringWidget>

<MonitoringWidget title="Payment Health">
  <RevenueChart />
  <SubscriptionGrowth />
  <ChurnRate />
</MonitoringWidget>
```

### External Dashboard (Grafana - Optional)

For advanced users:

1. **Deploy Grafana:** Use Grafana Cloud (free tier)
2. **Connect Supabase:** Use PostgreSQL data source
3. **Import dashboard:** Use community templates
4. **Configure panels:**
   - Request rate
   - Error rate
   - Database connections
   - Response times

---

## Incident Response

### Incident Response Playbook

#### Level 1: Critical (Site Down)

```yaml
Detection: Uptime monitor alerts
Response Time: < 5 minutes
Steps:
  1. Check status page (Supabase, Lovable)
  2. Check DNS configuration
  3. Review recent deployments
  4. Check error logs in Sentry
  5. Roll back if recent deploy
  6. Post status update
  7. Fix root cause
  8. Post-mortem within 24 hours
```

#### Level 2: Major (Functionality Broken)

```yaml
Detection: Error rate spike or user reports
Response Time: < 15 minutes
Steps:
  1. Identify affected feature
  2. Check Sentry for stack traces
  3. Check Supabase Edge Function logs
  4. Disable feature if necessary
  5. Deploy hotfix
  6. Monitor error rate decrease
  7. Post-mortem within 48 hours
```

#### Level 3: Minor (Performance Degradation)

```yaml
Detection: Performance monitoring alerts
Response Time: < 4 hours
Steps:
  1. Identify slow endpoint/component
  2. Review Web Vitals data
  3. Check database slow query log
  4. Optimize or add caching
  5. Deploy improvement
  6. Verify metrics improve
```

### Incident Communication Template

```markdown
**Subject:** [Incident] LocaleLore Service Disruption

**Status:** Investigating / Identified / Resolved

**Impact:** [Describe what's not working]

**Affected Users:** [Percentage or number]

**Started:** [Timestamp]

**Current Actions:**
- [What we're doing now]

**Updates:**
- [Timestamp]: [Update message]

**Resolution:**
- [How it was fixed]

**Next Steps:**
- [Preventive measures]
```

---

## Monitoring Checklist

### Pre-Launch Setup

- [ ] Sentry DSN configured and tested
- [ ] Error alerts configured (email + Slack)
- [ ] Uptime monitoring set up (UptimeRobot or Better Uptime)
- [ ] Status page created
- [ ] Performance monitoring enabled
- [ ] Database alerts configured in Supabase
- [ ] Stripe webhook monitoring enabled
- [ ] Admin dashboard accessible
- [ ] Incident response playbook documented
- [ ] Team notification channels set up (Slack/Discord)

### Daily Monitoring Tasks

- [ ] Check Sentry for new errors
- [ ] Review Stripe webhook delivery status
- [ ] Check uptime percentage (should be > 99.9%)
- [ ] Review performance metrics (LCP, FID, CLS)
- [ ] Check active user count vs. expected

### Weekly Monitoring Tasks

- [ ] Review slow database queries
- [ ] Check payment success rate trends
- [ ] Review user churn data
- [ ] Analyze error patterns in Sentry
- [ ] Check disk space usage
- [ ] Review security audit logs

### Monthly Monitoring Tasks

- [ ] Comprehensive performance audit (Lighthouse)
- [ ] Review and update alert thresholds
- [ ] Cost optimization review
- [ ] Security vulnerability scan
- [ ] Backup restoration test
- [ ] Incident response drill

---

## Tools Summary

### Free Tier Recommendations

| Tool | Purpose | Free Tier Limit | Cost After |
|------|---------|----------------|------------|
| Sentry | Error Tracking | 5k events/month | $26/mo |
| UptimeRobot | Uptime Monitoring | 50 monitors | $7/mo |
| PostHog | Product Analytics | 1M events/month | $0.00031/event |
| Plausible | Web Analytics | N/A | $9/mo |
| Better Uptime | Advanced Uptime | 10 monitors | $20/mo |

### Recommended Setup (Under $50/mo)

- **Sentry:** Developer plan (5k events) - $0
- **UptimeRobot:** Free plan - $0
- **PostHog:** Free tier - $0
- **Supabase Monitoring:** Included - $0
- **Stripe Dashboard:** Included - $0

**Total:** $0/month until you scale!

---

## Quick Start (15 Minutes)

### Minimal Viable Monitoring

If you're in a hurry, set up these 3 things:

1. **Sentry for Errors** (5 min)
   ```bash
   VITE_SENTRY_DSN=https://...
   # Deploy and verify errors appear in dashboard
   ```

2. **UptimeRobot for Uptime** (5 min)
   - Add your domain
   - Set email alert
   - Done!

3. **Stripe Webhook Monitoring** (5 min)
   - Bookmark webhook delivery page
   - Check it daily
   - Done!

**That's it!** You now have 80% of critical monitoring coverage.

---

## Success Criteria

Your monitoring is production-ready when:

- [ ] Errors are being tracked in Sentry
- [ ] You receive an alert when the site goes down
- [ ] You can see current error rate in < 30 seconds
- [ ] Payment failures trigger notifications
- [ ] You have a status page to share with users
- [ ] Database health is visible in Supabase dashboard
- [ ] You've tested the alerting system (trigger a test alert)

---

**Next Step:** After monitoring is set up, proceed to [Post-Launch Feature Roadmap](./POST_LAUNCH_ROADMAP.md)
