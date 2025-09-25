import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { AppProviders } from '@/components/app/AppProviders';
import { AppInitialization } from '@/components/app/AppInitialization';
import { AppLayout } from '@/components/app/AppLayout';
import { AppRoutes } from '@/components/app/AppRoutes';

function App() {
  // Ensure React hooks are available before rendering
  if (!React.useRef || !React.useState || !React.useEffect) {
    console.error('React hooks not available');
    return <div>Loading...</div>;
  }

  return (
    <Router>
      <AppProviders>
        <AppInitialization>
          <AppLayout>
            <AppRoutes />
          </AppLayout>
        </AppInitialization>
      </AppProviders>
    </Router>
  );
}

export default App;