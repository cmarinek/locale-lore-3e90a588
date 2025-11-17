import { BrowserRouter } from 'react-router-dom';
import { AppProviders } from '@/components/app/AppProviders';
import { AppLayout } from '@/components/app/AppLayout';
import { AppRoutes } from '@/components/app/AppRoutes';
import { ChunkErrorBoundary } from '@/components/common/ChunkErrorBoundary';
import { HreflangTags } from '@/components/seo/HreflangTags';

function App() {
  // Note: bootstrap() in main.tsx ensures all services are initialized before rendering
  return (
    <ChunkErrorBoundary>
      <AppProviders>
        {/* BrowserRouter INSIDE providers so it has React context */}
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