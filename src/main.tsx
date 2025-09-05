console.log('DIAGNOSTIC: Starting main.tsx imports...');

import React from 'react';
console.log('DIAGNOSTIC: React imported');

import { createRoot } from 'react-dom/client';
console.log('DIAGNOSTIC: React DOM imported');

import App from './App.tsx';
console.log('DIAGNOSTIC: App component imported');

import './index.css';
console.log('DIAGNOSTIC: CSS imported');

// Import minimal i18n setup to avoid circular dependencies
try {
  console.log('DIAGNOSTIC: About to import minimal i18n...');
  await import('./utils/i18n-minimal'); // Initialize minimal i18n before React
  console.log('DIAGNOSTIC: minimal i18n imported successfully');
} catch (error) {
  console.error('DIAGNOSTIC: minimal i18n import failed:', error);
}

// Import our diagnostic error boundary
import { DiagnosticErrorBoundary } from './components/diagnostics/ErrorBoundary';
console.log('DIAGNOSTIC: Error boundary imported');

// Force cache refresh - updated at 2025-01-05 21:34:30
console.log('App starting to render...');

// Add comprehensive error handling and logging
try {
  console.log('1. DOM element check:', document.getElementById("root"));
  
  const root = createRoot(document.getElementById("root")!);
  console.log('2. React root created successfully');
  
  root.render(
    <React.StrictMode>
      <DiagnosticErrorBoundary>
        <App />
      </DiagnosticErrorBoundary>
    </React.StrictMode>
  );
  console.log('3. React app rendered successfully');
} catch (error) {
  console.error('Fatal error during app initialization:', error);
  document.body.innerHTML = `<div style="padding: 20px; color: red;">
    <h1>App Failed to Load</h1>
    <p>Error: ${error instanceof Error ? error.message : String(error)}</p>
  </div>`;
}

// Register service worker for PWA functionality (simplified for diagnostic)
console.log('DIAGNOSTIC: Main.tsx execution completed');
