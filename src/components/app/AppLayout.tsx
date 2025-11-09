import React from 'react';
import { Toaster } from '@/components/ui/toaster';
import { CookieConsent } from '@/components/compliance/CookieConsent';
import { PerformanceMonitor } from '@/components/monitoring/PerformanceMonitor';
import { useAdmin } from '@/hooks/useAdmin';

interface AppLayoutProps {
  children: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = React.memo(({ children }) => {
  const { isAdmin } = useAdmin();

  return (
    <div className="App">
      {children}
      <Toaster />
      <CookieConsent />
      {isAdmin && <PerformanceMonitor />}
    </div>
  );
});