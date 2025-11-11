import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { bootstrap } from './bootstrap';

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error('Root element not found');
}

// Initialize BEFORE rendering to prevent race conditions
bootstrap().then(() => {
  console.log('[main] Bootstrap complete, rendering app...');
  
  createRoot(rootElement).render(
    <StrictMode>
      <App />
    </StrictMode>
  );
}).catch((error) => {
  console.error('[main] Bootstrap failed:', error);
  // Render app anyway to show error boundary
  createRoot(rootElement).render(
    <StrictMode>
      <App />
    </StrictMode>
  );
});
