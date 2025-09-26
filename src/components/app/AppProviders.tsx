import React from 'react';
import { PerformanceOptimizedApp } from '@/components/performance/PerformanceOptimizedApp';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import { ProviderChain } from '@/components/providers/ProviderChain';

interface AppProvidersProps {
  children: React.ReactNode;
}

export const AppProviders: React.FC<AppProvidersProps> = ({ children }) => {
  return (
    <ErrorBoundary>
      <PerformanceOptimizedApp>
        <ProviderChain>
          {children}
        </ProviderChain>
      </PerformanceOptimizedApp>
    </ErrorBoundary>
  );
};