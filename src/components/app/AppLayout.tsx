import React from 'react';
import { Toaster } from '@/components/ui/toaster';
import { CookieConsent } from '@/components/compliance/CookieConsent';
import { PerformanceMonitor } from '@/components/monitoring/PerformanceMonitor';

interface AppLayoutProps {
  children: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  return (
    <div className="App">
      {children}
      <Toaster />
      <CookieConsent />
      <PerformanceMonitor />
    </div>
  );
};