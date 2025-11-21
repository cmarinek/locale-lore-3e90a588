# Real Beta Testing Checklist
## LocaleLore Production Infrastructure Testing

**Last Updated:** November 20, 2025
**Domain:** localelore.org
**Purpose:** Test actual production infrastructure with real scenarios

---

## 🎯 TESTING OBJECTIVE

Verify that all systems work correctly with **real infrastructure**:
- ✅ Real domain (localelore.org)
- ✅ Real Supabase instance
- ✅ Real database with actual data
- ✅ Real authentication flows
- ✅ Real file uploads to Supabase Storage
- ✅ Real API calls to edge functions

**This is NOT test mode** - This is testing your actual production setup.

---

## 📋 PRE-TEST SETUP

### Step 1: Verify Deployment
```bash
# Check current deployment
curl -I https://localelore.org

# Should return: HTTP/2 200
# Should show: Content-Type: text/html
```

### Step 2: Check Browser Console
1. Open https://localelore.org
2. Open DevTools (F12)
3. Check Console tab
4. **Should NOT see:**
   - ❌ `Cannot read properties of undefined (reading 'unstable_scheduleCallback')`
   - ❌ `Supabase configuration is missing`
   - ❌ Any red errors on page load

5. **Should see:**
   - ✅ `[Bootstrap] Application initialization complete`
   - ✅ No critical errors

### Step 3: Verify Environment Variables
Check that these are configured in your production deployment:
- [ ] `VITE_SUPABASE_URL` - Set to your Supabase project URL
- [ ] `VITE_SUPABASE_PUBLISHABLE_KEY` - Set to your anon/public key
- [ ] `VITE_APP_URL` - Set to https://localelore.org

**If any are missing, you'll see a configuration error screen.**

---

## 1️⃣ HOMEPAGE & NAVIGATION TEST

**Test ID:** HOME-001
**Duration:** 2 minutes
**Critical:** Yes

### Steps:
1. Visit https://localelore.org
2. Wait for page to fully load
3. Check for visual issues

### Verify:
- [ ] Page loads without white screen
- [ ] No JavaScript errors in console
- [ ] Navigation menu appears
- [ ] Logo/branding shows correctly
- [ ] Map loads (if on homepage)
- [ ] Footer shows correct links

### Expected Result:
Homepage loads completely with no errors.

### If Failed:
- Check browser console for errors
- Check network tab for failed requests
- Verify DNS is pointing to correct server
- Clear browser cache and retry

---

## 2️⃣ SIGN UP FLOW TEST (Critical)

**Test ID:** AUTH-001
**Duration:** 5 minutes
**Critical:** Yes - Blocks all features

### Steps:
1. Click **Sign Up** or go to /auth
2. Enter test email: `test+beta1@yourdomain.com` (use + addressing to test multiple accounts)
3. Enter strong password: `TestPassword123!@#`
4. **DO NOT FILL CAPTCHA YET** - Check that subscribe button is disabled
5. Fill hCaptcha (if configured)
6. Click **Sign Up**

### Verify:
- [ ] hCaptcha appears (if configured) ✅
- [ ] Subscribe button disabled until CAPTCHA completed ✅
- [ ] Sign up button shows loading state
- [ ] Redirects to email confirmation page or dashboard
- [ ] Receives confirmation email (check spam folder)
- [ ] Email contains correct support@localelore.org sender

### Expected Result:
- User account created in Supabase
- Confirmation email received
- Can verify email and log in

### If Failed - hCaptcha not appearing:
```
Error: CAPTCHA widget not showing

FIX:
1. Verify VITE_HCAPTCHA_SITE_KEY is set in .env.production
2. Rebuild: npm run build
3. Redeploy
4. Clear browser cache
```

### If Failed - Email not received:
```
Error: No confirmation email

CHECK:
1. Supabase Dashboard → Authentication → Email Templates
2. Verify SMTP is configured OR using Supabase's email service
3. Check spam/junk folder
4. Verify sender domain is configured

TEMPORARY WORKAROUND:
Go to Supabase Dashboard → Authentication → Users
Find user → Click 3 dots → Confirm email manually
```

---

## 3️⃣ SIGN IN FLOW TEST

**Test ID:** AUTH-002
**Duration:** 2 minutes
**Critical:** Yes

### Steps:
1. Go to /auth
2. Switch to **Sign In** tab
3. Enter email from previous test
4. Enter password
5. Click **Sign In**

### Verify:
- [ ] Sign in button shows loading state
- [ ] Redirects to dashboard/home after sign in
- [ ] User name/avatar shows in header
- [ ] No console errors
- [ ] Session persists on page refresh

### Expected Result:
User successfully signs in and stays signed in.

### If Failed:
```
Error: "Invalid login credentials"

CHECK:
1. Verify email is confirmed in Supabase
2. Check password is correct
3. Try "Forgot Password" flow
```

---

## 4️⃣ DATABASE READ TEST

**Test ID:** DB-001
**Duration:** 3 minutes
**Critical:** Yes

### Steps:
1. Sign in (if not already)
2. Navigate to /explore or /stories
3. Wait for content to load

### Verify:
- [ ] Content loads from database
- [ ] No "No data" or empty state (unless database is actually empty)
- [ ] No console errors about database queries
- [ ] Loading states show correctly
- [ ] Data renders properly

### Expected Result:
Database queries work and data displays.

### If Failed:
```
Error: "Error fetching data" or empty state

CHECK:
1. Supabase Dashboard → Database → Check if tables have data
2. If no data: Create test data manually or run seed script
3. Check Row Level Security policies allow reads
4. Network tab: Check if API requests return 200

FIX RLS:
-- Allow all users to read verified content
CREATE POLICY "Public stories are viewable by everyone"
ON stories FOR SELECT
USING (status = 'verified' OR status = 'published');
```

---

## 5️⃣ CREATE CONTENT TEST (Story)

**Test ID:** CREATE-001
**Duration:** 5 minutes
**Critical:** Yes

### Steps:
1. Sign in
2. Go to /submit or click "Create Story"
3. Fill out story form:
   - Title: "Beta Test Story 1"
   - Description: "This is a test story created during beta testing on [current date]"
   - Location: Pick any location on map or enter address
   - Category: Select any category
4. Click **Submit** or **Save**

### Verify:
- [ ] Form validates correctly
- [ ] Map picker works
- [ ] Can select location
- [ ] Submit button shows loading state
- [ ] Success message appears
- [ ] Redirects to story view or list
- [ ] Story appears in database (check Supabase)

### Expected Result:
Story is created and saved to database.

### If Failed:
```
Error: "Failed to create story"

CHECK:
1. Browser console for specific error
2. Supabase Dashboard → Edge Functions → Logs
3. Check RLS policies allow inserts for authenticated users

FIX RLS:
-- Allow authenticated users to create stories
CREATE POLICY "Authenticated users can create stories"
ON stories FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = author_id);
```

---

## 6️⃣ FILE UPLOAD TEST

**Test ID:** UPLOAD-001
**Duration:** 5 minutes
**Critical:** High

### Steps:
1. When creating story (previous test), add an image:
   - Click "Upload Image" or similar button
   - Select a test image (JPG or PNG, < 5MB)
   - Wait for upload to complete
2. Submit story with image

### Verify:
- [ ] File upload shows progress bar
- [ ] Upload completes successfully
- [ ] Thumbnail shows in form
- [ ] Image appears after story is saved
- [ ] Image loads from Supabase Storage URL
- [ ] Image has correct permissions (accessible to users)

### Expected Result:
Image uploads to Supabase Storage and displays correctly.

### If Failed:
```
Error: "Upload failed" or "Access denied"

CHECK:
1. Supabase Dashboard → Storage → Check bucket exists
2. Verify bucket is public or has correct RLS policies
3. Check file size limits (default: 5MB)
4. Network tab: Check for CORS errors

FIX STORAGE:
-- Make images bucket publicly readable
UPDATE storage.buckets
SET public = true
WHERE id = 'images';

-- Or add RLS policy:
CREATE POLICY "Images are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'images');
```

---

## 7️⃣ SEARCH TEST

**Test ID:** SEARCH-001
**Duration:** 3 minutes
**Critical:** Medium

### Steps:
1. Go to search page (/search) or use search bar
2. Type: "test" or "beta"
3. Press Enter or click Search
4. Wait for results

### Verify:
- [ ] Search executes without error
- [ ] Results load (even if empty)
- [ ] Loading state shows
- [ ] Results display correctly
- [ ] Can click result to view details
- [ ] No console errors

### Expected Result:
Search works and returns results (if matching data exists).

### If Failed:
```
Error: "Search failed"

CHECK:
1. Supabase Dashboard → Edge Functions → intelligent-search
2. Check function logs for errors
3. Verify full-text search is set up on database
4. May need to run: UPDATE stories SET search_vector = to_tsvector('english', title || ' ' || description);
```

---

## 8️⃣ SUBSCRIPTION FLOW TEST (If Stripe Configured)

**Test ID:** PAYMENT-001
**Duration:** 10 minutes
**Critical:** High (if monetizing)

⚠️ **IMPORTANT:** This test charges a REAL credit card if Stripe is in live mode.

### Pre-Test Setup:
Option A: Use Stripe Test Mode
- Keep VITE_STRIPE_PUBLISHABLE_KEY as `pk_test_...`
- Use test card: 4242 4242 4242 4242

Option B: Use Live Mode (Real Charge)
- Use real credit card
- You WILL be charged (can refund immediately after)

### Steps:
1. Sign in
2. Go to /pricing or subscription page
3. Click **Subscribe** on Basic plan ($9.99/month)
4. **Note the badge:** Should show "3-day free trial" ✅
5. Enter payment details in Stripe Checkout
6. Complete payment
7. Wait for redirect back to your site

### Verify:
- [ ] Stripe Checkout opens in new tab/window
- [ ] Shows "3-day free trial" in checkout ✅
- [ ] Can enter payment details
- [ ] Payment processes successfully
- [ ] Redirects to success page (/billing/success)
- [ ] User's subscription status updates in app
- [ ] User can access premium features
- [ ] Webhook was received (check Supabase function logs)

### Expected Result:
- Subscription created with 3-day trial
- User not charged immediately (trial period)
- Subscription shows in Stripe Dashboard
- User upgraded in app

### If Failed:
```
Error: "Checkout failed"

CHECK:
1. VITE_STRIPE_PUBLISHABLE_KEY is set correctly
2. Stripe edge function is deployed
3. Webhook is configured in Stripe Dashboard
4. Webhook secret matches environment variable

Error: "No trial showing"
FIX: Code should already show 3-day trial (just fixed)
```

---

## 9️⃣ CANCEL SUBSCRIPTION TEST (If Stripe Configured)

**Test ID:** PAYMENT-002
**Duration:** 5 minutes
**Critical:** Medium

### Steps:
1. After subscribing (previous test)
2. Go to account settings → Billing
3. Click "Manage Subscription" or "Customer Portal"
4. Should redirect to Stripe Customer Portal
5. Click "Cancel subscription"
6. Confirm cancellation
7. Return to your app

### Verify:
- [ ] Customer Portal loads
- [ ] Can view subscription details
- [ ] Can update payment method
- [ ] Can cancel subscription
- [ ] Cancellation processes successfully
- [ ] User retains access until end of period
- [ ] Subscription status updates in app

### Expected Result:
User can successfully cancel and access remains until period ends.

---

## 🔟 REAL USER SCENARIOS

Test these realistic user journeys:

### Scenario A: New User Discovery Journey
1. Land on homepage (not signed in)
2. Browse map/stories without account
3. Try to like/comment (should prompt to sign up)
4. Sign up for account
5. Verify email
6. Sign in
7. Like a story
8. Leave a comment
9. Create their own story

**Success:** Complete journey without errors

---

### Scenario B: Power User Journey
1. Sign in
2. Create 5 different stories
3. Upload images to multiple stories
4. Search for own stories
5. Edit one story
6. Delete one story
7. View profile
8. Browse other users' content

**Success:** All CRUD operations work

---

### Scenario C: Premium User Journey
1. Sign in as free user
2. Try to access premium feature (should block or show upgrade)
3. Go to pricing page
4. Subscribe to Premium plan with 3-day trial ✅
5. Verify premium features unlock
6. Use premium feature successfully
7. Manage subscription
8. Cancel subscription

**Success:** Subscription and feature gating works

---

## 1️⃣1️⃣ MOBILE TESTING

**Test ID:** MOBILE-001
**Duration:** 10 minutes
**Critical:** High

### Devices to Test:
- iPhone (Safari)
- Android (Chrome)
- Tablet (any)

### Steps:
1. Visit https://localelore.org on mobile device
2. Test all critical flows from above:
   - Sign up
   - Sign in
   - Create story
   - Upload image
   - Search

### Verify:
- [ ] Page is responsive
- [ ] No horizontal scrolling
- [ ] Buttons are tappable (not too small)
- [ ] Forms work with mobile keyboard
- [ ] Map works with touch
- [ ] Images load correctly
- [ ] Navigation menu works

---

## 1️⃣2️⃣ PERFORMANCE TEST

**Test ID:** PERF-001
**Duration:** 5 minutes
**Critical:** Medium

### Tools:
- Chrome DevTools → Lighthouse
- Or: https://pagespeed.web.dev/

### Steps:
1. Open https://localelore.org
2. Run Lighthouse audit
3. Check scores:
   - Performance
   - Accessibility
   - Best Practices
   - SEO

### Target Scores:
- Performance: > 80 ✅
- Accessibility: > 90
- Best Practices: > 90
- SEO: > 90

### If Scores Low:
- Performance: Check image sizes, lazy loading
- Accessibility: Check alt text, ARIA labels
- Best Practices: Check console errors, HTTPS
- SEO: Check meta tags, titles, descriptions

---

## 1️⃣3️⃣ ERROR HANDLING TEST

**Test ID:** ERROR-001
**Duration:** 5 minutes
**Critical:** Medium

### Intentional Error Scenarios:

**Test A: Network Offline**
1. Open DevTools → Network tab
2. Select "Offline" from throttling dropdown
3. Try to load a page
4. Should show offline message (not white screen)

**Test B: Invalid Route**
1. Visit https://localelore.org/nonexistent-page
2. Should show 404 page (not white screen)

**Test C: Invalid API Request**
1. Sign in, open DevTools Console
2. Type: `fetch('/api/invalid').then(r => r.json())`
3. Check error is caught gracefully

### Verify:
- [ ] App doesn't crash completely
- [ ] User-friendly error messages shown
- [ ] Errors logged to Sentry (if configured)
- [ ] User can recover (refresh, go back, etc.)

---

## 📊 TEST RESULTS TEMPLATE

Copy this template and fill it out:

```
=== BETA TEST RESULTS ===
Date: [DATE]
Tester: [YOUR NAME]
Browser: [Chrome/Firefox/Safari] [VERSION]
Device: [Desktop/Mobile/Tablet]

CRITICAL TESTS:
[ ] HOME-001: Homepage loads - PASS/FAIL
[ ] AUTH-001: Sign up works - PASS/FAIL
    - hCaptcha appears: YES/NO ✅
[ ] AUTH-002: Sign in works - PASS/FAIL
[ ] DB-001: Database reads work - PASS/FAIL
[ ] CREATE-001: Can create content - PASS/FAIL
[ ] UPLOAD-001: Can upload files - PASS/FAIL
[ ] PAYMENT-001: Subscription works - PASS/FAIL (if tested)
    - Shows 3-day trial: YES/NO ✅

BUGS FOUND:
1. [Description]
   - Steps to reproduce
   - Expected vs Actual
   - Severity: Critical/High/Medium/Low

2. [Description]
   ...

NOTES:
- [Any observations]
- [Performance issues]
- [User experience feedback]

OVERALL READINESS: READY / NOT READY
```

---

## 🚨 CRITICAL ISSUES THAT BLOCK LAUNCH

If ANY of these fail, DO NOT launch:

1. ❌ Homepage doesn't load (white screen)
2. ❌ Users can't sign up/sign in
3. ❌ Database queries fail completely
4. ❌ Users can't create content
5. ❌ Payment processing completely broken
6. ❌ Major security vulnerability discovered
7. ❌ Data loss or corruption occurs
8. ❌ React scheduler error still occurs ✅ FIXED

---

## ✅ GO/NO-GO DECISION

### READY TO LAUNCH if:
- ✅ All CRITICAL tests pass
- ✅ No blocking bugs found
- ✅ Payment flow works (if monetizing)
- ✅ Mobile experience acceptable
- ✅ Performance scores > 70

### NOT READY if:
- ❌ Any CRITICAL test fails
- ❌ Security vulnerabilities found
- ❌ Data loss/corruption occurs
- ❌ Payment processing broken
- ❌ Showstopper bugs discovered

---

## 📞 SUPPORT DURING TESTING

**If you find critical bugs:**
1. Note exact steps to reproduce
2. Take screenshots
3. Check browser console
4. Check Supabase logs
5. Document and let me know

**Common Issues & Quick Fixes:**
See each test section for specific troubleshooting.

---

## 🎉 AFTER SUCCESSFUL TESTING

Once all tests pass:
1. ✅ Mark all items in FINAL_LAUNCH_CHECKLIST.md
2. ✅ Review PRODUCTION_MONITORING_GUIDE.md
3. ✅ Set up monitoring (Sentry, UptimeRobot)
4. ✅ Announce beta launch
5. ✅ Monitor closely for first 48 hours

---

**Testing Status:** Ready to begin
**Estimated Testing Time:** 2-3 hours for complete test suite
**Recommended:** Test in stages, not all at once

**Good luck with your beta testing! 🚀**
