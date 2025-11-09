// Performance utilities barrel export - Single Source of Truth for all performance optimization

// Export monitoring utilities
export {
  PerformanceMonitor,
  performanceMonitor,
  usePerformanceMonitor,
  initPerformanceMonitoring,
  type PerformanceMetric
} from './monitoring';

// Export optimization utilities
export {
  lazyImport,
  memoize,
  getOptimizedImageUrl,
  preloadImage,
  analyzeBundleSize
} from './optimization';

// Export measurement utilities
export {
  measurePerformance,
  PerformanceTiming
} from './measurement';

// Export route utilities
export {
  ROUTE_CHUNKS,
  preloadRoute
} from './routes';
