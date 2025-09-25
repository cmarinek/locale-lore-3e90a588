import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Ensure React is fully loaded before proceeding
if (!React || !React.createContext) {
  console.error('React not properly loaded - retrying...');
  setTimeout(() => window.location.reload(), 100);
  throw new Error('React not ready');
}

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error('Root element not found');
}

const root = createRoot(rootElement);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);