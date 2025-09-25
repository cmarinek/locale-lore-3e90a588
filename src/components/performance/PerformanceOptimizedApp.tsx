// 2025 World-Class Performance-optimized app wrapper
import React, { Suspense, useEffect } from 'react';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import { performanceMonitor2025 } from '@/utils/performance-core-2025';
import { useAdvancedPerformance } from '@/hooks/useAdvancedPerformance';

interface PerformanceOptimizedAppProps {
  children: React.ReactNode;
}

// Ultra-optimized loading fallback with performance tracking
const AppLoadingFallback = () => {
  useEffect(() => {
    performanceMonitor2025.mark('app-loading-start');
    return () => {
      performanceMonitor2025.mark('app-loading-end');
      performanceMonitor2025.measure('app-loading-time', 'app-loading-start', 'app-loading-end');
    };
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-4">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto" />
        <p className="text-muted-foreground">Loading LocaleLore...</p>
        <div className="text-xs text-muted-foreground/60">Optimizing for best performance</div>
      </div>
    </div>
  );
};

export const PerformanceOptimizedApp: React.FC<PerformanceOptimizedAppProps> = ({ children }) => {
  const { startRender, endRender } = useAdvancedPerformance();

  useEffect(() => {
    // Mark app initialization
    performanceMonitor2025.mark('app-init-start');
    startRender();

    // Enable performance observer for Core Web Vitals
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'largest-contentful-paint') {
            performanceMonitor2025.mark('LCP');
            performanceMonitor2025.measure('LCP', 'app-init-start');
          }
          if (entry.entryType === 'first-input') {
            performanceMonitor2025.mark('FID');
            performanceMonitor2025.measure('FID', 'app-init-start');
          }
          if (entry.entryType === 'layout-shift' && !(entry as any).hadRecentInput) {
            performanceMonitor2025.mark('CLS');
          }
        }
      });
      
      observer.observe({ entryTypes: ['largest-contentful-paint', 'first-input', 'layout-shift'] });
      
      return () => {
        observer.disconnect();
        endRender();
        performanceMonitor2025.mark('app-init-end');
        performanceMonitor2025.measure('app-init-time', 'app-init-start', 'app-init-end');
      };
    }
  }, [startRender, endRender]);

  return (
    <ErrorBoundary>
      <Suspense fallback={<AppLoadingFallback />}>
        {children}
      </Suspense>
    </ErrorBoundary>
  );
};