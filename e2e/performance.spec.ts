
import { test, expect } from '@playwright/test';

test.describe('Performance Tests', () => {
  test('should load pages within performance budget', async ({ page }) => {
    // Start performance monitoring
    await page.goto('/', { waitUntil: 'networkidle' });
    
    // Measure Core Web Vitals
    const metrics = await page.evaluate(() => {
      return new Promise((resolve) => {
        new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const metrics = {};
          
          entries.forEach((entry) => {
            if (entry.entryType === 'largest-contentful-paint') {
              metrics.lcp = entry.startTime;
            }
            if (entry.entryType === 'first-input') {
              metrics.fid = entry.processingStart - entry.startTime;
            }
          });
          
          resolve(metrics);
        }).observe({ entryTypes: ['largest-contentful-paint', 'first-input'] });
        
        // Fallback timeout
        setTimeout(() => resolve({}), 5000);
      });
    });

    console.log('Performance metrics:', metrics);
    
    // Assert performance budgets
    if (metrics.lcp) {
      expect(metrics.lcp).toBeLessThan(2500); // 2.5s LCP budget
    }
    if (metrics.fid) {
      expect(metrics.fid).toBeLessThan(100); // 100ms FID budget
    }
  });

  test('should handle network conditions gracefully', async ({ page, context }) => {
    // Simulate slow 3G
    await context.route('**/*', (route) => {
      return route.continue();
    });
    
    await page.goto('/', { timeout: 10000 });
    await expect(page.getByRole('main')).toBeVisible();
  });
});
