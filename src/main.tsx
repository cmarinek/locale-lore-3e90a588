import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Ensure React is fully loaded before proceeding
if (!React || !React.createContext || !React.useState || !React.useEffect) {
  console.error('React not properly loaded - retrying...');
  setTimeout(() => window.location.reload(), 100);
  throw new Error('React not ready');
}

// Additional check for React hooks availability
try {
  const testElement = React.createElement('div');
  if (!testElement) {
    throw new Error('React.createElement not working');
  }
} catch (error) {
  console.error('React createElement test failed:', error);
  setTimeout(() => window.location.reload(), 100);
  throw new Error('React not functional');
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