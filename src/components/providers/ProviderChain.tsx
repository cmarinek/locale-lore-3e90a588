import React from 'react';
import { ContextErrorBoundary } from './ContextErrorBoundary';
import { HelmetProvider } from 'react-helmet-async';
import { AuthProvider } from '@/contexts/AuthProvider';
import { ThemeProvider } from '@/contexts/ThemeProvider';
import { LanguageProvider } from '@/contexts/LanguageProvider';
import { StoreProvider } from './StoreProvider';
import { OfflineProvider } from '@/components/offline/OfflineProvider';

interface ProviderChainProps {
  children: React.ReactNode;
}

export const ProviderChain: React.FC<ProviderChainProps> = ({ children }) => {
  return (
    <ContextErrorBoundary contextName="HelmetProvider">
      <HelmetProvider>
        <ContextErrorBoundary contextName="AuthProvider">
          <AuthProvider>
            <ContextErrorBoundary contextName="ThemeProvider">
              <ThemeProvider>
                <ContextErrorBoundary contextName="LanguageProvider">
                  <LanguageProvider>
                    <ContextErrorBoundary contextName="StoreProvider">
                      <OfflineProvider>
                        <StoreProvider>
                          {children}
                        </StoreProvider>
                      </OfflineProvider>
                    </ContextErrorBoundary>
                  </LanguageProvider>
                </ContextErrorBoundary>
              </ThemeProvider>
            </ContextErrorBoundary>
          </AuthProvider>
        </ContextErrorBoundary>
      </HelmetProvider>
    </ContextErrorBoundary>
  );
};