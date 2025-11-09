import { test, expect } from '@playwright/test';

test.describe('Admin Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    // Note: In real tests, you'd need to set up authentication
    // This is a template showing the structure
    await page.goto('/');
  });

  test('should redirect non-admin users away from admin panel', async ({ page }) => {
    await page.goto('/admin');
    // Should redirect to home or auth page
    await page.waitForURL(/\/(auth|$)/);
  });

  test.describe('Authenticated Admin User', () => {
    test.use({
      storageState: 'tests/fixtures/admin-auth.json', // You'd need to generate this
    });

    test('should access admin dashboard', async ({ page }) => {
      await page.goto('/admin');
      await expect(page.getByRole('heading', { name: /admin dashboard/i })).toBeVisible();
    });

    test('should navigate between admin tabs', async ({ page }) => {
      await page.goto('/admin');
      
      // Navigate to User Management
      await page.getByRole('tab', { name: /users/i }).click();
      await expect(page.getByRole('heading', { name: /user management/i })).toBeVisible();
      
      // Navigate to Role Management
      await page.getByRole('tab', { name: /role/i }).click();
      await expect(page.getByRole('heading', { name: /role management/i })).toBeVisible();
      
      // Navigate to Promo Codes
      await page.getByRole('tab', { name: /promo/i }).click();
      await expect(page.getByRole('heading', { name: /promo code/i })).toBeVisible();
    });

    test('should display user management table', async ({ page }) => {
      await page.goto('/admin');
      await page.getByRole('tab', { name: /users/i }).click();
      
      // Should show table with users
      await expect(page.getByRole('table')).toBeVisible();
      await expect(page.getByRole('columnheader', { name: /email/i })).toBeVisible();
    });

    test('should allow role assignment', async ({ page }) => {
      await page.goto('/admin');
      await page.getByRole('tab', { name: /role/i }).click();
      
      // Should show role management interface
      await expect(page.getByText(/assign role/i)).toBeVisible();
    });

    test('should create promo code', async ({ page }) => {
      await page.goto('/admin');
      await page.getByRole('tab', { name: /promo/i }).click();
      
      // Click create button
      await page.getByRole('button', { name: /create.*promo/i }).click();
      
      // Fill form
      await page.getByLabel(/code/i).fill('TEST2024');
      await page.getByLabel(/discount/i).fill('20');
      
      // Submit
      await page.getByRole('button', { name: /save/i }).click();
      
      // Should show success message
      await expect(page.getByText(/created successfully/i)).toBeVisible();
    });
  });
});
