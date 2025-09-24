import React, { useEffect } from 'react';
import { SecurityUtils, SessionManager } from '@/utils/security';
import { seoManager, optimizeCriticalResources } from '@/utils/seo';
import { logError, logInfo } from '@/utils/production-logger';
import { validateProductionRequirements } from '@/utils/production-config';

interface AppInitializationProps {
  children: React.ReactNode;
}

export const AppInitialization: React.FC<AppInitializationProps> = ({ children }) => {
  useEffect(() => {
    // Validate production requirements
    const { isReady, issues } = validateProductionRequirements();
    if (!isReady) {
      logError('Production validation failed', { issues });
    }

    // Validate environment
    if (!SecurityUtils.validateEnvironment()) {
      logError('Environment validation failed');
    }

    // Initialize session management
    const sessionManager = SessionManager.getInstance();
    const handleActivity = () => sessionManager.updateActivity();
    
    // Track user activity for session management
    window.addEventListener('click', handleActivity);
    window.addEventListener('keypress', handleActivity);
    window.addEventListener('scroll', handleActivity);

    // Initialize SEO and performance optimization
    seoManager.preloadCriticalResources();
    optimizeCriticalResources();

    // Set default meta tags with GeoCache Lore branding
    seoManager.updateMeta({
      title: 'GeoCache Lore - Discover Hidden Stories Around the World',
      description: 'Explore fascinating facts and hidden stories about locations worldwide.',
    });

    return () => {
      window.removeEventListener('click', handleActivity);
      window.removeEventListener('keypress', handleActivity);
      window.removeEventListener('scroll', handleActivity);
    };
  }, []);

  // Clear ServiceWorker cache on development reload
  useEffect(() => {
    if (import.meta.env.DEV && import.meta.hot) {
      logInfo('DEV mode: Clearing caches for fresh start');
      
      // Clear ServiceWorker
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.getRegistrations().then((registrations) => {
          registrations.forEach((registration) => {
            registration.unregister();
          });
        });
      }
      
      // Clear caches
      if ('caches' in window) {
        caches.keys().then((cacheNames) => {
          cacheNames.forEach((cacheName) => {
            caches.delete(cacheName);
          });
        });
      }
    }
  }, []);

  return <>{children}</>;
};