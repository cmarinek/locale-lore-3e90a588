import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display login page', async ({ page }) => {
    await expect(page).toHaveURL(/.*auth/);
    await expect(page.getByRole('heading', { name: /sign in/i })).toBeVisible();
  });

  test('should show validation errors for empty form', async ({ page }) => {
    await page.goto('/auth');
    const signInButton = page.getByRole('button', { name: /sign in/i });
    await signInButton.click();
    
    // Should show validation errors
    await expect(page.getByText(/email.*required/i)).toBeVisible();
  });

  test('should navigate between sign in and sign up', async ({ page }) => {
    await page.goto('/auth');
    
    // Click sign up link
    await page.getByRole('link', { name: /sign up/i }).click();
    await expect(page.getByRole('heading', { name: /sign up/i })).toBeVisible();
    
    // Go back to sign in
    await page.getByRole('link', { name: /sign in/i }).click();
    await expect(page.getByRole('heading', { name: /sign in/i })).toBeVisible();
  });

  test('should display password reset option', async ({ page }) => {
    await page.goto('/auth');
    await expect(page.getByRole('link', { name: /forgot.*password/i })).toBeVisible();
  });
});
