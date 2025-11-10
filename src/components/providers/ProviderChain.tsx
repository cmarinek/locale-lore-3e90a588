import React, { useEffect, useState } from 'react';
import { ContextErrorBoundary } from './ContextErrorBoundary';
import { HelmetProvider } from 'react-helmet-async';
import { I18nextProvider } from 'react-i18next';
import { AuthProvider } from '@/contexts/AuthProvider';
import { ThemeProvider } from '@/contexts/ThemeProvider';
import { LanguageProvider } from '@/contexts/LanguageProvider';
import { TranslationDebugProvider } from '@/contexts/TranslationDebugContext';
import { OfflineProvider } from '@/components/offline/OfflineProvider';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import i18n, { initI18n } from '@/utils/i18n';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
    },
  },
});

interface ProviderChainProps {
  children: React.ReactNode;
}

export const ProviderChain: React.FC<ProviderChainProps> = ({ children }) => {
  const [i18nReady, setI18nReady] = useState(false);

  useEffect(() => {
    initI18n().then(() => {
      setI18nReady(true);
    });
  }, []);

  if (!i18nReady) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <I18nextProvider i18n={i18n}>
        <ContextErrorBoundary contextName="HelmetProvider">
          <HelmetProvider>
            <ContextErrorBoundary contextName="AuthProvider">
              <AuthProvider>
                <ContextErrorBoundary contextName="ThemeProvider">
                  <ThemeProvider>
                    <ContextErrorBoundary contextName="LanguageProvider">
                      <LanguageProvider>
                        <TranslationDebugProvider>
                          <OfflineProvider>
                            {children}
                          </OfflineProvider>
                        </TranslationDebugProvider>
                      </LanguageProvider>
                    </ContextErrorBoundary>
                  </ThemeProvider>
                </ContextErrorBoundary>
              </AuthProvider>
            </ContextErrorBoundary>
          </HelmetProvider>
        </ContextErrorBoundary>
      </I18nextProvider>
    </QueryClientProvider>
  );
};