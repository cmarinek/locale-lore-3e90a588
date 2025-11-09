import { BrowserRouter } from 'react-router-dom';
import { AppProviders } from '@/components/app/AppProviders';
import { AppLayout } from '@/components/app/AppLayout';
import { AppRoutes } from '@/components/app/AppRoutes';
import { ChunkErrorBoundary } from '@/components/common/ChunkErrorBoundary';
import { HreflangTags } from '@/components/seo/HreflangTags';

function App() {
  return (
    <ChunkErrorBoundary>
      <BrowserRouter>
        <AppProviders>
          <HreflangTags />
          <AppLayout>
            <AppRoutes />
          </AppLayout>
        </AppProviders>
      </BrowserRouter>
    </ChunkErrorBoundary>
  );
}

export default App;