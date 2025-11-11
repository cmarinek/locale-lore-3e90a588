import { BrowserRouter } from 'react-router-dom';
import { AppProviders } from '@/components/app/AppProviders';
import { AppLayout } from '@/components/app/AppLayout';
import { AppRoutes } from '@/components/app/AppRoutes';
import { ChunkErrorBoundary } from '@/components/common/ChunkErrorBoundary';
import { HreflangTags } from '@/components/seo/HreflangTags';
import { InitializationGuard } from '@/components/app/InitializationGuard';

function App() {
  return (
    <ChunkErrorBoundary>
      <InitializationGuard>
        <AppProviders>
          {/* BrowserRouter INSIDE providers so it has React context */}
          <BrowserRouter>
            <HreflangTags />
            <AppLayout>
              <AppRoutes />
            </AppLayout>
          </BrowserRouter>
        </AppProviders>
      </InitializationGuard>
    </ChunkErrorBoundary>
  );
}

export default App;