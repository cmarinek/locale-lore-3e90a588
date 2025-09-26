import React, { Suspense, lazy, useMemo } from 'react';
import { ContextErrorBoundary } from './ContextErrorBoundary';

// Optimized loading fallback for context providers
const ContextLoadingFallback = React.memo(({ name }: { name: string }) => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="text-center space-y-4">
      <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto" />
      <p className="text-muted-foreground text-sm">Loading {name}...</p>
    </div>
  </div>
));

// Lazy load providers for better code splitting
const HelmetProvider = lazy(() => 
  import('react-helmet-async').then(module => ({ 
    default: module.HelmetProvider 
  }))
);

const AuthProvider = lazy(() => 
  import('@/contexts/AuthProvider').then(module => ({ 
    default: module.AuthProvider 
  }))
);

const ThemeProvider = lazy(() => 
  import('@/contexts/ThemeProvider').then(module => ({ 
    default: module.ThemeProvider 
  }))
);

const LanguageProvider = lazy(() => 
  import('@/contexts/LanguageProvider').then(module => ({ 
    default: module.LanguageProvider 
  }))
);

interface ProviderChainProps {
  children: React.ReactNode;
}

export const ProviderChain: React.FC<ProviderChainProps> = React.memo(({ children }) => {
  // Memoize loading fallbacks to prevent re-renders
  const helmetFallback = useMemo(() => <ContextLoadingFallback name="Helmet" />, []);
  const authFallback = useMemo(() => <ContextLoadingFallback name="Authentication" />, []);
  const themeFallback = useMemo(() => <ContextLoadingFallback name="Theme" />, []);
  const langFallback = useMemo(() => <ContextLoadingFallback name="Language" />, []);

  return (
    <ContextErrorBoundary contextName="HelmetProvider">
      <Suspense fallback={helmetFallback}>
        <HelmetProvider>
          <ContextErrorBoundary contextName="AuthProvider">
            <Suspense fallback={authFallback}>
              <AuthProvider>
                <ContextErrorBoundary contextName="ThemeProvider">
                  <Suspense fallback={themeFallback}>
                    <ThemeProvider>
                      <ContextErrorBoundary contextName="LanguageProvider">
                        <Suspense fallback={langFallback}>
                          <LanguageProvider>
                            {children}
                          </LanguageProvider>
                        </Suspense>
                      </ContextErrorBoundary>
                    </ThemeProvider>
                  </Suspense>
                </ContextErrorBoundary>
              </AuthProvider>
            </Suspense>
          </ContextErrorBoundary>
        </HelmetProvider>
      </Suspense>
    </ContextErrorBoundary>
  );
});