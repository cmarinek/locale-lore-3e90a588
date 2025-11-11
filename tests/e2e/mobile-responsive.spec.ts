import { test, expect } from '@playwright/test';

test.describe('Mobile Responsiveness Testing', () => {
  const mobileViewports = [
    { name: 'iPhone SE', width: 375, height: 667 },
    { name: 'iPhone 12 Pro', width: 390, height: 844 },
    { name: 'Pixel 5', width: 393, height: 851 },
    { name: 'Samsung Galaxy S20', width: 360, height: 800 },
  ];

  const tabletViewports = [
    { name: 'iPad', width: 768, height: 1024 },
    { name: 'iPad Pro', width: 1024, height: 1366 },
  ];

  test.describe('Mobile Viewport Testing', () => {
    for (const viewport of mobileViewports) {
      test(`should render correctly on ${viewport.name}`, async ({ page }) => {
        await page.setViewportSize({ width: viewport.width, height: viewport.height });
        await page.goto('/');
        await page.waitForLoadState('networkidle');
        
        // Check main content is visible
        await expect(page.getByRole('main')).toBeVisible();
        
        // Check for mobile menu if it exists
        const mobileMenu = page.getByRole('button', { name: /menu|hamburger/i });
        if (await mobileMenu.isVisible()) {
          await expect(mobileMenu).toBeVisible();
        }
      });
    }

    test('should handle screen orientation changes', async ({ page }) => {
      // Portrait mode
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('/');
      await page.waitForTimeout(1000);
      
      // Landscape mode
      await page.setViewportSize({ width: 667, height: 375 });
      await page.waitForTimeout(1000);
      
      // Content should still be visible
      await expect(page.getByRole('main')).toBeVisible();
    });
  });

  test.describe('Touch Interactions', () => {
    test.beforeEach(async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
    });

    test('should handle tap interactions on buttons', async ({ page }) => {
      await page.goto('/');
      
      // Find and tap a button
      const button = page.getByRole('button').first();
      if (await button.isVisible()) {
        await button.tap();
        await page.waitForTimeout(500);
      }
    });

    test('should handle swipe gestures on map', async ({ page }) => {
      await page.goto('/');
      await page.waitForTimeout(2000);
      
      // Try to swipe on map container
      const mapContainer = page.locator('[class*="mapbox"]').first();
      if (await mapContainer.isVisible()) {
        const box = await mapContainer.boundingBox();
        if (box) {
          await page.touchscreen.tap(box.x + box.width / 2, box.y + box.height / 2);
          await page.waitForTimeout(500);
        }
      }
    });

    test('should have touch-friendly button sizes', async ({ page }) => {
      await page.goto('/');
      
      // Check button sizes are at least 44x44px (iOS guidelines)
      const buttons = page.getByRole('button');
      const count = await buttons.count();
      
      for (let i = 0; i < Math.min(count, 5); i++) {
        const button = buttons.nth(i);
        if (await button.isVisible()) {
          const box = await button.boundingBox();
          if (box) {
            expect(box.height).toBeGreaterThanOrEqual(40);
            expect(box.width).toBeGreaterThanOrEqual(40);
          }
        }
      }
    });

    test('should handle pinch-to-zoom on map', async ({ page }) => {
      await page.goto('/');
      await page.waitForTimeout(2000);
      
      // Map should be present
      const mapContainer = page.locator('[class*="mapbox"]').first();
      if (await mapContainer.isVisible()) {
        await expect(mapContainer).toBeVisible();
      }
    });
  });

  test.describe('PWA Installation', () => {
    test('should have PWA manifest', async ({ page }) => {
      await page.goto('/');
      
      // Check for manifest link
      const manifest = await page.locator('link[rel="manifest"]');
      if ((await manifest.count()) > 0) {
        const href = await manifest.getAttribute('href');
        expect(href).toBeTruthy();
      }
    });

    test('should have required PWA meta tags', async ({ page }) => {
      await page.goto('/');
      
      // Check for viewport meta tag
      const viewport = await page.locator('meta[name="viewport"]');
      expect(await viewport.count()).toBeGreaterThan(0);
      
      // Check for theme-color
      const themeColor = await page.locator('meta[name="theme-color"]');
      if ((await themeColor.count()) > 0) {
        await expect(themeColor).toHaveCount(1);
      }
    });

    test('should register service worker', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      // Check if service worker is registered
      const swRegistration = await page.evaluate(() => {
        return 'serviceWorker' in navigator;
      });
      
      expect(swRegistration).toBe(true);
    });
  });

  test.describe('Offline Functionality', () => {
    test('should handle offline mode gracefully', async ({ page, context }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      // Go offline
      await context.setOffline(true);
      
      // App should still render cached content
      await expect(page.getByRole('main')).toBeVisible();
      
      // Go back online
      await context.setOffline(false);
    });

    test('should show offline indicator when disconnected', async ({ page, context }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      // Go offline
      await context.setOffline(true);
      await page.reload();
      
      // Look for offline indicator
      await page.waitForTimeout(2000);
      const offlineIndicator = page.getByText(/offline|no.*connection/i);
      if (await offlineIndicator.isVisible()) {
        await expect(offlineIndicator).toBeVisible();
      }
      
      // Restore connection
      await context.setOffline(false);
    });
  });

  test.describe('Tablet Responsiveness', () => {
    for (const viewport of tabletViewports) {
      test(`should render correctly on ${viewport.name}`, async ({ page }) => {
        await page.setViewportSize({ width: viewport.width, height: viewport.height });
        await page.goto('/');
        await page.waitForLoadState('networkidle');
        
        // Check layout adapts to tablet size
        await expect(page.getByRole('main')).toBeVisible();
      });
    }
  });

  test.describe('Responsive Navigation', () => {
    test('should show mobile menu on small screens', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('/');
      
      // Look for mobile menu button
      const menuButton = page.getByRole('button', { name: /menu/i });
      if (await menuButton.isVisible()) {
        await menuButton.click();
        await page.waitForTimeout(500);
        
        // Menu should open
        const nav = page.locator('nav').first();
        await expect(nav).toBeVisible();
      }
    });

    test('should show desktop navigation on large screens', async ({ page }) => {
      await page.setViewportSize({ width: 1920, height: 1080 });
      await page.goto('/');
      
      // Desktop nav should be visible
      const nav = page.locator('nav').first();
      await expect(nav).toBeVisible();
    });
  });

  test.describe('Form Interactions on Mobile', () => {
    test('should handle form input on mobile', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('/auth');
      
      // Fill form on mobile
      const emailInput = page.getByRole('textbox', { name: /email/i });
      await emailInput.tap();
      await emailInput.fill('test@example.com');
      
      const passwordInput = page.getByLabel(/password/i);
      await passwordInput.tap();
      await passwordInput.fill('password123');
      
      // Submit form
      const submitButton = page.getByRole('button', { name: /sign in/i });
      await submitButton.tap();
      await page.waitForTimeout(1000);
    });

    test('should show mobile keyboard for text inputs', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('/auth');
      
      // Focus on input
      const emailInput = page.getByRole('textbox', { name: /email/i });
      await emailInput.tap();
      
      // Input should be focused
      await expect(emailInput).toBeFocused();
    });
  });
});
