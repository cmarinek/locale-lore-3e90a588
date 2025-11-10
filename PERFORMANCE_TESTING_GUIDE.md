# Performance Testing & Optimization Guide

## 🎯 Testing Objectives

This guide provides step-by-step instructions for running Lighthouse audits and interpreting performance metrics for LocaleLore.

### Target Scores
- **Performance**: ≥90
- **Accessibility**: ≥95
- **Best Practices**: ≥95
- **SEO**: ≥90
- **Core Web Vitals**: All green
  - LCP (Largest Contentful Paint): <2.5s
  - FID (First Input Delay): <100ms  
  - CLS (Cumulative Layout Shift): <0.1

---

## 📋 How to Run Lighthouse Audits

### Method 1: Chrome DevTools (Recommended)

1. **Open Chrome DevTools**
   - Press `F12` or `Ctrl+Shift+I` (Windows/Linux)
   - Press `Cmd+Option+I` (Mac)

2. **Navigate to Lighthouse Tab**
   - Click "Lighthouse" tab in DevTools
   - If not visible, click ">>" and select "Lighthouse"

3. **Configure Audit**
   - Mode: **Navigation** (default)
   - Device: **Desktop** or **Mobile**
   - Categories: Check all (Performance, Accessibility, Best Practices, SEO)

4. **Run Audit**
   - Click "Analyze page load"
   - Wait for audit to complete (30-60 seconds)

5. **Save Results**
   - Click "Save as HTML" to download report
   - Take screenshots of key metrics

### Method 2: PageSpeed Insights (Online)

1. Visit: https://pagespeed.web.dev/
2. Enter your URL (must be publicly accessible)
3. Click "Analyze"
4. View both Mobile and Desktop results

### Method 3: Using Performance Utils (Built-in)

```javascript
// Open browser console on any page
import { generatePerformanceReport, logPerformanceReport } from '@/utils/performance-utils';

// Generate and log report
const report = await generatePerformanceReport();
logPerformanceReport(report);

// Save report
console.save(report, 'performance-report.json');
```

---

## 🧪 Pages to Test

Test ALL of the following pages and record scores:

| Page | URL | Priority | Notes |
|------|-----|----------|-------|
| Homepage | `/` | Critical | First impression |
| Map | `/map` | Critical | Heavy JS/rendering |
| Search | `/search` | High | Interactive features |
| Fact Detail | `/fact/:id` | High | Content-heavy |
| Profile | `/profile` | Medium | Authenticated |
| Gamification | `/gamification` | Medium | Animated content |
| Admin Dashboard | `/admin` | Low | Admin-only |

### How to Test Each Page

```bash
# 1. Navigate to page
# 2. Wait for page to fully load (no loading spinners)
# 3. Run Lighthouse audit (Method 1 above)
# 4. Record scores in table below
# 5. Screenshot any issues/warnings
```

---

## 📊 Performance Audit Results Template

### Before Optimization

| Page | Performance | Accessibility | Best Practices | SEO | LCP | FID | CLS | Issues |
|------|-------------|---------------|----------------|-----|-----|-----|-----|--------|
| Homepage | ___ | ___ | ___ | ___ | ___s | ___ms | ___ | ___ |
| Map | ___ | ___ | ___ | ___ | ___s | ___ms | ___ | ___ |
| Search | ___ | ___ | ___ | ___ | ___s | ___ms | ___ | ___ |
| Fact Detail | ___ | ___ | ___ | ___ | ___s | ___ms | ___ | ___ |
| Profile | ___ | ___ | ___ | ___ | ___s | ___ms | ___ | ___ |
| Gamification | ___ | ___ | ___ | ___ | ___s | ___ms | ___ | ___ |
| Admin | ___ | ___ | ___ | ___ | ___s | ___ms | ___ | ___ |

### After Optimization

| Page | Performance | Accessibility | Best Practices | SEO | LCP | FID | CLS | Improvement |
|------|-------------|---------------|----------------|-----|-----|-----|-----|-------------|
| Homepage | ___ | ___ | ___ | ___ | ___s | ___ms | ___ | +___% |
| Map | ___ | ___ | ___ | ___ | ___s | ___ms | ___ | +___% |
| Search | ___ | ___ | ___ | ___ | ___s | ___ms | ___ | +___% |
| Fact Detail | ___ | ___ | ___ | ___ | ___s | ___ms | ___ | +___% |
| Profile | ___ | ___ | ___ | ___ | ___s | ___ms | ___ | +___% |
| Gamification | ___ | ___ | ___ | ___ | ___s | ___ms | ___ | +___% |
| Admin | ___ | ___ | ___ | ___ | ___s | ___ms | ___ | +___% |

---

## 🔧 Optimizations Already Applied

### 1. Code Splitting ✅
**Location**: `vite.config.ts`
```typescript
manualChunks: (id) => {
  if (id.includes('react')) return 'react-vendor';
  if (id.includes('@radix-ui')) return 'ui-vendor';
  if (id.includes('mapbox')) return 'map-vendor';
  // ... more splits
}
```

**Impact**: Reduces initial bundle size by splitting code into smaller chunks

### 2. Route-Based Lazy Loading ✅
**Location**: `src/components/app/AppRoutes.tsx`
```typescript
const Explore = lazy(() => import('@/pages/Explore'));
const Search = lazy(() => import('@/pages/Search'));
// ... all routes lazy loaded
```

**Impact**: Only load code for routes user visits

### 3. Font Optimization ✅
**Location**: `index.html`
```html
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
```

**Impact**: Reduces font loading time with preconnect

### 4. SEO Optimization ✅
**Location**: `index.html`
- Meta descriptions
- Open Graph tags
- Twitter cards
- Structured data (JSON-LD)
- Canonical URLs

**Impact**: Improved SEO score

### 5. Build Optimizations ✅
**Location**: `vite.config.ts`
```typescript
build: {
  target: "esnext",
  minify: "esbuild",
  cssMinify: true,
  chunkSizeWarningLimit: 500,
}
```

**Impact**: Smaller, faster bundles

---

## 🚀 Additional Optimizations Needed

### If Performance Score <90:

#### 1. Image Optimization
```typescript
// Current: Regular img tags
<img src="image.jpg" alt="Description" />

// Optimized: Lazy loading + WebP
<img 
  src="image.webp" 
  alt="Description"
  loading="lazy"
  width="800"
  height="600"
/>
```

#### 2. Add Resource Hints
```html
<!-- Add to index.html -->
<link rel="preload" as="script" href="/critical-script.js" />
<link rel="prefetch" as="script" href="/secondary-script.js" />
<link rel="dns-prefetch" href="https://api.domain.com" />
```

#### 3. Reduce JavaScript Execution Time
- Remove unused dependencies
- Use web workers for heavy computations
- Debounce/throttle event handlers

### If Accessibility Score <95:

#### Common Issues:
1. Missing alt text on images
2. Insufficient color contrast
3. Missing ARIA labels
4. Keyboard navigation issues

#### Fixes:
```tsx
// Add proper ARIA labels
<button aria-label="Close dialog">X</button>

// Ensure keyboard navigation
<div role="button" tabIndex={0} onKeyPress={handleKeyPress}>

// Proper heading hierarchy
<h1>Main Title</h1>
<h2>Subsection</h2>
<h3>Details</h3>
```

### If Best Practices Score <95:

#### Common Issues:
1. Console errors/warnings
2. Deprecated APIs
3. Mixed HTTP/HTTPS content
4. No HTTPS

#### Fixes:
- Fix all console errors
- Update deprecated code
- Use HTTPS everywhere
- Add proper error boundaries

### If SEO Score <90:

#### Common Issues:
1. Missing meta descriptions
2. Images without alt text
3. Links without descriptive text
4. Missing canonical URLs

#### Fixes:
```tsx
// Add to each page
<Helmet>
  <title>Page Title | LocaleLore</title>
  <meta name="description" content="Page description" />
  <link rel="canonical" href="https://localelore.app/page" />
</Helmet>
```

---

## 📈 Core Web Vitals Optimization

### LCP (Largest Contentful Paint) - Target: <2.5s

**If LCP > 2.5s:**
1. Optimize largest image/element
2. Use priority hints: `<img fetchpriority="high" />`
3. Eliminate render-blocking resources
4. Use CDN for static assets
5. Implement server-side rendering (SSR)

### FID (First Input Delay) - Target: <100ms

**If FID > 100ms:**
1. Break up long JavaScript tasks
2. Use web workers for heavy computations
3. Optimize event handlers
4. Implement code splitting
5. Use requestIdleCallback for non-critical work

### CLS (Cumulative Layout Shift) - Target: <0.1

**If CLS > 0.1:**
1. Add width/height to all images
2. Reserve space for ads/embeds
3. Avoid inserting content above existing content
4. Use CSS aspect-ratio
5. Preload fonts

---

## 🛠️ Testing Workflow

### Step 1: Baseline Audit
```bash
1. Clear cache: Ctrl+Shift+Delete
2. Open DevTools: F12
3. Navigate to Lighthouse
4. Run audit on all pages
5. Record BEFORE scores
```

### Step 2: Identify Issues
```bash
1. Review Lighthouse reports
2. Note all red/yellow items
3. Prioritize by impact
4. Create issue list
```

### Step 3: Apply Fixes
```bash
1. Fix high-impact issues first
2. Test fix locally
3. Re-run Lighthouse
4. Verify improvement
```

### Step 4: Final Audit
```bash
1. Clear cache again
2. Run Lighthouse on all pages
3. Record AFTER scores
4. Calculate improvements
5. Document remaining issues
```

### Step 5: Production Testing
```bash
1. Deploy to staging
2. Run PageSpeed Insights
3. Test on slow 3G connection
4. Test on mobile device
5. Verify all metrics meet targets
```

---

## 📊 Interpreting Lighthouse Scores

### Performance Score Breakdown
- **90-100**: Excellent ✅
- **50-89**: Needs Improvement 🟨
- **0-49**: Poor ❌

### What Each Score Measures

**Performance (Weight: 100)**
- First Contentful Paint (10%)
- Speed Index (10%)
- Largest Contentful Paint (25%)
- Time to Interactive (10%)
- Total Blocking Time (30%)
- Cumulative Layout Shift (15%)

**Accessibility (Weight: 100)**
- Color contrast
- ARIA attributes
- Form labels
- Alt text
- Keyboard navigation

**Best Practices (Weight: 100)**
- HTTPS usage
- Console errors
- Deprecated APIs
- Vulnerability checks
- Image optimization

**SEO (Weight: 100)**
- Meta descriptions
- Crawlable links
- Proper heading structure
- Mobile-friendly
- Canonical URLs

---

## 🎯 Success Criteria

✅ **All pages meet or exceed:**
- Performance: ≥90
- Accessibility: ≥95
- Best Practices: ≥95
- SEO: ≥90

✅ **Core Web Vitals all green:**
- LCP <2.5s
- FID <100ms
- CLS <0.1

✅ **No critical issues:**
- No console errors
- All images optimized
- No render-blocking resources
- Proper caching headers

---

## 🐛 Common Issues & Solutions

### Issue: Large JavaScript Bundle
**Solution**: Code splitting (already implemented in vite.config.ts)

### Issue: Render-Blocking CSS
**Solution**: Inline critical CSS, defer non-critical CSS

### Issue: Unoptimized Images
**Solution**: Convert to WebP, add lazy loading, set dimensions

### Issue: Missing Alt Text
**Solution**: Add descriptive alt text to all images

### Issue: Poor Color Contrast
**Solution**: Use design system colors with proper contrast ratios

### Issue: Slow Server Response
**Solution**: Optimize database queries, add caching, use CDN

---

## 📝 Report Template

```markdown
# Performance Audit Report
**Date**: [DATE]
**Auditor**: [NAME]
**Environment**: [Production/Staging]

## Summary
- Total Pages Tested: 7
- Pages Meeting Targets: __/7
- Average Performance Score: __
- Critical Issues Found: __

## Detailed Results
[Insert filled-in tables from above]

## Key Findings
1. [Finding 1]
2. [Finding 2]
3. [Finding 3]

## Optimizations Applied
1. [Optimization 1]
2. [Optimization 2]
3. [Optimization 3]

## Remaining Issues
1. [Issue 1 - Priority: High/Medium/Low]
2. [Issue 2 - Priority: High/Medium/Low]

## Recommendations
1. [Recommendation 1]
2. [Recommendation 2]

## Next Steps
- [ ] Fix remaining critical issues
- [ ] Re-test in 1 week
- [ ] Monitor Core Web Vitals in production
- [ ] Set up automated performance monitoring
```

---

## 🔄 Continuous Monitoring

### Set Up Performance Monitoring

1. **Use Performance Utils**
```javascript
// Add to production app
import { generatePerformanceReport, logPerformanceReport } from '@/utils/performance-utils';

// Run on page load
window.addEventListener('load', async () => {
  if (process.env.NODE_ENV === 'production') {
    const report = await generatePerformanceReport();
    // Send to analytics
    analytics.track('performance_report', report);
  }
});
```

2. **Set Up Alerts**
- Monitor Core Web Vitals in Google Search Console
- Set up PageSpeed Insights API monitoring
- Create alerts for score drops

3. **Regular Audits**
- Weekly: Automated Lighthouse CI
- Monthly: Manual comprehensive audit
- Quarterly: Full performance review

---

## 🎓 Resources

- [Web Vitals](https://web.dev/vitals/)
- [Lighthouse Documentation](https://developers.google.com/web/tools/lighthouse)
- [PageSpeed Insights](https://pagespeed.web.dev/)
- [WebPageTest](https://www.webpagetest.org/)
- [Chrome DevTools Performance](https://developer.chrome.com/docs/devtools/performance/)

---

**Note**: This is a living document. Update as optimizations are applied and new issues are discovered.
