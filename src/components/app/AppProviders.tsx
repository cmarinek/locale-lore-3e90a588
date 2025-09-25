import React from 'react';
import { HelmetProvider } from 'react-helmet-async';
import { AuthProvider } from '@/contexts/AuthProvider';
import { ThemeProvider } from '@/contexts/ThemeProvider';
import { LanguageProvider } from '@/contexts/LanguageProvider';
import { PerformanceOptimizedApp } from '@/components/performance/PerformanceOptimizedApp';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';

interface AppProvidersProps {
  children: React.ReactNode;
}

export const AppProviders: React.FC<AppProvidersProps> = ({ children }) => {
  return (
    <ErrorBoundary>
      <PerformanceOptimizedApp>
        <HelmetProvider>
          <AuthProvider>
            <ThemeProvider>
              <LanguageProvider>
                {children}
              </LanguageProvider>
            </ThemeProvider>
          </AuthProvider>
        </HelmetProvider>
      </PerformanceOptimizedApp>
    </ErrorBoundary>
  );
};