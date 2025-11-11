import React from 'react';
import { Toaster } from '@/components/ui/toaster';
import { CookieConsent } from '@/components/compliance/CookieConsent';
import { PerformanceMonitor } from '@/components/monitoring/PerformanceMonitor';
import { TranslationDebugToggle } from '@/components/admin/TranslationDebugToggle';
import { NavigationLoadingBar } from '@/components/loading/NavigationLoadingBar';
import { useAdmin } from '@/hooks/useAdmin';
import { AnnouncementBanner } from '@/components/site/AnnouncementBanner';

interface AppLayoutProps {
  children: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = React.memo(({ children }) => {
  const { isAdmin } = useAdmin();

  return (
    <div className="App">
      <NavigationLoadingBar />
      <AnnouncementBanner />
      {children}
      <Toaster />
      <CookieConsent />
      {isAdmin && <PerformanceMonitor />}
      {isAdmin && <TranslationDebugToggle />}
    </div>
  );
});