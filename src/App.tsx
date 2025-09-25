import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { AppProviders } from '@/components/app/AppProviders';
import { AppInitialization } from '@/components/app/AppInitialization';
import { AppLayout } from '@/components/app/AppLayout';
import { AppRoutes } from '@/components/app/AppRoutes';

function App() {
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