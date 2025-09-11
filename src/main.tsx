console.log('🚀 MAIN: Starting application with comprehensive initialization...');

// CRITICAL: Load polyfills FIRST before any other imports
import './utils/global-polyfills';
console.log('✅ MAIN: Global polyfills loaded');

import React from 'react';
import { createRoot } from 'react-dom/client';
import { initManager } from './utils/initialization-manager';
import App from './App.tsx';
import './index.css';

// Note: We no longer expose React on window to avoid interfering with internals

// Prepare i18n explicit initializer
import { initI18n } from './utils/i18n';
console.log('✅ MAIN: i18n initializer imported');

// Import error boundary
import { DiagnosticErrorBoundary } from '@/components/common/ErrorBoundary';
console.log('✅ MAIN: Components imported');

// Cache purging for clean builds
async function purgeStaleCache(): Promise<void> {
  if (typeof window === 'undefined') return;
  
  try {
    // Unregister service workers
    if ('serviceWorker' in navigator) {
      const registrations = await navigator.serviceWorker.getRegistrations();
      await Promise.all(registrations.map(reg => reg.unregister()));
      console.log('🧹 MAIN: Service workers unregistered');
    }
    
    // Clear caches
    if ('caches' in window) {
      const cacheNames = await caches.keys();
      await Promise.all(cacheNames.map(name => caches.delete(name)));
      console.log('🧹 MAIN: Caches purged');
    }
  } catch (error) {
    console.warn('⚠️ MAIN: Cache purging failed:', error);
  }
}

// Initialize the app with proper coordination
async function initializeApp() {
  try {
    console.log('🎯 MAIN: Starting coordinated initialization...');
    
    // Purge stale cache in development
    if (import.meta.env.DEV) {
      await purgeStaleCache();
    }
    
    // Initialize i18n before waiting for other APIs
    await initI18n();
    console.log('✅ MAIN: i18n initialized');
    
    // Wait for all APIs to be ready
    await initManager.initialize();
    console.log('✅ MAIN: All APIs ready, proceeding with React render...');
    
    const rootElement = document.getElementById("root");
    console.log('🎯 MAIN: Root element found:', !!rootElement);
    
    if (!rootElement) {
      throw new Error('Root element not found in DOM');
    }
    
    // Remove FOUC prevention
    rootElement.classList.add('ready');
    
    const root = createRoot(rootElement);
    console.log('🎯 MAIN: React root created');
    
    console.log('🎯 MAIN: Rendering app with initialization gate...');
    root.render(
      <React.StrictMode>
        <DiagnosticErrorBoundary>
          <App />
        </DiagnosticErrorBoundary>
      </React.StrictMode>
    );
    
    console.log('✅ Boot OK - Application initialized successfully');
  } catch (error) {
  console.error('❌ MAIN: Critical error during app initialization:', error);
  console.error('❌ Stack trace:', error instanceof Error ? error.stack : 'No stack');
  
  // Emergency fallback with detailed error info
  const rootElement = document.getElementById("root");
  document.body.innerHTML = `
    <div style="
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      font-size: 20px;
      padding: 40px;
      z-index: 99999;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      text-align: center;
    ">
      <div style="background: rgba(0,0,0,0.1); padding: 30px; border-radius: 15px; max-width: 600px;">
        <h1 style="margin-bottom: 20px; font-size: 28px;">⚠️ Application Bootstrap Failed</h1>
        <p style="margin-bottom: 15px;"><strong>Error:</strong> ${error instanceof Error ? error.message : String(error)}</p>
        <p style="margin-bottom: 15px; font-size: 16px; color: #ffeb3b;">This indicates a critical issue with the app initialization.</p>
        <details style="margin: 20px 0; text-align: left;">
          <summary style="cursor: pointer; margin-bottom: 10px;">🔍 Technical Details</summary>
          <pre style="background: rgba(0,0,0,0.3); padding: 15px; border-radius: 8px; font-size: 12px; overflow: auto; max-height: 200px;">
DOM Ready: ${document.readyState}
Root Element: ${rootElement ? 'Found' : 'Missing'}
Document Body: ${document.body ? 'Present' : 'Missing'}
Window Location: ${window.location.href}
User Agent: ${navigator.userAgent}

Error Stack:
${error instanceof Error ? error.stack : 'No stack trace available'}
          </pre>
        </details>
        <button onclick="window.location.reload()" style="
          padding: 15px 30px;
          font-size: 18px;
          margin-top: 20px;
          background: #4CAF50;
          color: white;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-weight: bold;
          transition: background 0.3s;
        " onmouseover="this.style.background='#45a049'" onmouseout="this.style.background='#4CAF50'">
          🔄 Reload Application
        </button>
      </div>
    </div>
  `;
}

}

// Start the initialization process
initializeApp().catch((error) => {
  console.error('❌ MAIN: Failed to initialize app:', error);
});

console.log('🏁 MAIN: Initialization started');
