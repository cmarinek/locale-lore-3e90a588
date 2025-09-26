import React, { Suspense, useEffect } from 'react';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';

interface PerformanceOptimizedAppProps {
  children: React.ReactNode;
}

// Ultra-optimized loading fallback
const AppLoadingFallback = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="text-center space-y-4">
      <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto" />
      <p className="text-muted-foreground">Loading LocaleLore...</p>
    </div>
  </div>
);

export const PerformanceOptimizedApp: React.FC<PerformanceOptimizedAppProps> = ({ children }) => {
  // Ensure React and hooks are available before using them
  if (!React || !React.useEffect) {
    console.error('React or useEffect not available in PerformanceOptimizedApp');
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <p className="text-muted-foreground">Loading React...</p>
        </div>
      </div>
    );
  }

  useEffect(() => {
    // Simple performance tracking without complex monitoring
    console.log('🚀 App initialized at:', new Date().toISOString());
    
    // Basic performance observer for Core Web Vitals
    if ('PerformanceObserver' in window) {
      try {
        const observer = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (entry.entryType === 'largest-contentful-paint') {
              console.log('📊 LCP:', entry.startTime.toFixed(2) + 'ms');
            }
          }
        });
        
        observer.observe({ entryTypes: ['largest-contentful-paint'] });
        
        return () => observer.disconnect();
      } catch (error) {
        // Silent fail - performance monitoring is optional
      }
    }
  }, []);

  return (
    <ErrorBoundary>
      <Suspense fallback={<AppLoadingFallback />}>
        {children}
      </Suspense>
    </ErrorBoundary>
  );
};