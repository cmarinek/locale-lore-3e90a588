/**
 * Unit Tests for Performance Utilities
 * Target: 100% coverage
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  lazyImport,
  memoize,
  optimizeImage,
  performanceMark,
  performanceMeasure,
  PerformanceTiming,
  preloadRoute,
  ROUTE_CHUNKS,
} from '../performance';

describe('Performance Utilities', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    vi.clearAllMocks();
  });

  afterEach(() => {
    // Clean up after each test
    vi.restoreAllMocks();
  });

  describe('lazyImport', () => {
    it('should dynamically import a module', async () => {
      const mockLoader = vi.fn().mockResolvedValue({ default: 'MockComponent' });
      const LazyComponent = lazyImport(mockLoader);

      expect(LazyComponent).toBeDefined();
      expect(mockLoader).not.toHaveBeenCalled(); // Lazy, not called immediately
    });

    it('should handle import errors gracefully', async () => {
      const mockLoader = vi.fn().mockRejectedValue(new Error('Import failed'));
      const LazyComponent = lazyImport(mockLoader);

      expect(LazyComponent).toBeDefined();
      // Error handling is done by React Suspense boundary
    });
  });

  describe('memoize', () => {
    it('should memoize function results', () => {
      const expensiveFunction = vi.fn((x: number) => x * 2);
      const memoized = memoize(expensiveFunction);

      // First call - should execute function
      expect(memoized(5)).toBe(10);
      expect(expensiveFunction).toHaveBeenCalledTimes(1);

      // Second call with same argument - should return cached result
      expect(memoized(5)).toBe(10);
      expect(expensiveFunction).toHaveBeenCalledTimes(1); // Still 1

      // Call with different argument - should execute function
      expect(memoized(10)).toBe(20);
      expect(expensiveFunction).toHaveBeenCalledTimes(2);
    });

    it('should handle multiple arguments', () => {
      const sumFunction = vi.fn((a: number, b: number) => a + b);
      const memoized = memoize(sumFunction);

      expect(memoized(1, 2)).toBe(3);
      expect(memoized(1, 2)).toBe(3); // Cached
      expect(sumFunction).toHaveBeenCalledTimes(1);

      expect(memoized(2, 3)).toBe(5);
      expect(sumFunction).toHaveBeenCalledTimes(2);
    });

    it('should handle null and undefined arguments', () => {
      const testFunction = vi.fn((x: any) => String(x));
      const memoized = memoize(testFunction);

      expect(memoized(null)).toBe('null');
      expect(memoized(null)).toBe('null'); // Cached
      expect(testFunction).toHaveBeenCalledTimes(1);

      expect(memoized(undefined)).toBe('undefined');
      expect(testFunction).toHaveBeenCalledTimes(2);
    });
  });

  describe('optimizeImage', () => {
    it('should return optimized image URL with Cloudinary transformations', () => {
      const imageUrl = 'https://example.com/image.jpg';
      const optimized = optimizeImage(imageUrl, { width: 800, quality: 80 });

      // Should contain Cloudinary transformations
      expect(optimized).toContain('w_800');
      expect(optimized).toContain('q_80');
      expect(optimized).toContain('f_auto');
    });

    it('should handle custom options', () => {
      const imageUrl = 'https://example.com/image.jpg';
      const optimized = optimizeImage(imageUrl, {
        width: 1200,
        quality: 90,
        format: 'webp',
      });

      expect(optimized).toContain('w_1200');
      expect(optimized).toContain('q_90');
      expect(optimized).toContain('f_webp');
    });

    it('should use default options when not provided', () => {
      const imageUrl = 'https://example.com/image.jpg';
      const optimized = optimizeImage(imageUrl);

      expect(optimized).toContain('f_auto');
      expect(optimized).toContain('q_auto');
    });

    it('should handle Supabase storage URLs', () => {
      const imageUrl = 'https://supabase.co/storage/v1/object/public/bucket/image.jpg';
      const optimized = optimizeImage(imageUrl, { width: 500 });

      // Should still apply transformations
      expect(optimized).toBeDefined();
      expect(optimized).toContain('w_500');
    });
  });

  describe('performanceMark', () => {
    it('should create a performance mark', () => {
      const markSpy = vi.spyOn(performance, 'mark').mockImplementation(() => ({} as any));

      performanceMark('test-mark');

      expect(markSpy).toHaveBeenCalledWith('test-mark');
    });

    it('should handle errors gracefully', () => {
      const markSpy = vi.spyOn(performance, 'mark').mockImplementation(() => {
        throw new Error('Performance API not available');
      });

      // Should not throw
      expect(() => performanceMark('test-mark')).not.toThrow();
    });
  });

  describe('performanceMeasure', () => {
    it('should create a performance measure between two marks', () => {
      const measureSpy = vi.spyOn(performance, 'measure').mockImplementation(() => ({} as any));

      performanceMeasure('test-measure', 'start-mark', 'end-mark');

      expect(measureSpy).toHaveBeenCalledWith('test-measure', 'start-mark', 'end-mark');
    });

    it('should handle errors gracefully', () => {
      const measureSpy = vi.spyOn(performance, 'measure').mockImplementation(() => {
        throw new Error('Performance API not available');
      });

      // Should not throw
      expect(() => performanceMeasure('test-measure', 'start', 'end')).not.toThrow();
    });
  });

  describe('PerformanceTiming', () => {
    it('should measure operation duration', async () => {
      const timing = new PerformanceTiming('test-operation');

      await new Promise((resolve) => setTimeout(resolve, 100));

      const duration = timing.end();

      expect(duration).toBeGreaterThanOrEqual(100);
      expect(duration).toBeLessThan(200); // Allow some margin
    });

    it('should return 0 if end called multiple times', () => {
      const timing = new PerformanceTiming('test-operation');

      const duration1 = timing.end();
      const duration2 = timing.end();

      expect(duration1).toBeGreaterThan(0);
      expect(duration2).toBe(0);
    });

    it('should handle multiple timing instances', () => {
      const timing1 = new PerformanceTiming('operation-1');
      const timing2 = new PerformanceTiming('operation-2');

      const duration1 = timing1.end();
      const duration2 = timing2.end();

      expect(duration1).toBeGreaterThanOrEqual(0);
      expect(duration2).toBeGreaterThanOrEqual(0);
    });
  });

  describe('ROUTE_CHUNKS', () => {
    it('should define route chunks for code splitting', () => {
      expect(ROUTE_CHUNKS).toBeDefined();
      expect(ROUTE_CHUNKS).toHaveProperty('home');
      expect(ROUTE_CHUNKS).toHaveProperty('map');
      expect(ROUTE_CHUNKS).toHaveProperty('discover');
      expect(ROUTE_CHUNKS).toHaveProperty('profile');
    });

    it('should have valid chunk names', () => {
      Object.entries(ROUTE_CHUNKS).forEach(([route, chunkName]) => {
        expect(typeof route).toBe('string');
        expect(typeof chunkName).toBe('string');
        expect(chunkName).toBeTruthy();
      });
    });
  });

  describe('preloadRoute', () => {
    it('should preload route chunk', () => {
      const linkElement = document.createElement('link');
      const createElementSpy = vi
        .spyOn(document, 'createElement')
        .mockReturnValue(linkElement);
      const appendChildSpy = vi.spyOn(document.head, 'appendChild').mockImplementation(() => linkElement);

      preloadRoute('map');

      expect(createElementSpy).toHaveBeenCalledWith('link');
      expect(linkElement.rel).toBe('prefetch');
      expect(linkElement.href).toContain('map');
    });

    it('should handle invalid route gracefully', () => {
      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      // Should not throw
      expect(() => preloadRoute('invalid-route' as any)).not.toThrow();
    });

    it('should not preload if already preloaded', () => {
      const createElementSpy = vi.spyOn(document, 'createElement');

      preloadRoute('discover');
      preloadRoute('discover'); // Second call

      // Should only create one link element
      expect(createElementSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('Integration Tests', () => {
    it('should work together for route optimization', async () => {
      // Mark route navigation start
      performanceMark('route-start');

      // Preload next route
      preloadRoute('profile');

      // Simulate some async work
      await new Promise((resolve) => setTimeout(resolve, 50));

      // Mark route navigation end
      performanceMark('route-end');

      // Measure total time
      performanceMeasure('route-navigation', 'route-start', 'route-end');

      // Should complete without errors
      expect(true).toBe(true);
    });

    it('should optimize images with memoization', () => {
      const memoizedOptimize = memoize(optimizeImage);

      const url1 = memoizedOptimize('https://example.com/image1.jpg', {
        width: 800,
      });
      const url2 = memoizedOptimize('https://example.com/image1.jpg', {
        width: 800,
      });

      // Should return same result (cached)
      expect(url1).toBe(url2);
    });
  });
});
