console.log('🚀 MAIN: Starting full app...');

// Import React FIRST and make it immediately available globally before ANY other imports
import React from 'react';
import { createRoot } from 'react-dom/client';

// Make React available globally IMMEDIATELY - this must happen before any i18n code runs
(window as any).React = React;
(window as any).createContext = React.createContext;
(window as any).useContext = React.useContext;
(window as any).useState = React.useState;
(window as any).useEffect = React.useEffect;
console.log('✅ MAIN: React made globally available with all hooks');

// Now import other modules
import App from './App.tsx';
import './index.css';

// Import error boundary
import { DiagnosticErrorBoundary } from './components/diagnostics/ErrorBoundary';
console.log('✅ MAIN: Components imported');

// Create a safe i18n initializer that ensures React is available
const initI18n = () => {
  return new Promise((resolve, reject) => {
    // Double-check React is available
    if (typeof (window as any).React !== 'undefined' && (window as any).createContext) {
      console.log('🔧 MAIN: React confirmed available, importing i18n...');
      
      // Use setTimeout to ensure this runs after the current execution context
      setTimeout(() => {
        import('./utils/i18n')
          .then(() => {
            console.log('✅ MAIN: i18n initialized successfully');
            resolve(true);
          })
          .catch((error) => {
            console.error('❌ MAIN: i18n initialization failed:', error);
            reject(error);
          });
      }, 0);
    } else {
      reject(new Error('React not available for i18n initialization'));
    }
  });
};

const startApp = async () => {
  try {
    console.log('🎯 MAIN: Checking DOM...');
    const rootElement = document.getElementById("root");
    console.log('🎯 MAIN: Root element found:', !!rootElement);
    
    if (!rootElement) {
      throw new Error('Root element not found in DOM');
    }
    
    const root = createRoot(rootElement);
    console.log('🎯 MAIN: React root created');
    
    // Initialize i18n first, then render the app
    console.log('🎯 MAIN: Initializing i18n...');
    await initI18n();
    
    console.log('🎯 MAIN: Rendering full App with providers...');
    root.render(
      <React.StrictMode>
        <DiagnosticErrorBoundary>
          <App />
        </DiagnosticErrorBoundary>
      </React.StrictMode>
    );
    
    console.log('✅ MAIN: Full app rendered successfully');
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
};

// Start the app
startApp();

console.log('🏁 MAIN: Initialization complete');