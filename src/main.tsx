import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

console.log('🚀 MAIN: Starting simple app initialization...');

// Simple initialization with detailed logging
async function initializeApp() {
  try {
    console.log('📋 MAIN: Checking DOM readiness...');
    
    // Wait for DOM to be ready
    if (document.readyState !== 'complete') {
      console.log('⏳ MAIN: Waiting for DOM to load...');
      await new Promise((resolve) => {
        const onReady = () => {
          console.log('✅ MAIN: DOM is now ready');
          resolve(true);
        };
        
        if (document.readyState === 'complete') {
          onReady();
        } else {
          document.addEventListener('DOMContentLoaded', onReady);
          window.addEventListener('load', onReady);
        }
      });
    } else {
      console.log('✅ MAIN: DOM already ready');
    }

    console.log('🔍 MAIN: Looking for root element...');
    const rootElement = document.getElementById("root");
    
    if (!rootElement) {
      throw new Error('Root element not found in DOM');
    }
    console.log('✅ MAIN: Root element found');

    console.log('🧹 MAIN: Clearing root element...');
    rootElement.replaceChildren();

    console.log('⚛️ MAIN: Creating React root...');
    const root = createRoot(rootElement);

    console.log('🎨 MAIN: Rendering React app...');
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
    
    console.log('✅ MAIN: App rendered successfully!');
  } catch (error) {
    console.error('❌ MAIN: Critical error during app initialization:', error);
    console.error('❌ Stack trace:', error instanceof Error ? error.stack : 'No stack');
    
    // Emergency fallback with detailed error info
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
          <h1 style="margin-bottom: 20px; font-size: 28px;">⚠️ Application Failed to Load</h1>
          <p style="margin-bottom: 15px;"><strong>Error:</strong> ${error instanceof Error ? error.message : String(error)}</p>
          <p style="margin-bottom: 15px; font-size: 16px; color: #ffeb3b;">The app encountered a critical error during startup.</p>
          <details style="margin: 20px 0; text-align: left;">
            <summary style="cursor: pointer; margin-bottom: 10px;">🔍 Technical Details</summary>
            <pre style="background: rgba(0,0,0,0.3); padding: 15px; border-radius: 8px; font-size: 12px; overflow: auto; max-height: 200px;">
DOM Ready: ${document.readyState}
Root Element: ${document.getElementById("root") ? 'Found' : 'Missing'}
Window Location: ${window.location.href}

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
console.log('🎯 MAIN: Starting initialization...');
initializeApp().catch((error) => {
  console.error('❌ MAIN: Failed to initialize app:', error);
});
