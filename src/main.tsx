import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { appInitializer } from './utils/app-initialization';

// Simplified React checks without aggressive reloads
if (!React || typeof React !== 'object') {
  console.error('React not loaded - continuing with degraded functionality');
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