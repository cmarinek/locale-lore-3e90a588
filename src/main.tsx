console.log('DIAGNOSTIC: Starting main.tsx imports...');

import React from 'react';
console.log('DIAGNOSTIC: React imported');

import { createRoot } from 'react-dom/client';
console.log('DIAGNOSTIC: React DOM imported');

import App from './App.tsx';
console.log('DIAGNOSTIC: App component imported');

import './index.css';
console.log('DIAGNOSTIC: CSS imported');

// Initialize i18n before React to avoid circular dependencies
import './utils/i18n';
console.log('DIAGNOSTIC: i18n initialized successfully');

// Import our diagnostic error boundary
import { DiagnosticErrorBoundary } from './components/diagnostics/ErrorBoundary';
console.log('DIAGNOSTIC: Error boundary imported');

// Force cache refresh - updated at 2025-01-10 15:30:00
console.log('App starting to render...');

// Add comprehensive error handling and logging
try {
  console.log('1. DOM element check:', document.getElementById("root"));
  console.log('2. Document body:', document.body);
  console.log('3. Head element:', document.head);
  
  const root = createRoot(document.getElementById("root")!);
  console.log('4. React root created successfully');
  
  console.log('5. About to render App component...');
  root.render(
    <React.StrictMode>
      <DiagnosticErrorBoundary>
        <App />
      </DiagnosticErrorBoundary>
    </React.StrictMode>
  );
  console.log('6. React app rendered successfully');
} catch (error) {
  console.error('Fatal error during app initialization:', error);
  document.body.innerHTML = `<div style="padding: 20px; color: red; font-size: 18px; background: white; position: fixed; top: 0; left: 0; width: 100%; height: 100%; z-index: 9999;">
    <h1>App Failed to Load</h1>
    <p>Error: ${error instanceof Error ? error.message : String(error)}</p>
    <p>Stack: ${error instanceof Error ? error.stack : 'No stack trace'}</p>
    <p>Document body: ${document.body ? 'exists' : 'missing'}</p>
    <p>Document head: ${document.head ? 'exists' : 'missing'}</p>
  </div>`;
}

// Register service worker for PWA functionality (simplified for diagnostic)
console.log('DIAGNOSTIC: Main.tsx execution completed');
