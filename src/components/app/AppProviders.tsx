import React from 'react';
import { HelmetProvider } from 'react-helmet-async';
import { AuthProvider } from '@/contexts/AuthProvider';
import { ThemeProvider } from '@/contexts/ThemeProvider';
import { LanguageProvider } from '@/contexts/LanguageProvider';
import { PerformanceOptimizedApp } from '@/components/performance/PerformanceOptimizedApp';
import { UnifiedErrorBoundary, DevelopmentErrorBoundary, ProductionErrorBoundary } from '@/components/common/UnifiedErrorBoundary';
import InitializationGate from '@/components/ui/initialization-gate';
import { ReactSafeWrapper } from '@/components/common/ReactSafeWrapper';


interface AppProvidersProps {
  children: React.ReactNode;
}

export const AppProviders: React.FC<AppProvidersProps> = ({ children }) => {
  const ErrorBoundaryComponent = process.env.NODE_ENV === 'production' 
    ? ProductionErrorBoundary 
    : DevelopmentErrorBoundary;

  return (
    <ReactSafeWrapper fallback={
      <div style={{ 
        padding: '20px', 
        textAlign: 'center',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div>
          <div style={{ 
            width: '40px', 
            height: '40px', 
            border: '4px solid #f3f4f6', 
            borderTop: '4px solid #3b82f6',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 16px'
          }} />
          <p>Initializing React context...</p>
        </div>
      </div>
    }>
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
    </ReactSafeWrapper>
  );
};