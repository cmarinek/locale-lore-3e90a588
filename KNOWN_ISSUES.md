# Known Issues - LocaleLore v1.0.0

**Last Updated:** 2025-11-10  
**Version:** 1.0.0

This document tracks known issues that are not blocking production launch but should be addressed post-launch.

---

## High Priority (Address within 1-2 weeks)

### 1. Deno TypeScript Build Warnings
**Status:** Non-blocking  
**Priority:** Low (cosmetic)  
**Impact:** Development experience only

**Description:**
TypeScript build shows warnings for Deno edge functions regarding module imports and type declarations.

**Workaround:**
These are TypeScript configuration warnings that do not affect runtime. Edge functions deploy and run successfully in Supabase's Deno runtime.

**Plan:**
- Monitor edge function logs post-deployment
- No action required unless runtime issues detected
- Future: Add proper Deno type configuration if needed

**References:**
- All files in `supabase/functions/*`

---

### 2. Email Notifications Not Implemented
**Status:** Feature gap  
**Priority:** High  
**Impact:** User experience

**Description:**
System only supports in-app notifications. Users do not receive email notifications for:
- Friend requests
- Fact likes/comments
- Achievement unlocks
- System announcements

**Workaround:**
Users must check in-app notification center.

**Plan:**
- Implement email notification system in Q1
- Use Supabase Auth email templates
- Create email preference settings
- Add email queue edge function

**Estimated Effort:** 2 weeks  
**Target Date:** Month 2

---

### 3. Push Notifications Missing
**Status:** Feature gap  
**Priority:** Medium  
**Impact:** Mobile user engagement

**Description:**
No push notification support for mobile users.

**Workaround:**
Users rely on in-app notifications.

**Plan:**
- Requires mobile app development
- Implement with Capacitor Push Notifications plugin
- Set up FCM (Firebase Cloud Messaging)
- Create notification preference settings

**Estimated Effort:** 3 weeks  
**Target Date:** Q2 (with mobile app)

---

## Medium Priority (Address within 1-3 months)

### 4. Limited Admin Analytics
**Status:** Feature gap  
**Priority:** Medium  
**Impact:** Admin operations

**Description:**
Admin monitoring dashboard shows basic metrics but lacks:
- Advanced user behavior analytics
- Cohort analysis
- Funnel visualization
- Custom report generation
- Data export capabilities

**Workaround:**
Query database directly for advanced analytics.

**Plan:**
- Expand monitoring dashboard with advanced charts
- Add custom date range selection
- Implement data export feature
- Create custom report builder

**Estimated Effort:** 2-3 weeks  
**Target Date:** Month 3

---

### 5. No Bulk Content Moderation
**Status:** Feature gap  
**Priority:** Medium  
**Impact:** Admin efficiency

**Description:**
Content moderation requires reviewing items one-by-one. No bulk actions for:
- Approving multiple facts
- Rejecting spam
- Flagging content
- Deleting items

**Workaround:**
Process items individually.

**Plan:**
- Add checkbox selection to admin tables
- Implement bulk action buttons
- Add confirmation dialogs
- Create bulk operation edge functions

**Estimated Effort:** 1 week  
**Target Date:** Month 2

---

### 6. Search Limited to Basic Text
**Status:** Feature gap  
**Priority:** Medium  
**Impact:** User experience

**Description:**
Search only supports basic text matching. Missing:
- Fuzzy matching
- Typo tolerance
- Synonym support
- Advanced filters (date range, category, location radius)
- Search suggestions

**Workaround:**
Users must type exact matches.

**Plan:**
- Integrate PostgreSQL full-text search
- Add search filters UI
- Implement autocomplete
- Create search analytics

**Estimated Effort:** 2 weeks  
**Target Date:** Month 3

---

## Low Priority (Address in Q2+)

### 7. No Mobile App
**Status:** Planned feature  
**Priority:** Low (future enhancement)  
**Impact:** Mobile user experience

**Description:**
Application is web-only. No native iOS/Android apps.

**Workaround:**
PWA works on mobile browsers.

**Plan:**
- Develop with Capacitor (already configured)
- Publish to App Store and Google Play
- Add native features (push notifications, camera)
- Optimize for mobile performance

**Estimated Effort:** 6-8 weeks  
**Target Date:** Q2

---

### 8. No Offline Support
**Status:** Planned feature  
**Priority:** Low  
**Impact:** User experience in poor connectivity

**Description:**
Application requires internet connection. Service worker caches assets but no offline data access.

**Workaround:**
Requires stable internet connection.

**Plan:**
- Implement offline data caching
- Add sync queue for offline actions
- Show offline indicator
- Queue fact submissions when offline

**Estimated Effort:** 2-3 weeks  
**Target Date:** Q2

---

### 9. Limited Internationalization
**Status:** Partial implementation  
**Priority:** Low  
**Impact:** International users

**Description:**
Translation system exists but:
- Only English fully translated
- Some hardcoded strings remain
- No RTL language support
- Limited language options

**Workaround:**
English-only for now.

**Plan:**
- Complete translation coverage
- Add more languages (Spanish, French, German)
- Implement RTL support
- Crowdsource translations

**Estimated Effort:** Ongoing  
**Target Date:** Q2-Q3

---

### 10. No Video/Audio Content
**Status:** Future feature  
**Priority:** Low  
**Impact:** Content diversity

**Description:**
Only supports text and images. No support for:
- Video uploads
- Audio clips
- Interactive media
- 360° photos

**Workaround:**
Text and images only.

**Plan:**
- Add video upload support
- Implement audio player
- Create media transcoding pipeline
- Add storage buckets for media

**Estimated Effort:** 4-6 weeks  
**Target Date:** Q3

---

## Cosmetic Issues

### 11. Mobile Menu Animation Jank
**Status:** Minor UX issue  
**Priority:** Very Low  
**Impact:** Visual polish

**Description:**
Mobile hamburger menu animation occasionally stutters on older devices.

**Workaround:**
Still functional, just not smooth.

**Plan:**
- Profile animation performance
- Optimize with CSS will-change
- Test on low-end devices

**Estimated Effort:** 2 hours  
**Target Date:** Month 2

---

### 12. Inconsistent Loading States
**Status:** Minor UX issue  
**Priority:** Very Low  
**Impact:** Visual consistency

**Description:**
Some components show different loading indicators (spinners vs skeletons).

**Workaround:**
All components show loading state, just inconsistent style.

**Plan:**
- Create standardized loading components
- Replace all loading states
- Update design system

**Estimated Effort:** 4 hours  
**Target Date:** Month 2

---

## Security Considerations

### 13. Rate Limiting Not Enforced
**Status:** Security enhancement needed  
**Priority:** Medium  
**Impact:** API abuse potential

**Description:**
Edge functions don't have rate limiting. Potential for:
- API abuse
- DDoS attacks
- Spam submission

**Workaround:**
Monitor for unusual activity.

**Plan:**
- Implement rate limiting middleware
- Add IP-based throttling
- Configure Supabase rate limits
- Add CAPTCHA for submissions

**Estimated Effort:** 1 week  
**Target Date:** Month 1

---

### 14. No CAPTCHA on Forms
**Status:** Security enhancement  
**Priority:** Medium  
**Impact:** Spam prevention

**Description:**
Public forms (signup, fact submission) lack CAPTCHA protection.

**Workaround:**
Moderate content manually.

**Plan:**
- Integrate hCaptcha or reCAPTCHA
- Add to signup flow
- Add to fact submission
- Make configurable per user tier

**Estimated Effort:** 3 days  
**Target Date:** Month 2

---

## Performance Optimizations

### 15. No CDN for Assets
**Status:** Performance enhancement  
**Priority:** Low  
**Impact:** Global performance

**Description:**
Static assets served from origin only. No CDN caching for:
- Images
- CSS/JS bundles
- Fonts

**Workaround:**
Acceptable performance for now.

**Plan:**
- Configure CDN caching headers
- Implement image CDN
- Add asset versioning
- Monitor cache hit rates

**Estimated Effort:** 1 week  
**Target Date:** Month 3

---

### 16. Large Bundle Sizes
**Status:** Performance concern  
**Priority:** Low  
**Impact:** Initial load time

**Description:**
Some route bundles exceed performance budget:
- Map bundle: ~400KB
- Admin dashboard: ~300KB

**Workaround:**
Code splitting helps, but could be better.

**Plan:**
- Analyze bundle composition
- Remove unused dependencies
- Lazy load heavy components
- Optimize Mapbox imports

**Estimated Effort:** 1 week  
**Target Date:** Month 2

---

## Documentation Gaps

### 17. API Documentation Incomplete
**Status:** Documentation gap  
**Priority:** Low  
**Impact:** Developer experience

**Description:**
Edge function API not fully documented.

**Plan:**
- Complete API_DOCUMENTATION.md
- Add OpenAPI/Swagger spec
- Generate interactive docs

**Estimated Effort:** 3 days  
**Target Date:** Month 1

---

## Non-Issues (Documented for Clarity)

### TypeScript Build Warnings
**Status:** Expected  
**Impact:** None

Deno edge functions show TypeScript warnings. This is a known limitation of mixing Node.js TypeScript config with Deno runtime. Does not affect functionality.

### Service Worker Console Logs
**Status:** Expected  
**Impact:** None

PWA service worker logs installation and caching events. This is normal behavior and helpful for debugging.

---

## Issue Tracking

**Total Known Issues:** 17
- **High Priority:** 3
- **Medium Priority:** 4
- **Low Priority:** 6
- **Cosmetic:** 2
- **Security:** 2

**Target Resolution Timeline:**
- **Month 1:** 5 issues
- **Month 2:** 6 issues
- **Month 3:** 3 issues
- **Q2+:** 3 issues

---

## Reporting New Issues

To report a new issue:
1. Check if it's already listed here
2. Assess severity and impact
3. Document reproduction steps
4. Add to this document with:
   - Clear description
   - Impact assessment
   - Workaround if available
   - Proposed plan
   - Estimated effort

---

**Document Maintainer:** Development Team  
**Review Frequency:** Weekly  
**Next Review:** [Date]
