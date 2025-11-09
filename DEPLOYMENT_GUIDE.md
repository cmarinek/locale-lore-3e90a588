# 🚀 Production Deployment Guide

## Pre-Deployment Checklist

Visit `/pre-deployment` in your application for an interactive dashboard with automated checks.

### Critical Requirements ✅

- [ ] **Environment Variables Configured**
  - All VITE_* variables set correctly
  - Supabase credentials verified
  - API keys added as secrets

- [ ] **Database Security**
  - Row Level Security (RLS) enabled on all tables
  - Backup strategy configured
  - Connection pooling optimized

- [ ] **Custom Domain**
  - Domain connected in Lovable dashboard
  - DNS records configured (A records for @ and www → 185.158.133.1)
  - SSL certificate provisioned (automatic)

- [ ] **Build Errors Resolved**
  - Run `npm run build` successfully
  - No TypeScript errors in application code
  - Deno edge function types configured (deno.json)

### Recommended Steps 📋

- [ ] **Testing**
  - Run E2E tests: `npm run test`
  - Manual testing on staging environment
  - Cross-browser compatibility check

- [ ] **Performance**
  - Load testing completed
  - Bundle size optimized
  - CDN configuration verified

- [ ] **Monitoring**
  - Sentry error tracking configured
  - Web Vitals monitoring active
  - API rate limit alerts set up

- [ ] **Translation Files**
  - All languages have complete translations
  - Auto-sync workflow tested
  - Missing keys resolved

## Deployment Steps

### 1. Run Pre-Deployment Checks

```bash
# Visit the pre-deployment dashboard
open http://localhost:5173/pre-deployment

# Or run the production deploy script
bash scripts/production-deploy.sh
```

### 2. Deploy with Lovable

1. Go to [Lovable Dashboard](https://lovable.dev/projects)
2. Select your project
3. Click **"Publish"** or **"Deploy"**
4. Wait for build completion (~2-5 minutes)

### 3. Configure Custom Domain

1. In Lovable dashboard, go to **Settings → Domains**
2. Click **"Connect Domain"**
3. Add your domain (e.g., `yourdomain.com`)
4. Add DNS records at your registrar:
   - `A` record: `@` → `185.158.133.1`
   - `A` record: `www` → `185.158.133.1`
   - `TXT` record: `_lovable` → `lovable_verify=...` (provided by Lovable)
5. Wait for DNS propagation (up to 72 hours)
6. SSL certificate automatically provisioned

### 4. Verify Deployment

- [ ] Visit your custom domain
- [ ] Test authentication flow
- [ ] Verify map functionality
- [ ] Check translations in multiple languages
- [ ] Test mobile responsiveness
- [ ] Confirm error tracking is working

## Post-Deployment

### Monitoring

1. **Error Tracking**: Check Sentry dashboard regularly
2. **API Usage**: Monitor rate limits in `/pre-deployment` dashboard
3. **Performance**: Review Web Vitals metrics
4. **Database**: Monitor query performance in Supabase

### Backup Strategy

- Automated daily backups enabled in Supabase
- Point-in-time recovery available
- Regular backup testing recommended

### Security

- Keep dependencies updated: `npm audit`
- Review RLS policies quarterly
- Monitor security audit panel: `/admin/security`
- Set up security alerts in Supabase

## Troubleshooting

### Build Errors

**Deno Type Errors**: These are cosmetic and don't affect runtime. The `deno.json` file is configured to resolve them.

```bash
# Verify build works
npm run build

# Check dist folder
ls -lh dist/
```

### Domain Not Working

1. Verify DNS records using [DNSChecker](https://dnschecker.org)
2. Wait 72 hours for propagation
3. Check Lovable dashboard for domain status
4. Ensure no conflicting DNS records exist

### API Rate Limits

1. Check usage in `/pre-deployment` → API Limits tab
2. Implement caching for frequently accessed data
3. Consider upgrading API plans if needed

### Translation Issues

1. Run auto-sync: `/admin/translations` → "Full Auto-Sync"
2. Check GitHub Actions for translation PRs
3. Verify all language files exist in `public/locales/`

## Support Resources

- **Lovable Docs**: https://docs.lovable.dev
- **Deployment Guide**: https://docs.lovable.dev/deployment
- **Custom Domain**: https://docs.lovable.dev/features/custom-domain
- **Supabase Docs**: https://supabase.com/docs
- **Project Dashboard**: `/pre-deployment`

## Emergency Rollback

If issues occur after deployment:

1. Access Lovable dashboard
2. Go to **Deployments** tab
3. Click **"Rollback"** to previous version
4. Investigate and fix issues
5. Re-deploy when ready

---

**Need Help?** Contact Lovable support or check the [documentation](https://docs.lovable.dev).
