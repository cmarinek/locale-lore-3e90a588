
import { test, expect } from '@playwright/test';

test.describe('Visual Regression Tests', () => {
  test('should match auth page screenshot', async ({ page }) => {
    await page.goto('/auth');
    await page.waitForLoadState('networkidle');
    
    await expect(page).toHaveScreenshot('auth-page.png', {
      fullPage: true,
      threshold: 0.3,
    });
  });

  test('should match discovery page screenshot', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    await expect(page).toHaveScreenshot('discovery-page.png', {
      fullPage: true,
      threshold: 0.3,
    });
  });

  test('should match mobile views', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    await expect(page).toHaveScreenshot('mobile-discovery.png', {
      fullPage: true,
      threshold: 0.3,
    });
  });
});
