import { test, expect } from '@playwright/test';
import { injectAxe, checkA11y } from '@axe-core/playwright';

test.describe('Explore Page E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/explore');
    await injectAxe(page);
  });

  test('should display explore page', async ({ page }) => {
    await expect(page.getByRole('main')).toBeVisible();
    
    // Wait for content to load
    await page.waitForTimeout(2000);
  });

  test('should handle navigation', async ({ page }) => {
    // Test navigation to different pages
    const searchLink = page.getByRole('link', { name: /search/i });
    if (await searchLink.isVisible()) {
      await searchLink.click();
      await expect(page).toHaveURL(/\/search/);
    }
  });

  test('should be responsive', async ({ page }) => {
    // Test different viewport sizes
    const viewports = [
      { width: 1920, height: 1080 }, // Desktop
      { width: 768, height: 1024 },  // Tablet
      { width: 375, height: 667 },   // Mobile
    ];

    for (const viewport of viewports) {
      await page.setViewportSize(viewport);
      await expect(page.getByRole('main')).toBeVisible();
    }
  });

  test('should meet accessibility standards', async ({ page }) => {
    await checkA11y(page, null, {
      detailedReport: true,
      detailedReportOptions: { html: true },
    });
  });
});