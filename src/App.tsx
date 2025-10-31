import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { AppProviders } from '@/components/app/AppProviders';
import { AppLayout } from '@/components/app/AppLayout';
import { AppRoutes } from '@/components/app/AppRoutes';
import { ChunkErrorBoundary } from '@/components/common/ChunkErrorBoundary';

function App() {
  return (
    <ChunkErrorBoundary>
      <Router>
        <AppProviders>
          <AppLayout>
            <AppRoutes />
          </AppLayout>
        </AppProviders>
      </Router>
    </ChunkErrorBoundary>
  );
}

export default App;