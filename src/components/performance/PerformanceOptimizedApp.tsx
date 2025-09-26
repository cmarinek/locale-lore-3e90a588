import React from 'react';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';

interface PerformanceOptimizedAppProps {
  children: React.ReactNode;
}

// Simple loading fallback without hooks
const AppLoadingFallback = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="text-center space-y-4">
      <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto" />
      <p className="text-muted-foreground">Loading LocaleLore...</p>
    </div>
  </div>
);

// Simplified component without useEffect to avoid React null errors
export const PerformanceOptimizedApp: React.FC<PerformanceOptimizedAppProps> = ({ children }) => {
  // Simple performance log without useEffect
  if (typeof window !== 'undefined' && console && console.log) {
    console.log('🚀 App rendered at:', new Date().toISOString());
  }

  return (
    <ErrorBoundary>
      <React.Suspense fallback={<AppLoadingFallback />}>
        {children}
      </React.Suspense>
    </ErrorBoundary>
  );
};