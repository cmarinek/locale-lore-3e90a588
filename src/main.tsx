import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Comprehensive React loading checks
if (!React || typeof React !== 'object') {
  console.error('React not loaded');
  throw new Error('React not available');
}

// Check for essential React functions
const requiredReactFeatures = [
  'createContext', 'useState', 'useEffect', 'useRef', 
  'useCallback', 'useMemo', 'createElement', 'Component'
];

for (const feature of requiredReactFeatures) {
  if (!React[feature]) {
    console.error(`React.${feature} not available`);
    setTimeout(() => window.location.reload(), 100);
    throw new Error(`React.${feature} not ready`);
  }
}

// Test React functionality
try {
  const testElement = React.createElement('div', { key: 'test' }, 'test');
  if (!testElement || typeof testElement !== 'object') {
    throw new Error('React.createElement not working properly');
  }
} catch (error) {
  console.error('React functionality test failed:', error);
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