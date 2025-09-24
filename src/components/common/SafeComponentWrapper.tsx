import React, { useState, useEffect } from 'react';
import { UnifiedErrorBoundary } from '@/components/common/UnifiedErrorBoundary';

interface SafeComponentWrapperProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  name: string;
  timeout?: number;
}

export const SafeComponentWrapper: React.FC<SafeComponentWrapperProps> = ({
  children,
  fallback,
  name,
  timeout = 10000
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasTimedOut, setHasTimedOut] = useState(false);

  useEffect(() => {
    console.log(`🔄 Loading component: ${name}`);
    
    const timer = setTimeout(() => {
      if (isLoading) {
        console.warn(`⏰ Component ${name} timed out after ${timeout}ms`);
        setHasTimedOut(true);
      }
    }, timeout);

    // Simulate component ready
    const readyTimer = setTimeout(() => {
      setIsLoading(false);
      console.log(`✅ Component loaded: ${name}`);
    }, 100);

    return () => {
      clearTimeout(timer);
      clearTimeout(readyTimer);
    };
  }, [name, timeout, isLoading]);

  if (hasTimedOut) {
    return fallback || (
      <div className="p-4 text-center">
        <div className="text-yellow-500 text-2xl mb-2">⏰</div>
        <p className="text-muted-foreground">Component taking longer than expected...</p>
        <button 
          onClick={() => window.location.reload()}
          className="mt-2 px-3 py-1 text-sm bg-primary text-primary-foreground rounded"
        >
          Refresh
        </button>
      </div>
    );
  }

  if (isLoading) {
    return fallback || (
      <div className="flex items-center justify-center p-4">
        <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <UnifiedErrorBoundary 
      mode="development"
      enableRecovery={true}
      fallback={
        <div className="p-4 text-center">
          <div className="text-red-500 text-2xl mb-2">⚠️</div>
          <p className="text-muted-foreground">Error loading {name}</p>
        </div>
      }
    >
      {children}
    </UnifiedErrorBoundary>
  );
};