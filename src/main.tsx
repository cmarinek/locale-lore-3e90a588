import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { appInitializer } from './utils/app-initialization';
import { viteChunkOptimizer } from './utils/vite-chunk-optimizer';

// Ensure React is properly loaded before proceeding
if (!React || typeof React !== 'object' || !React.createElement) {
  console.error('React not properly loaded - critical error');
  document.body.innerHTML = '<div style="padding: 20px; text-align: center;">Loading React...</div>';
  throw new Error('React not available');
}

// Create a loading indicator
const showLoadingIndicator = () => {
  const loadingHTML = `
    <div style="
      min-height: 100vh; 
      display: flex; 
      align-items: center; 
      justify-content: center; 
      background: hsl(var(--background));
      color: hsl(var(--foreground));
      font-family: Inter, system-ui, sans-serif;
    ">
      <div style="text-align: center; max-width: 400px; padding: 2rem;">
        <div style="
          width: 40px; 
          height: 40px; 
          border: 3px solid hsl(var(--muted)); 
          border-top: 3px solid hsl(var(--primary)); 
          border-radius: 50%; 
          animation: spin 1s linear infinite; 
          margin: 0 auto 1rem;
        "></div>
        <h2 style="margin: 0 0 0.5rem; font-size: 1.25rem; font-weight: 600;">Initializing GeoCache Lore</h2>
        <p style="margin: 0; color: hsl(var(--muted-foreground)); font-size: 0.875rem;">Setting up your experience...</p>
      </div>
      <style>
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      </style>
    </div>
  `;
  document.body.innerHTML = loadingHTML;
};

// Initialize chunk optimizer for better Vite bundling
console.log('🔧 Vite chunk optimizer initialized');

// Initialize app with proper loading states
const initializeApp = async () => {
  try {
    // Show loading indicator
    showLoadingIndicator();
    
    // Ensure root element exists
    let rootElement = document.getElementById("root");
    if (!rootElement) {
      rootElement = document.createElement('div');
      rootElement.id = 'root';
      document.body.appendChild(rootElement);
      console.warn('Root element was missing and has been created');
    }

    // Initialize app systems with timeout protection
    const initPromise = appInitializer.initialize();
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('Initialization timeout')), 15000);
    });

    const result = await Promise.race([initPromise, timeoutPromise]);
    
    if (!result.success) {
      console.warn('App initialization had issues:', result.issues);
      // Continue anyway - non-critical failures shouldn't block startup
    }

    console.log('✅ Initialization complete, rendering React app');

    // Clear loading indicator and render React
    document.body.innerHTML = '<div id="root"></div>';
    const root = createRoot(document.getElementById("root")!);

    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );

  } catch (error) {
    console.error('❌ Critical initialization error:', error);
    
    // Render fallback app even if initialization fails
    document.body.innerHTML = `
      <div style="
        min-height: 100vh; 
        display: flex; 
        align-items: center; 
        justify-content: center; 
        background: #f8f9fa;
        font-family: system-ui, sans-serif;
        padding: 2rem;
      ">
        <div style="text-align: center; max-width: 500px;">
          <h1 style="color: #dc3545; margin-bottom: 1rem;">Initialization Failed</h1>
          <p style="color: #6c757d; margin-bottom: 2rem;">
            The app failed to initialize properly. This might be due to network issues or browser compatibility.
          </p>
          <button onclick="window.location.reload()" style="
            background: #007bff; 
            color: white; 
            border: none; 
            padding: 0.75rem 1.5rem; 
            border-radius: 0.375rem; 
            cursor: pointer;
            font-size: 1rem;
          ">
            Retry Loading
          </button>
        </div>
      </div>
    `;
  }
};

// Start initialization
initializeApp();