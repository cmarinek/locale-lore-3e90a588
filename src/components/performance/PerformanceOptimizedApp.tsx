// Performance-optimized app wrapper
import React, { Suspense, useEffect, useMemo } from 'react';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import { performanceMonitor } from '@/utils/performance-optimization';
import { preloadCriticalTranslations } from '@/utils/i18n-optimization';
import { initPerformanceMonitoring } from '@/utils/performance-monitoring';

interface PerformanceOptimizedAppProps {
  children: React.ReactNode;
}

// Optimized loading fallback
const AppLoadingFallback = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="text-center space-y-4">
      <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto" />
      <p className="text-muted-foreground">Loading LocaleLore...</p>
    </div>
  </div>
);

export const PerformanceOptimizedApp: React.FC<PerformanceOptimizedAppProps> = ({ children }) => {
  useEffect(() => {
    // Mark app initialization start
    performanceMonitor.mark('app-init-start');
    
    // Preload critical resources
    const initPerformance = async () => {
      try {
        // Initialize performance monitoring
        initPerformanceMonitoring();
        
        // Preload critical translations
        await preloadCriticalTranslations();
        
        // Preload critical images
        const criticalImages = [
          '/favicon.ico',
          // Add other critical images
        ];
        
        await Promise.all(
          criticalImages.map(src => 
            fetch(src).catch(() => {}) // Ignore errors for optional resources
          )
        );
        
        // Mark initialization complete
        performanceMonitor.mark('app-init-end');
        performanceMonitor.measure('app-initialization', 'app-init-start', 'app-init-end');
        
      } catch (error) {
        console.warn('Performance optimization initialization failed:', error);
      }
    };
    
    initPerformance();
    
    // Setup performance observer
    const cleanup = performanceMonitor.observe((entries) => {
      entries.forEach(entry => {
        if (entry.entryType === 'navigation') {
          console.log('Navigation timing:', entry);
        } else if (entry.entryType === 'paint') {
          console.log('Paint timing:', entry.name, entry.startTime);
        }
      });
    });
    
    return cleanup;
  }, []);
  
  // Memoize error fallback to prevent re-renders
  const errorFallback = useMemo(() => ({ error, resetErrorBoundary }: { error: Error; resetErrorBoundary: () => void }) => (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="text-center space-y-4 max-w-md">
        <h1 className="text-2xl font-bold text-destructive">Oops! Something went wrong</h1>
        <p className="text-muted-foreground">
          We're sorry, but something unexpected happened. Please try refreshing the page.
        </p>
        <button 
          onClick={resetErrorBoundary}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
        >
          Try Again
        </button>
      </div>
    </div>
  ), []);
  
  return (
    <ErrorBoundary>
      <Suspense fallback={<AppLoadingFallback />}>
        {children}
      </Suspense>
    </ErrorBoundary>
  );
};