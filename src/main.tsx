import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Simple, synchronous initialization
const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error('Root element not found');
}

// Render immediately without blocking initialization
createRoot(rootElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Initialize monitoring AFTER React renders
requestIdleCallback(() => {
  import('./bootstrap').then(({ bootstrapApp }) => {
    bootstrapApp();
  });
});
