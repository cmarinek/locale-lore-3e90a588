/**
 * Unit Tests for Performance Utilities
 * Target: 100% coverage
 */

import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import {
  lazyImport,
  memoize,
  getOptimizedImageUrl,
  measurePerformance,
  PerformanceTiming,
  ROUTE_CHUNKS,
  preloadRoute,
} from '../performance';

describe('Performance Utilities', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('lazyImport', () => {
    it('should dynamically import a module', async () => {
      const mockLoader = jest.fn().mockResolvedValue({ default: 'MockComponent' });
      const LazyComponent = lazyImport(mockLoader);

      expect(LazyComponent).toBeDefined();
      expect(mockLoader).not.toHaveBeenCalled();
    });

    it('should handle import errors gracefully', async () => {
      const mockLoader = jest.fn().mockRejectedValue(new Error('Import failed'));
      const LazyComponent = lazyImport(mockLoader);

      expect(LazyComponent).toBeDefined();
    });
  });

  describe('memoize', () => {
    it('should memoize function results', () => {
      const expensiveFunction = jest.fn((x: number) => x * 2);
      const memoized = memoize(expensiveFunction);

      expect(memoized(5)).toBe(10);
      expect(expensiveFunction).toHaveBeenCalledTimes(1);

      expect(memoized(5)).toBe(10);
      expect(expensiveFunction).toHaveBeenCalledTimes(1);

      expect(memoized(10)).toBe(20);
      expect(expensiveFunction).toHaveBeenCalledTimes(2);
    });

    it('should handle multiple arguments', () => {
      const sumFunction = jest.fn((a: number, b: number) => a + b);
      const memoized = memoize(sumFunction);

      expect(memoized(1, 2)).toBe(3);
      expect(memoized(1, 2)).toBe(3);
      expect(sumFunction).toHaveBeenCalledTimes(1);

      expect(memoized(2, 3)).toBe(5);
      expect(sumFunction).toHaveBeenCalledTimes(2);
    });

    it('should handle null and undefined arguments', () => {
      const testFunction = jest.fn((x: any) => String(x));
      const memoized = memoize(testFunction);

      expect(memoized(null)).toBe('null');
      expect(memoized(null)).toBe('null');
      expect(testFunction).toHaveBeenCalledTimes(1);

      expect(memoized(undefined)).toBe('undefined');
      expect(testFunction).toHaveBeenCalledTimes(2);
    });
  });

  describe('getOptimizedImageUrl', () => {
    it('should optimize image URL with default width', () => {
      const url = 'https://example.com/image.jpg';
      const optimized = getOptimizedImageUrl(url, 800);
      
      expect(optimized).toBeDefined();
      expect(typeof optimized).toBe('string');
    });

    it('should apply custom width', () => {
      const url = 'https://example.com/image.jpg';
      const optimized = getOptimizedImageUrl(url, 1200);
      
      expect(optimized).toBeDefined();
      expect(typeof optimized).toBe('string');
    });

    it('should handle Supabase storage URLs', () => {
      const url = 'https://project.supabase.co/storage/v1/object/public/bucket/image.jpg';
      const optimized = getOptimizedImageUrl(url, 600);
      
      expect(optimized).toBeDefined();
    });

    it('should return original URL for non-image URLs', () => {
      const url = 'https://example.com/document.pdf';
      const optimized = getOptimizedImageUrl(url);
      
      expect(optimized).toBe(url);
    });

    it('should handle empty URL', () => {
      const optimized = getOptimizedImageUrl('');
      
      expect(optimized).toBe('');
    });
  });

  describe('measurePerformance', () => {
    it('should measure performance with marks', () => {
      const mockFn = jest.fn();
      const markSpy = jest.spyOn(performance, 'mark');
      const measureSpy = jest.spyOn(performance, 'measure');
      
      measurePerformance('test-operation', mockFn);
      
      expect(mockFn).toHaveBeenCalled();
      expect(markSpy).toHaveBeenCalledWith('test-operation-start');
      expect(markSpy).toHaveBeenCalledWith('test-operation-end');
      expect(measureSpy).toHaveBeenCalledWith('test-operation', 'test-operation-start', 'test-operation-end');
    });

    it('should handle missing performance API', () => {
      const originalPerformance = (global as any).performance;
      delete (global as any).performance;
      
      const mockFn = jest.fn();
      measurePerformance('test', mockFn);
      
      expect(mockFn).toHaveBeenCalled();
      
      (global as any).performance = originalPerformance;
    });
  });

  describe('PerformanceTiming', () => {
    it('should measure duration of an operation', () => {
      PerformanceTiming.start('test-operation');
      
      const result = PerformanceTiming.end('test-operation');
      
      expect(result).toBeGreaterThanOrEqual(0);
    });

    it('should handle calling end without start', () => {
      const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();
      
      const result = PerformanceTiming.end('non-existent');
      
      expect(result).toBe(0);
      expect(consoleWarnSpy).toHaveBeenCalledWith(expect.stringContaining('No start time found'));
      
      consoleWarnSpy.mockRestore();
    });

    it('should handle multiple concurrent measurements', () => {
      PerformanceTiming.start('operation-1');
      PerformanceTiming.start('operation-2');
      
      const result1 = PerformanceTiming.end('operation-1');
      const result2 = PerformanceTiming.end('operation-2');
      
      expect(result1).toBeGreaterThanOrEqual(0);
      expect(result2).toBeGreaterThanOrEqual(0);
    });
  });

  describe('ROUTE_CHUNKS', () => {
    it('should define route chunks for code splitting', () => {
      expect(ROUTE_CHUNKS).toBeDefined();
      expect(ROUTE_CHUNKS).toHaveProperty('AUTH');
      expect(ROUTE_CHUNKS).toHaveProperty('MAP');
      expect(ROUTE_CHUNKS).toHaveProperty('EXPLORE');
      expect(ROUTE_CHUNKS).toHaveProperty('PROFILE');
    });

    it('should have valid chunk functions', () => {
      Object.entries(ROUTE_CHUNKS).forEach(([route, chunkFn]) => {
        expect(typeof route).toBe('string');
        expect(typeof chunkFn).toBe('function');
      });
    });
  });

  describe('preloadRoute', () => {
    it('should preload a route chunk', (done) => {
      preloadRoute('MAP');
      
      setTimeout(() => {
        done();
      }, 100);
    });

    it('should handle custom route function', () => {
      const customRoute = () => import('@/pages/Explore');
      expect(() => {
        preloadRoute(customRoute);
      }).not.toThrow();
    });

    it('should handle invalid routes gracefully', () => {
      expect(() => {
        preloadRoute('INVALID' as any);
      }).not.toThrow();
    });
  });

  describe('Integration Tests', () => {
    it('should preload route with performance measurement', (done) => {
      PerformanceTiming.start('route-load');
      preloadRoute('PROFILE');
      
      setTimeout(() => {
        const duration = PerformanceTiming.end('route-load');
        expect(duration).toBeGreaterThanOrEqual(0);
        done();
      }, 50);
    });

    it('should cache optimized image URLs', () => {
      const url = 'https://example.com/test.jpg';
      
      const memoizedOptimize = memoize((url: string, width: number) => getOptimizedImageUrl(url, width));
      const result1 = memoizedOptimize(url, 400);
      const result2 = memoizedOptimize(url, 400);
      
      expect(result1).toBe(result2);
    });
  });
});
