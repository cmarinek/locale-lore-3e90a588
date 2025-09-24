import React from 'react';
import { HelmetProvider } from 'react-helmet-async';
import { AuthProvider } from '@/contexts/AuthProvider';
import { ThemeProvider } from '@/contexts/ThemeProvider';
import { LanguageProvider } from '@/contexts/LanguageProvider';
import { PerformanceOptimizedApp } from '@/components/performance/PerformanceOptimizedApp';
import { UnifiedErrorBoundary, DevelopmentErrorBoundary, ProductionErrorBoundary } from '@/components/common/UnifiedErrorBoundary';
import InitializationGate from '@/components/ui/initialization-gate';
import { ReactSafetyProvider } from '@/components/providers/ReactSafetyProvider';

interface AppProvidersProps {
  children: React.ReactNode;
}

export const AppProviders: React.FC<AppProvidersProps> = ({ children }) => {
  const ErrorBoundaryComponent = process.env.NODE_ENV === 'production' 
    ? ProductionErrorBoundary 
    : DevelopmentErrorBoundary;

  return (
    <ReactSafetyProvider>
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
    </ReactSafetyProvider>
  );
};