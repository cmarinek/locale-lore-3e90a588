# Monitoring & Alerting Setup Guide

## Overview
This guide covers setting up comprehensive monitoring and alerting for the LocaleLore production application.

## 1. Error Tracking with Sentry

### Setup Instructions

1. **Create Sentry Account**
   - Go to https://sentry.io
   - Create new project (React)
   - Copy DSN

2. **Install Sentry** (Already has dependency)
   ```bash
   # Already installed: @sentry/react
   ```

3. **Configure Sentry**
   
   Update `src/main.tsx`:
   ```typescript
   import * as Sentry from "@sentry/react";

   Sentry.init({
     dsn: import.meta.env.VITE_SENTRY_DSN,
     environment: import.meta.env.MODE,
     integrations: [
       new Sentry.BrowserTracing(),
       new Sentry.Replay({
         maskAllText: false,
         blockAllMedia: false,
       }),
     ],
     tracesSampleRate: 1.0,
     replaysSessionSampleRate: 0.1,
     replaysOnErrorSampleRate: 1.0,
     beforeSend(event) {
       // Don't send events in development
       if (import.meta.env.DEV) return null;
       return event;
     },
   });
   ```

4. **Add Environment Variable**
   - Add `VITE_SENTRY_DSN=your-dsn-here` to environment variables

5. **Test Error Tracking**
   ```typescript
   // Add test error button (remove after testing)
   <button onClick={() => { throw new Error("Test Sentry Error"); }}>
     Test Error
   </button>
   ```

## 2. Performance Monitoring

### Already Implemented ✅
- Core Web Vitals tracking in `src/utils/monitoring/performance.ts`
- Metrics collected: LCP, FID, CLS, TTFB

### Verify Data Collection
1. Open browser console
2. Navigate through app
3. Check localStorage: `performance_metrics`

### Send to Analytics (Optional)
```typescript
// In performance.ts - send metrics to your analytics
export const reportMetrics = () => {
  const metrics = getMetrics();
  
  // Send to Google Analytics
  if (window.gtag) {
    Object.entries(metrics).forEach(([name, value]) => {
      window.gtag('event', 'web_vitals', {
        name,
        value,
        metric_id: `${name}-${Date.now()}`,
      });
    });
  }
};
```

## 3. Uptime Monitoring

### Recommended: UptimeRobot (Free Tier Available)

1. **Create Account**
   - Go to https://uptimerobot.com
   - Sign up for free account

2. **Add Monitors**
   
   **Main Site Monitor:**
   - Monitor Type: HTTP(s)
   - Friendly Name: LocaleLore - Main Site
   - URL: https://your-domain.com
   - Monitoring Interval: 5 minutes
   - Alert Contacts: Your email

   **API Health Monitor:**
   - Monitor Type: HTTP(s)
   - Friendly Name: LocaleLore - API
   - URL: https://mwufulzthoqrwbwtvogx.supabase.co/functions/v1/check-subscription
   - Monitoring Interval: 5 minutes
   - Expected Status: 200 or 401 (both indicate server is up)

   **Subscription Check Monitor:**
   - Monitor Type: HTTP(s)  
   - Friendly Name: LocaleLore - Subscription API
   - URL: https://mwufulzthoqrwbwtvogx.supabase.co/rest/v1/
   - Monitoring Interval: 10 minutes

3. **Configure Alerts**
   - Email notifications (immediate)
   - SMS (optional, paid tier)
   - Slack/Discord webhook (recommended)

### Alternative: Better Uptime
- More detailed status pages
- Better alerting options
- Free tier: 10 monitors

## 4. Payment & Business Alerts

### Stripe Dashboard Alerts

1. **Login to Stripe Dashboard**
2. **Settings → Notifications**
3. **Enable:**
   - Failed payments
   - Successful payments (for first week)
   - Disputed payments
   - Customer emails for receipts
   - Subscription cancellations

### Custom Payment Alerts (via Edge Function)

Create monitoring edge function:

```typescript
// supabase/functions/payment-monitor/index.ts
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

serve(async (req) => {
  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
  );

  // Check for unusual activity
  const { data: recentFailures } = await supabaseClient
    .from('payments')
    .select('count')
    .eq('status', 'failed')
    .gte('created_at', new Date(Date.now() - 3600000).toISOString());

  if (recentFailures && recentFailures.length > 10) {
    // Send alert - implement your alert method
    console.error("HIGH PAYMENT FAILURE RATE", { count: recentFailures.length });
    
    // Optional: Send to Slack
    await fetch(Deno.env.get("SLACK_WEBHOOK_URL"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text: `⚠️ Alert: ${recentFailures.length} payment failures in last hour`
      }),
    });
  }

  return new Response(JSON.stringify({ checked: true }), { status: 200 });
});
```

**Schedule this function** using Supabase Cron (pg_cron):
```sql
SELECT cron.schedule(
  'payment-monitoring',
  '*/15 * * * *', -- Every 15 minutes
  $$
  SELECT net.http_post(
    url:='https://your-project.supabase.co/functions/v1/payment-monitor',
    headers:='{"Authorization": "Bearer YOUR_ANON_KEY"}'::jsonb
  );
  $$
);
```

## 5. Log Monitoring

### Supabase Edge Function Logs

**Access Logs:**
1. Supabase Dashboard → Edge Functions
2. Select function → Logs tab
3. Filter by log level

**Set Up Log Alerts:**
- Use Supabase's built-in log streaming
- Forward to external service like Datadog or Logtail

### Frontend Error Logs
Already handled by Sentry integration (see #1)

## 6. Database Monitoring

### Query Performance
```sql
-- Check slow queries
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

### Connection Pool
Monitor in Supabase Dashboard → Database → Connection Pooling

### Table Sizes
```sql
SELECT
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

## 7. Analytics Tracking

### Already Implemented ✅
- Custom analytics ingestion edge function
- Event tracking system

### Verify Working
1. Submit fact
2. Check `analytics_events` table
3. Verify events logged

### Monitor Analytics Health
```sql
-- Check if analytics are being collected
SELECT 
  date_trunc('hour', created_at) as hour,
  COUNT(*) as events
FROM analytics_events
WHERE created_at > NOW() - INTERVAL '24 hours'
GROUP BY hour
ORDER BY hour DESC;
```

## 8. Alert Channels Setup

### Email Alerts
- Configured through Uptime monitoring services
- Stripe notifications (already enabled)

### Slack Integration (Recommended)

1. **Create Slack Webhook**
   - Go to Slack workspace
   - Add "Incoming Webhooks" app
   - Create webhook for #alerts channel
   - Copy webhook URL

2. **Add to Supabase Secrets**
   ```
   SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/WEBHOOK/URL
   ```

3. **Use in Edge Functions**
   ```typescript
   const sendSlackAlert = async (message: string) => {
     await fetch(Deno.env.get("SLACK_WEBHOOK_URL"), {
       method: "POST",
       headers: { "Content-Type": "application/json" },
       body: JSON.stringify({ text: message }),
     });
   };
   ```

### Discord Integration (Alternative)

Similar to Slack, create webhook in Discord server settings.

## 9. Monitoring Dashboard

### Grafana Setup (Advanced - Optional)

The `monitoring/grafana-dashboard.json` file is already configured.

1. Install Grafana Cloud (free tier)
2. Import dashboard from `monitoring/grafana-dashboard.json`
3. Configure data sources
4. Set up alerting rules

### Simple Alternative: Google Sheets

1. **Create automated reports**
2. **Query Supabase via edge function**
3. **Export to Google Sheets API**
4. **View metrics in spreadsheet**

## 10. Health Check Endpoints

### Create Health Check Edge Function

```typescript
// supabase/functions/health/index.ts
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

serve(async (req) => {
  const checks = {
    timestamp: new Date().toISOString(),
    database: false,
    stripe: false,
    overall: false,
  };

  try {
    // Check database
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    );
    const { error } = await supabase.from('facts').select('count').limit(1);
    checks.database = !error;

    // Overall health
    checks.overall = checks.database;

    return new Response(JSON.stringify(checks), {
      status: checks.overall ? 200 : 503,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});
```

Monitor this endpoint with uptime services.

## 11. Testing Your Monitoring

### Checklist
- [ ] Trigger test error in Sentry
- [ ] Verify uptime monitor alerts
- [ ] Test failed payment webhook
- [ ] Check Slack/Discord notifications
- [ ] Review Stripe email notifications
- [ ] Verify analytics data collection
- [ ] Test health check endpoint
- [ ] Review edge function logs

## 12. Monitoring Costs

### Free Tier Options
- **Sentry**: 5K errors/month free
- **UptimeRobot**: 50 monitors free
- **Supabase Logs**: Included in plan
- **Stripe Alerts**: Free
- **Google Analytics**: Free

### Paid Recommendations (if scaling)
- **Sentry Team**: $29/month (50K errors)
- **Better Uptime**: $18/month (better alerting)
- **Datadog**: $15/host/month (comprehensive)

## 13. Regular Monitoring Tasks

### Daily
- Check error count in Sentry
- Review failed payment count
- Monitor uptime percentage

### Weekly  
- Review performance metrics
- Check subscription trends
- Analyze user activity

### Monthly
- Full security audit
- Performance optimization review
- Cost analysis
- Backup verification

---

## Quick Start Checklist

For fastest deployment, do these minimum items:

1. [ ] Set up Sentry error tracking (30 min)
2. [ ] Configure UptimeRobot for uptime monitoring (15 min)
3. [ ] Enable Stripe email notifications (5 min)
4. [ ] Create Slack webhook for critical alerts (10 min)
5. [ ] Test all monitoring with sample errors (15 min)

**Total Time**: ~1.5 hours for basic but effective monitoring coverage.
