// Performance-optimized app wrapper
import React, { Suspense } from 'react';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';

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
  return (
    <ErrorBoundary>
      <Suspense fallback={<AppLoadingFallback />}>
        {children}
      </Suspense>
    </ErrorBoundary>
  );
};