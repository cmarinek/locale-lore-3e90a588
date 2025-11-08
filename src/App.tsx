import { StrictMode } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AppProviders } from '@/components/app/AppProviders';
import { AppLayout } from '@/components/app/AppLayout';
import { AppRoutes } from '@/components/app/AppRoutes';
import { ChunkErrorBoundary } from '@/components/common/ChunkErrorBoundary';

function App() {
  return (
    <StrictMode>
      <ChunkErrorBoundary>
        <BrowserRouter>
          <AppProviders>
            <AppLayout>
              <AppRoutes />
            </AppLayout>
          </AppProviders>
        </BrowserRouter>
      </ChunkErrorBoundary>
    </StrictMode>
  );
}

export default App;