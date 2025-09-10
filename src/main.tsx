console.log('🚀 MAIN: Starting app...');

import React from 'react';
import { createRoot } from 'react-dom/client';
import Index from './pages/Index';

console.log('✅ MAIN: Imports loaded');

try {
  console.log('🎯 MAIN: Creating root...');
  const rootElement = document.getElementById("root");
  console.log('🎯 MAIN: Root element:', rootElement);
  
  if (!rootElement) {
    throw new Error('Root element not found');
  }
  
  const root = createRoot(rootElement);
  console.log('🎯 MAIN: Root created, rendering...');
  
  root.render(
    <React.StrictMode>
      <Index />
    </React.StrictMode>
  );
  
  console.log('✅ MAIN: App rendered successfully');
} catch (error) {
  console.error('❌ MAIN: Fatal error:', error);
  
  // Fallback display
  document.body.innerHTML = `
    <div style="
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: #000;
      color: #fff;
      font-size: 24px;
      padding: 40px;
      z-index: 99999;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      font-family: Arial, sans-serif;
    ">
      <h1>⚠️ APP LOAD ERROR</h1>
      <p>Error: ${error instanceof Error ? error.message : String(error)}</p>
      <button onclick="window.location.reload()" style="
        padding: 15px 30px;
        font-size: 18px;
        margin-top: 20px;
        background: #fff;
        color: #000;
        border: none;
        border-radius: 8px;
        cursor: pointer;
      ">
        Reload Page
      </button>
    </div>
  `;
}
