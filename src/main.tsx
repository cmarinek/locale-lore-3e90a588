import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { simplifiedInitializer } from './utils/simplified-initialization';

// Ensure React is properly loaded before proceeding
if (!React || typeof React !== 'object' || !React.createElement) {
  console.error('React not properly loaded - critical error');
  document.body.innerHTML = '<div style="padding: 20px; text-align: center;">Loading React...</div>';
  throw new Error('React not available');
}

// Create a minimal loading indicator that doesn't interfere with layout
const showLoadingIndicator = () => {
  const existingRoot = document.getElementById("root");
  if (existingRoot) {
    existingRoot.innerHTML = `
      <div style="
        display: flex; 
        align-items: center; 
        justify-content: center; 
        padding: 2rem;
        background: hsl(var(--background));
        color: hsl(var(--foreground));
        font-family: Inter, system-ui, sans-serif;
      ">
        <div style="text-align: center;">
          <div style="
            width: 32px; 
            height: 32px; 
            border: 2px solid hsl(var(--muted)); 
            border-top: 2px solid hsl(var(--primary)); 
            border-radius: 50%; 
            animation: spin 1s linear infinite; 
            margin: 0 auto 1rem;
          "></div>
          <p style="margin: 0; color: hsl(var(--muted-foreground)); font-size: 0.875rem;">Loading...</p>
        </div>
        <style>
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        </style>
      </div>
    `;
  }
};

// Initialize app with clean single initialization flow
const initializeApp = async () => {
  console.log('🚀 Starting app initialization...');
  try {
    // Show loading indicator
    showLoadingIndicator();
    console.log('📱 Loading indicator shown');
    
    // Ensure root element exists
    let rootElement = document.getElementById("root");
    if (!rootElement) {
      rootElement = document.createElement('div');
      rootElement.id = 'root';
      document.body.appendChild(rootElement);
      console.warn('Root element was missing and has been created');
    }

    // Use simplified initialization system
    const result = await simplifiedInitializer.initialize();
    
    if (!result.success) {
      console.warn('App initialization had issues:', result.issues);
      // Continue anyway - non-critical failures shouldn't block startup
    }

    console.log('✅ Initialization complete, rendering React app');

    // Create root container and render React
    rootElement.innerHTML = '';
    const root = createRoot(rootElement);

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