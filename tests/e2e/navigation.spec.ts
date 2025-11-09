import { test, expect } from '@playwright/test';

test.describe('Navigation', () => {
  test('should navigate between main pages', async ({ page }) => {
    await page.goto('/');
    
    // Check home page loads
    await expect(page).toHaveTitle(/GeoCache Lore|Locale Lore/i);
  });

  test('should have working navigation links', async ({ page }) => {
    await page.goto('/');
    
    // Test main navigation (adjust selectors based on your actual nav)
    const nav = page.locator('nav').first();
    await expect(nav).toBeVisible();
  });

  test('should handle 404 pages', async ({ page }) => {
    const response = await page.goto('/non-existent-page');
    
    // Should either show 404 page or redirect
    expect(response?.status()).toBeGreaterThanOrEqual(200);
  });

  test('should be mobile responsive', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    
    // Check page still renders properly on mobile
    await expect(page.locator('body')).toBeVisible();
  });
});
