import { test, expect } from '@playwright/test';

test.describe('Production Readiness', () => {
  test('should load production dashboard', async ({ page }) => {
    await page.goto('/production');
    
    await expect(page.getByRole('heading', { name: /production dashboard/i })).toBeVisible();
  });

  test('should display production metrics', async ({ page }) => {
    await page.goto('/production');
    
    // Should show readiness score
    await expect(page.getByText(/production readiness score/i)).toBeVisible();
    await expect(page.getByRole('progressbar')).toBeVisible();
  });

  test('should have performance monitoring tab', async ({ page }) => {
    await page.goto('/production');
    
    await page.getByRole('tab', { name: /performance/i }).click();
    await expect(page.getByText(/web vitals/i)).toBeVisible();
  });

  test('should have security audit tab', async ({ page }) => {
    await page.goto('/production');
    
    await page.getByRole('tab', { name: /security/i }).click();
    await expect(page.getByText(/security/i)).toBeVisible();
  });

  test('should display system health checks', async ({ page }) => {
    await page.goto('/production');
    
    // Should show various system checks
    await expect(page.getByText(/environment/i)).toBeVisible();
    await expect(page.getByText(/supabase/i)).toBeVisible();
  });
});
