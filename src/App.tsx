import { BrowserRouter } from 'react-router-dom';
import { AppProviders } from '@/components/app/AppProviders';
import { AppLayout } from '@/components/app/AppLayout';
import { AppRoutes } from '@/components/app/AppRoutes';
import { ChunkErrorBoundary } from '@/components/common/ChunkErrorBoundary';
import { HreflangTags } from '@/components/seo/HreflangTags';

function App() {
  return (
    <ChunkErrorBoundary>
      <AppProviders>
        <BrowserRouter>
          <HreflangTags />
          <AppLayout>
            <AppRoutes />
          </AppLayout>
        </BrowserRouter>
      </AppProviders>
    </ChunkErrorBoundary>
  );
}

export default App;