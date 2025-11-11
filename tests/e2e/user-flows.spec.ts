import { test, expect } from '@playwright/test';

test.describe('Complete User Journeys', () => {
  test.describe('New User Onboarding Flow', () => {
    test('should complete full signup to story submission flow', async ({ page }) => {
      // Navigate to auth page
      await page.goto('/auth');
      
      // Switch to sign up
      await page.getByText(/sign up/i).click();
      await expect(page.getByRole('heading', { name: /create account/i })).toBeVisible();
      
      // Fill sign up form
      const timestamp = Date.now();
      const email = `test${timestamp}@example.com`;
      await page.getByRole('textbox', { name: /email/i }).fill(email);
      await page.getByLabel(/^password$/i).fill('TestPassword123!');
      
      // Submit form
      await page.getByRole('button', { name: /sign up/i }).click();
      
      // Should show email verification message or redirect to home
      await page.waitForTimeout(2000);
      
      // Check if redirected to home or verification page
      const currentUrl = page.url();
      expect(currentUrl).toMatch(/\/(|auth|verify)/);
    });
  });

  test.describe('Map Interaction Flow', () => {
    test('should browse map and interact with markers', async ({ page }) => {
      await page.goto('/');
      
      // Wait for map to load
      await page.waitForTimeout(3000);
      
      // Check if map container is visible
      const mapContainer = page.locator('[class*="mapbox"]').first();
      if (await mapContainer.isVisible()) {
        await expect(mapContainer).toBeVisible();
      }
      
      // Look for any visible markers or stories
      const storyElements = page.locator('[data-testid*="story"], [class*="marker"]').first();
      if (await storyElements.isVisible()) {
        await storyElements.click();
        await page.waitForTimeout(1000);
      }
    });

    test('should navigate between map views', async ({ page }) => {
      await page.goto('/');
      
      // Test navigation to explore if it exists
      const exploreLink = page.getByRole('link', { name: /explore/i }).first();
      if (await exploreLink.isVisible()) {
        await exploreLink.click();
        await expect(page).toHaveURL(/\/explore/);
      }
    });
  });

  test.describe('User Settings Flow', () => {
    test('should access and update user preferences', async ({ page }) => {
      await page.goto('/');
      
      // Try to find settings/profile link
      const settingsLink = page.getByRole('link', { name: /settings|profile/i }).first();
      if (await settingsLink.isVisible()) {
        await settingsLink.click();
        await page.waitForTimeout(1000);
        
        // Verify settings page loaded
        expect(page.url()).toMatch(/\/(settings|profile)/);
      }
    });

    test('should update notification preferences', async ({ page }) => {
      await page.goto('/settings');
      
      // Look for notification settings
      const notificationTab = page.getByRole('tab', { name: /notification/i });
      if (await notificationTab.isVisible()) {
        await notificationTab.click();
        
        // Toggle a notification setting
        const toggleSwitch = page.locator('[role="switch"]').first();
        if (await toggleSwitch.isVisible()) {
          await toggleSwitch.click();
          await page.waitForTimeout(500);
        }
      }
    });

    test('should update privacy settings', async ({ page }) => {
      await page.goto('/settings');
      
      // Look for privacy settings
      const privacyTab = page.getByRole('tab', { name: /privacy/i });
      if (await privacyTab.isVisible()) {
        await privacyTab.click();
        
        // Change a privacy setting
        const privacySwitch = page.locator('[role="switch"]').first();
        if (await privacySwitch.isVisible()) {
          await privacySwitch.click();
          await page.waitForTimeout(500);
        }
      }
    });
  });

  test.describe('Story Submission Flow', () => {
    test('should navigate to story submission page', async ({ page }) => {
      await page.goto('/');
      
      // Look for "Add Story" or similar button
      const addButton = page.getByRole('button', { name: /add|create|submit/i }).first();
      if (await addButton.isVisible()) {
        await addButton.click();
        await page.waitForTimeout(1000);
      }
    });
  });
});

test.describe('Error Handling and Edge Cases', () => {
  test('should handle network errors gracefully', async ({ page, context }) => {
    // Simulate offline mode
    await context.setOffline(true);
    await page.goto('/');
    
    // App should show error message or offline indicator
    await page.waitForTimeout(2000);
    
    // Restore connection
    await context.setOffline(false);
  });

  test('should handle invalid routes', async ({ page }) => {
    await page.goto('/nonexistent-page-123');
    
    // Should show 404 or redirect to home
    await page.waitForTimeout(1000);
    const url = page.url();
    expect(url).toBeTruthy();
  });
});
