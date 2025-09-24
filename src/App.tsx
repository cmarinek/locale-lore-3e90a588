import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { AppProviders } from '@/components/app/AppProviders';
import { AppInitialization } from '@/components/app/AppInitialization';
import { AppLayout } from '@/components/app/AppLayout';
import { AppRoutes } from '@/components/app/AppRoutes';

function App() {
  // Debug: Check if React is properly loaded
  console.log('React object:', React);
  console.log('useEffect:', React?.useEffect);
  
  // Safety check: Ensure React is properly loaded
  if (!React || typeof React.useEffect !== 'function') {
    console.error('React is not properly loaded or useEffect is not available');
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <h1>Loading Error</h1>
        <p>React is not properly loaded. Please refresh the page.</p>
      </div>
    );
  }

  return (
    <AppProviders>
      <AppInitialization>
        <Router>
          <AppLayout>
            <AppRoutes />
          </AppLayout>
        </Router>
      </AppInitialization>
    </AppProviders>
  );
}

export default App;