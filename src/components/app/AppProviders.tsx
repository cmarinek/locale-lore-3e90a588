import React from 'react';
import { HelmetProvider } from 'react-helmet-async';
import { AuthProvider } from '@/contexts/AuthProvider';
import { ThemeProvider } from '@/contexts/ThemeProvider';
import { LanguageProvider } from '@/contexts/LanguageProvider';
import { PerformanceOptimizedApp } from '@/components/performance/PerformanceOptimizedApp';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import { ProductionErrorBoundary } from '@/components/common/ProductionErrorBoundary';
import InitializationGate from '@/components/ui/initialization-gate';

interface AppProvidersProps {
  children: React.ReactNode;
}

export const AppProviders: React.FC<AppProvidersProps> = ({ children }) => {
  const ErrorBoundaryComponent = process.env.NODE_ENV === 'production' 
    ? ProductionErrorBoundary 
    : ErrorBoundary;

  return (
    <PerformanceOptimizedApp>
      <ErrorBoundaryComponent {...(process.env.NODE_ENV === 'development' ? { enableRecovery: true, showErrorDetails: true } : {})}>
        <HelmetProvider>
          <AuthProvider>
            <ThemeProvider>
              <LanguageProvider>
                <InitializationGate>
                  {children}
                </InitializationGate>
              </LanguageProvider>
            </ThemeProvider>
          </AuthProvider>
        </HelmetProvider>
      </ErrorBoundaryComponent>
    </PerformanceOptimizedApp>
  );
};