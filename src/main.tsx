import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { bootstrap } from './bootstrap';

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error('Root element not found');
}

// Create root once
const root = createRoot(rootElement);

// Initialize BEFORE rendering to prevent race conditions
bootstrap().then(() => {
  console.log('[main] Bootstrap complete, rendering app...');

  root.render(
    <StrictMode>
      <App />
    </StrictMode>
  );
}).catch((error) => {
  console.error('[main] Bootstrap failed:', error);
  // Render app anyway to show error boundary - use same root instance
  root.render(
    <StrictMode>
      <App />
    </StrictMode>
  );
});
