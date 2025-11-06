import { analytics } from '@/utils/analytics';
import { initializeErrorTracking, initializePerformanceMonitoring } from '@/utils/monitoring';
import { registerServiceWorker } from '@/utils/pwa';
import { config } from '@/config/environments';

declare global {
  interface Window {
    __LOCALE_LORE_BOOTSTRAPPED__?: boolean;
  }
}

export const bootstrapApp = () => {
  if (typeof window === 'undefined') {
    return;
  }

  if (window.__LOCALE_LORE_BOOTSTRAPPED__) {
    return;
  }

  window.__LOCALE_LORE_BOOTSTRAPPED__ = true;

  if (config.enableErrorTracking) {
    initializeErrorTracking();
  }

  initializePerformanceMonitoring();

  if (config.enableAnalytics) {
    analytics.initialize();
  }

  if ('serviceWorker' in navigator && config.environment === 'production') {
    registerServiceWorker();
  }
};
