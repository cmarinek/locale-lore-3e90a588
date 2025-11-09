# Deployment Guide

## Overview

This guide covers deployment procedures for the application, including frontend deployment, edge function deployment, database migrations, and monitoring.

---

## Prerequisites

### Required Accounts
- ✅ Supabase project (already configured)
- ✅ Git repository
- ⬜ Domain registrar (optional, for custom domain)
- ⬜ CDN service (optional, for enhanced performance)

### Environment Setup
- Node.js 18+ installed
- npm or yarn package manager
- Supabase CLI installed (optional, for local development)

---

## Frontend Deployment

### Build Process

1. **Install Dependencies**:
```bash
npm install
```

2. **Run Tests**:
```bash
npm run test:unit
npm run test:e2e
```

3. **Build Application**:
```bash
npm run build
```

4. **Preview Build** (optional):
```bash
npm run preview
```

### Deployment Platforms

#### Vercel (Recommended)

**Setup**:
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

**Configuration** (`vercel.json`):
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

#### Netlify

**Setup**:
```bash
# Install Netlify CLI
npm i -g netlify-cli

# Deploy
netlify deploy --prod
```

**Configuration** (`netlify.toml`):
```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

#### Cloudflare Pages

**Setup**:
1. Connect repository to Cloudflare Pages
2. Set build command: `npm run build`
3. Set build output: `dist`
4. Deploy

---

## Edge Functions Deployment

### Automatic Deployment

Edge functions deploy automatically when you push changes to the repository connected to Supabase.

**Verify Deployment**:
1. Check [Edge Functions Dashboard](https://supabase.com/dashboard/project/mwufulzthoqrwbwtvogx/functions)
2. Review deployment logs
3. Test function endpoints

### Manual Deployment (If Needed)

```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Link to project
supabase link --project-ref mwufulzthoqrwbwtvogx

# Deploy specific function
supabase functions deploy analytics-ingestion

# Deploy all functions
supabase functions deploy
```

### Post-Deployment Verification

```bash
# Test function
curl -i --location --request POST \
  'https://mwufulzthoqrwbwtvogx.supabase.co/functions/v1/analytics-ingestion' \
  --header 'Authorization: Bearer YOUR_ANON_KEY' \
  --header 'Content-Type: application/json' \
  --data '{"events":[],"sessionId":"test"}'
```

---

## Database Migrations

### Migration Workflow

1. **Create Migration** (via Lovable migration tool)
2. **Review Migration** in Supabase dashboard
3. **Test Migration** on staging environment
4. **Apply Migration** to production
5. **Verify Schema** changes

### Rolling Back Migrations

**Important**: Always backup database before migrations!

```sql
-- Manual rollback (if needed)
-- Review migration file and write reverse operations
BEGIN;
-- Your rollback SQL here
ROLLBACK; -- or COMMIT when ready
```

### Migration Best Practices

✅ **DO**:
- Test migrations on staging first
- Backup database before applying
- Use transactions for atomic operations
- Document breaking changes
- Version control all migrations

❌ **DON'T**:
- Run migrations directly in production without testing
- Modify existing migrations after deployment
- Skip migration documentation
- Forget to update type definitions

---

## Configuration Management

### Environment Variables

**Required Variables**:
```bash
# Supabase
VITE_SUPABASE_URL=https://mwufulzthoqrwbwtvogx.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key

# Optional
VITE_APP_URL=https://your-domain.com
VITE_ENABLE_ANALYTICS=true
```

**Secrets Management**:
- Edge function secrets: Configure in [Supabase dashboard](https://supabase.com/dashboard/project/mwufulzthoqrwbwtvogx/settings/functions)
- Never commit secrets to repository
- Use environment-specific configurations

---

## Monitoring & Logging

### Edge Function Logs

**Access Logs**:
- [Analytics Ingestion Logs](https://supabase.com/dashboard/project/mwufulzthoqrwbwtvogx/functions/analytics-ingestion/logs)
- [Collect Metrics Logs](https://supabase.com/dashboard/project/mwufulzthoqrwbwtvogx/functions/collect-metrics/logs)

**Log Levels**:
- `INFO`: Normal operations
- `WARN`: Potential issues
- `ERROR`: Errors requiring attention

### Database Monitoring

**Metrics to Watch**:
- Connection pool usage
- Query performance
- Table sizes
- Index efficiency

**Access Monitoring**:
1. Go to [Supabase Dashboard](https://supabase.com/dashboard/project/mwufulzthoqrwbwtvogx)
2. Navigate to Database → Logs
3. Filter by severity and time range

### Application Performance

**Key Metrics**:
- Core Web Vitals (LCP, FID, CLS)
- API response times
- Error rates
- User engagement

**Monitoring Tools**:
- Built-in: `collect-metrics` edge function
- External: Consider adding Sentry, LogRocket, or similar

---

## Health Checks

### Frontend Health Check

**Endpoint**: `/.well-known/health`

**Response**:
```json
{
  "status": "healthy",
  "timestamp": "2025-01-09T12:00:00Z",
  "version": "1.0.0"
}
```

### Edge Function Health Check

```typescript
// Test individual functions
const healthCheck = async (functionName: string) => {
  try {
    const response = await supabase.functions.invoke(functionName, {
      body: { ping: true }
    });
    return response.data ? 'healthy' : 'unhealthy';
  } catch (error) {
    return 'unhealthy';
  }
};
```

---

## Rollback Procedures

### Frontend Rollback

**Vercel**:
```bash
# List deployments
vercel ls

# Rollback to specific deployment
vercel rollback [deployment-url]
```

**Netlify**:
1. Go to Netlify dashboard
2. Navigate to Deploys
3. Select previous deployment
4. Click "Publish deploy"

### Edge Function Rollback

**Manual Process**:
1. Checkout previous working version from Git
2. Deploy specific function
3. Verify functionality

```bash
git checkout <previous-commit>
supabase functions deploy <function-name>
```

### Database Rollback

**Critical**: Only for emergencies!

1. Stop application traffic
2. Restore from backup
3. Apply necessary data fixes
4. Resume traffic

---

## Scaling Considerations

### Frontend Scaling

**Current Setup**: Auto-scales with hosting platform

**Optimization**:
- Enable CDN caching
- Optimize bundle size
- Use code splitting
- Implement service workers

### Database Scaling

**Supabase Instance**:
- Currently on default tier
- Can upgrade instance size
- Configure connection pooling
- Add read replicas (enterprise)

**Optimization**:
- Add database indexes
- Optimize queries
- Implement caching layer
- Archive old data

### Edge Functions Scaling

**Auto-Scaling**: Handled by Supabase

**Optimization**:
- Minimize cold starts
- Optimize function size
- Use connection pooling
- Implement caching

---

## Security Checklist

### Pre-Deployment

- [ ] Run security audit: `npm audit`
- [ ] Verify RLS policies enabled
- [ ] Check input validation on all endpoints
- [ ] Review authentication configuration
- [ ] Scan for exposed secrets
- [ ] Test CORS configuration
- [ ] Verify rate limiting (when implemented)

### Post-Deployment

- [ ] Verify HTTPS enabled
- [ ] Check security headers
- [ ] Test authentication flows
- [ ] Verify authorization rules
- [ ] Monitor for suspicious activity
- [ ] Review access logs

---

## Maintenance Windows

### Scheduled Maintenance

**Best Practices**:
- Schedule during low-traffic periods
- Notify users in advance
- Prepare rollback plan
- Monitor during and after maintenance
- Document changes

**Communication Template**:
```
Scheduled Maintenance

Date: [DATE]
Time: [TIME] (UTC)
Duration: [ESTIMATED DURATION]
Impact: [DESCRIPTION]
Status Page: [URL]
```

---

## Disaster Recovery

### Backup Strategy

**Database**:
- Automatic daily backups (Supabase)
- Point-in-time recovery available
- Retention: 7 days (default)

**Code**:
- Version controlled in Git
- Tagged releases
- Branch protection enabled

**Assets**:
- Stored in Supabase Storage
- Automatic replication
- CDN backup (if applicable)

### Recovery Procedures

**Database Failure**:
1. Contact Supabase support
2. Restore from most recent backup
3. Verify data integrity
4. Resume operations

**Application Failure**:
1. Check hosting platform status
2. Roll back to previous deployment
3. Investigate root cause
4. Apply fix and redeploy

---

## CI/CD Pipeline (Recommended)

### GitHub Actions Example

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm test

  deploy:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run build
      - uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
```

---

## Support Contacts

### Supabase Support
- Dashboard: https://supabase.com/dashboard
- Documentation: https://supabase.com/docs
- Support: https://supabase.com/dashboard/support

### Emergency Procedures
1. Check status pages
2. Review recent deployments
3. Check monitoring dashboards
4. Contact platform support if needed

---

## Changelog

### Version 1.0.0 (Current)
- Initial production deployment
- Core features implemented
- Security measures in place
- Monitoring configured

### Upcoming
- Rate limiting implementation
- Advanced caching layer
- Enhanced monitoring
- Automated backups
