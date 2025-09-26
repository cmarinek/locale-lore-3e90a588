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

// Initialize app with clean single initialization flow
const initializeApp = async () => {
  console.log('🚀 Starting app initialization...');
  
  try {
    // Show loading indicator
    console.log('📺 Showing loading indicator...');
    showLoadingIndicator();
    console.log('✅ Loading indicator shown');
    
    // Ensure root element exists
    console.log('🔍 Looking for root element...');
    let rootElement = document.getElementById("root");
    if (!rootElement) {
      console.log('⚠️ Root element not found, creating one...');
      rootElement = document.createElement('div');
      rootElement.id = 'root';
      document.body.appendChild(rootElement);
      console.log('✅ Root element created');
    } else {
      console.log('✅ Root element found');
    }

    // Use simplified initialization system
    console.log('🔧 Starting simplified initialization...');
    const result = await simplifiedInitializer.initialize();
    console.log('📊 Initialization result:', result);
    
    if (!result.success) {
      console.warn('⚠️ App initialization had issues:', result.issues);
      // Continue anyway - non-critical failures shouldn't block startup
    } else {
      console.log('✅ Simplified initialization completed successfully');
    }

    console.log('🎨 Preparing to render React app...');

    // Create root container and render React
    console.log('🧹 Clearing root element...');
    rootElement.innerHTML = '';
    
    console.log('🎨 Creating React root...');
    const root = createRoot(rootElement);

    console.log('🚀 Rendering React app...');
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
    
    console.log('🎉 React app rendered successfully!');

  } catch (error) {
    console.error('💥 Critical initialization error:', error);
    
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
            The app failed to initialize properly. Check the console for details.
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
          <details style="margin-top: 1rem; text-align: left;">
            <summary style="cursor: pointer; margin-bottom: 0.5rem;">Error Details</summary>
            <pre style="background: #f1f3f4; padding: 1rem; border-radius: 0.375rem; overflow: auto; font-size: 0.75rem;">
${error instanceof Error ? error.stack : String(error)}
            </pre>
          </details>
        </div>
      </div>
    `;
  }
};

// Start initialization
console.log('🏁 Starting application...');
initializeApp();