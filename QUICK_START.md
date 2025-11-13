# LocaleLore - Quick Start Guide

Welcome to LocaleLore! This guide will get you from zero to production in 6-8 hours.

---

## 🚀 One-Command Production Readiness Check

**See your overall production readiness score instantly:**

```bash
npm run production-ready
```

This runs all checks and gives you a score from 0-100%.

**Quick mode (skips slow tests):**
```bash
npm run production-ready:quick
```

---

## 📋 Step-by-Step Launch Process

### Step 1: Verify Environment Variables (15 minutes)

```bash
# Check your current configuration
npm run verify:env

# For production deployment
npm run verify:env:prod
```

**Fix issues:**
1. Copy `.env.production.example` to `.env`
2. Fill in all required values
3. Run verification again

### Step 2: Configure Stripe (2-3 hours)

```bash
# Verify Stripe configuration
npm run verify:stripe

# For production (checks live keys)
npm run verify:stripe:prod
```

**Follow the guide:** `docs/STRIPE_PRODUCTION_SETUP.md`

### Step 3: Pre-Deployment Checks (30 minutes)

```bash
# Run comprehensive deployment checks
npm run pre-deploy
```

This automatically checks:
- ✅ Git status
- ✅ Dependencies installed
- ✅ TypeScript compilation
- ✅ Linting
- ✅ Build succeeds
- ✅ Environment variables
- ✅ Tests passing
- ✅ Bundle size
- ✅ Security configuration

### Step 4: Deploy to Production (10 minutes)

```bash
# Deploy to production
git push origin production

# Or use the deploy script
npm run deploy:production
```

---

## 🛠️ Available Commands

### Development

```bash
npm run dev                    # Start development server
npm run build                  # Build for production
npm run preview                # Preview production build locally
```

### Testing

```bash
npm test                       # Run all tests
npm run test:unit              # Unit tests only
npm run test:integration       # Integration tests
npm run test:e2e               # End-to-end tests with Playwright
npm run lint                   # Lint code
npm run type-check             # TypeScript type checking
```

### Production Readiness

```bash
npm run production-ready       # Full readiness assessment (recommended)
npm run production-ready:quick # Quick check (skips tests/build)
npm run verify:env             # Check environment variables
npm run verify:env:prod        # Check production environment
npm run verify:stripe          # Verify Stripe configuration
npm run verify:stripe:prod     # Verify Stripe production setup
npm run pre-deploy             # Pre-deployment checks
```

### Deployment

```bash
npm run deploy:production      # Deploy to production
npm run monitor:production     # Production monitoring
```

---

## 📊 Understanding Your Readiness Score

### 95-100%: 🚀 READY TO LAUNCH
- All critical checks passed
- Optional improvements only
- **Action:** Deploy to production!

### 80-94%: ⚠️ ALMOST READY
- Core functionality complete
- Some warnings or optional items missing
- **Action:** Review warnings, then consider launching

### 60-79%: 🔧 NEEDS WORK
- Several issues to resolve
- Not recommended for production
- **Action:** Follow the checklist and fix issues

### 0-59%: ❌ NOT READY
- Critical issues present
- Application may not function
- **Action:** Start with `docs/LAUNCH_CHECKLIST.md`

---

## 🎯 Quickest Path to 100%

**Total time: 6-8 hours**

1. **Configure Environment** (1 hour)
   ```bash
   cp .env.production.example .env
   # Fill in all values
   npm run verify:env:prod
   ```

2. **Set Up Stripe** (2-3 hours)
   - Follow: `docs/STRIPE_PRODUCTION_SETUP.md`
   - Create products (Basic, Premium, Pro)
   - Configure webhooks
   - Test with real payment
   ```bash
   npm run verify:stripe:prod
   ```

3. **Set Up Monitoring** (1 hour)
   - Follow: `docs/MONITORING_ALERTING_SETUP.md`
   - Sign up for Sentry (free)
   - Add DSN to environment
   - Set up UptimeRobot (free)

4. **Run Final Checks** (30 minutes)
   ```bash
   npm run production-ready
   # Should show 95%+
   ```

5. **Deploy** (30 minutes)
   ```bash
   npm run pre-deploy     # Final verification
   git push origin production
   # Monitor deployment
   ```

6. **Post-Launch** (1 hour)
   - Test one subscription
   - Monitor errors in Sentry
   - Check uptime monitor
   - Celebrate! 🎉

---

## 🆘 Troubleshooting

### "Environment variables not set"

```bash
# 1. Check if .env file exists
ls -la .env

# 2. If not, create it
cp .env.production.example .env

# 3. Edit and fill in values
nano .env  # or use your editor

# 4. Verify
npm run verify:env
```

### "Stripe verification failed"

```bash
# 1. Check Stripe keys are set
grep STRIPE .env

# 2. Verify you're using the right mode
npm run verify:stripe          # Test mode
npm run verify:stripe:prod     # Live mode

# 3. Follow the setup guide
open docs/STRIPE_PRODUCTION_SETUP.md
```

### "Build fails"

```bash
# 1. Clean install dependencies
rm -rf node_modules package-lock.json
npm install

# 2. Check TypeScript errors
npm run type-check

# 3. Try building
npm run build
```

### "Tests failing"

```bash
# 1. Run tests to see failures
npm run test:unit

# 2. Run specific test file
npm test -- path/to/test.test.ts

# 3. Fix issues and re-run
npm run pre-deploy
```

---

## 📚 Documentation

- **[LAUNCH_CHECKLIST.md](docs/LAUNCH_CHECKLIST.md)** - Complete launch checklist
- **[STRIPE_PRODUCTION_SETUP.md](docs/STRIPE_PRODUCTION_SETUP.md)** - Stripe configuration guide
- **[MONITORING_ALERTING_SETUP.md](docs/MONITORING_ALERTING_SETUP.md)** - Monitoring setup
- **[PRODUCTION_DEPLOYMENT_RUNBOOK.md](docs/PRODUCTION_DEPLOYMENT_RUNBOOK.md)** - Deployment procedures
- **[POST_LAUNCH_ROADMAP.md](docs/POST_LAUNCH_ROADMAP.md)** - Feature roadmap
- **[docs/README.md](docs/README.md)** - Full documentation index

---

## ✅ Daily Production Checklist

After launching, run these checks daily:

```bash
# Morning check (2 minutes)
npm run production-ready:quick

# Review errors (Sentry dashboard)
open https://sentry.io

# Check uptime (UptimeRobot)
open https://uptimerobot.com

# Verify payments (Stripe dashboard)
open https://dashboard.stripe.com
```

---

## 🎓 Common Workflows

### Adding a New Feature

```bash
# 1. Create feature branch
git checkout -b feature/new-feature

# 2. Develop and test
npm run dev
npm test

# 3. Verify before merging
npm run lint
npm run type-check
npm run build

# 4. Merge and deploy
git push origin feature/new-feature
# Create PR, get approval
git checkout production
git merge feature/new-feature
git push origin production
```

### Hotfix Deployment

```bash
# 1. Create hotfix branch
git checkout -b hotfix/critical-fix

# 2. Make minimal changes
# ... fix the issue ...

# 3. Quick verification
npm run type-check
npm run build

# 4. Deploy immediately
git push origin hotfix/critical-fix
# Merge to production
```

### Rolling Back

```bash
# Option 1: Via Lovable dashboard
# 1. Go to Lovable dashboard
# 2. Find previous deployment
# 3. Click "Promote to Production"

# Option 2: Git revert
git revert HEAD
git push origin production
```

---

## 🌟 Success Metrics

Track these after launch:

### Technical
- ✅ Error rate < 0.1%
- ✅ Uptime > 99.9%
- ✅ Page load < 3s
- ✅ Payment success rate > 95%

### Business
- 📈 Daily active users
- 💰 Monthly recurring revenue
- 📊 User retention (D7, D30)
- ⭐ App store rating > 4.5

---

## 🎯 Next Steps

1. **Run readiness check:**
   ```bash
   npm run production-ready
   ```

2. **If score < 80%:**
   - Read: `docs/LAUNCH_CHECKLIST.md`
   - Fix: Critical issues listed
   - Re-run: `npm run production-ready`

3. **If score 80-94%:**
   - Review: Warnings and recommendations
   - Fix: High-priority items
   - Deploy: When confident

4. **If score 95%+:**
   - Deploy: `git push origin production`
   - Monitor: Watch Sentry and uptime
   - Test: One subscription flow
   - Launch: Announce to users! 🚀

---

## 💡 Pro Tips

1. **Use the quick check during development:**
   ```bash
   npm run production-ready:quick
   ```

2. **Automate pre-deployment in CI/CD:**
   ```yaml
   # .github/workflows/deploy.yml
   - name: Pre-deployment check
     run: npm run pre-deploy
   ```

3. **Set up git hooks:**
   ```bash
   # .husky/pre-push
   npm run lint
   npm run type-check
   ```

4. **Monitor the readiness file:**
   ```bash
   cat .production-readiness.json
   # Shows latest assessment results
   ```

---

## 📞 Need Help?

- **Documentation:** `docs/README.md`
- **Issues:** Check common issues in deployment runbook
- **Support:** support@localelore.com
- **Security:** security@localelore.com

---

**Ready to launch? Start here:**

```bash
npm run production-ready
```

Good luck! 🚀
