import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import './utils/i18n'; // Initialize i18n before React
import { initializeErrorTracking, initializePerformanceMonitoring } from './utils/monitoring';
import { initializeSecurityMonitoring } from './lib/supabase-secure';
import { productionMonitor } from '@/utils/production-monitor';

// Initialize monitoring and error tracking
initializeErrorTracking();
initializePerformanceMonitoring();
initializeSecurityMonitoring();

// Initialize production monitoring
if (import.meta.env.PROD) {
  productionMonitor.trackCustomEvent('app_initialized', {
    environment: 'production',
    timestamp: new Date()
  });
}

// Force cache refresh - updated at 2025-01-05 21:33:00
console.log('App starting to render...');
createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Register service worker for PWA functionality
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('SW registered: ', registration);
        productionMonitor.trackCustomEvent('service_worker_registered');
      })
      .catch((registrationError) => {
        console.log('SW registration failed: ', registrationError);
        productionMonitor.trackCustomEvent('service_worker_failed', {
          error: registrationError.message
        });
      });
  });
}
