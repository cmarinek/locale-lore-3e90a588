import React from 'react';
import { ContextErrorBoundary } from './ContextErrorBoundary';
import { HelmetProvider } from 'react-helmet-async';
import { I18nextProvider } from 'react-i18next';
import { AuthProvider } from '@/contexts/AuthProvider';
import { ThemeProvider } from '@/contexts/ThemeProvider';
import { LanguageProvider } from '@/contexts/LanguageProvider';
import { TranslationDebugProvider } from '@/contexts/TranslationDebugContext';
import { OfflineProvider } from '@/components/offline/OfflineProvider';
import { BrandingProvider } from './BrandingProvider';
import { NotificationProvider } from '@/contexts/NotificationContext';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import i18n from '@/utils/i18n';

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

/**
 * Simplified provider chain - no async state, i18n is pre-initialized in bootstrap
 */
export const ProviderChain: React.FC<ProviderChainProps> = ({ children }) => {
  return (
    <QueryClientProvider client={queryClient}>
      <I18nextProvider i18n={i18n}>
        <HelmetProvider>
          <ContextErrorBoundary contextName="AuthProvider">
            <AuthProvider>
              <ContextErrorBoundary contextName="ThemeProvider">
                <ThemeProvider>
                  <ContextErrorBoundary contextName="LanguageProvider">
                    <LanguageProvider>
                      <TranslationDebugProvider>
                        <NotificationProvider>
                          <OfflineProvider>
                            <BrandingProvider>
                              {children}
                            </BrandingProvider>
                          </OfflineProvider>
                        </NotificationProvider>
                      </TranslationDebugProvider>
                    </LanguageProvider>
                  </ContextErrorBoundary>
                </ThemeProvider>
              </ContextErrorBoundary>
            </AuthProvider>
          </ContextErrorBoundary>
        </HelmetProvider>
      </I18nextProvider>
    </QueryClientProvider>
  );
};