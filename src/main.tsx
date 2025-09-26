import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { appInitializer } from './utils/app-initialization';

// Ensure React is properly loaded before proceeding
if (!React || typeof React !== 'object' || !React.createElement) {
  console.error('React not properly loaded - critical error');
  document.body.innerHTML = '<div style="padding: 20px; text-align: center;">Loading React...</div>';
  throw new Error('React not available');
}

// Initialize app systems
appInitializer.initialize().then((result) => {
  if (!result.success) {
    console.warn('App initialization had issues:', result.issues);
  }
});

const rootElement = document.getElementById("root");

if (!rootElement) {
  // Create root element if missing instead of throwing
  const root = document.createElement('div');
  root.id = 'root';
  document.body.appendChild(root);
  console.warn('Root element was missing and has been created');
}

const root = createRoot(document.getElementById("root")!);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);