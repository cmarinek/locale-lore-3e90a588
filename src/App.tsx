import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Index } from '@/pages/Index';
import AuthMain from '@/pages/AuthMain';
import AuthCallback from '@/pages/AuthCallback';
import AuthConfirm from '@/pages/AuthConfirm';
import AuthResetPassword from '@/pages/AuthResetPassword';
import NotFound from '@/pages/NotFound';
import ComponentShowcase from '@/pages/ComponentShowcase';
import LoreSubmit from '@/pages/LoreSubmit';
import { AuthProvider } from '@/contexts/AuthContext';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { Toaster } from '@/components/ui/toaster';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

import { 
  ExplorePageLazy,
  SearchPageLazy,
  SubmitPageLazy,
  ProfilePageLazy,
  FactPageLazy,
  AdminPageLazy,
  DiscoverPageLazy,
  DiscoveryPageLazy,
  GamificationPageLazy,
  MediaManagementPageLazy,
  BillingPageLazy
} from '@/components/performance/LazyRoutes';
import { SocialPageLazy } from '@/components/performance/LazyRoutes';
import { StoriesPageLazy } from '@/components/performance/LazyRoutes';

const App = () => {
  return (
    <Router>
      <AuthProvider>
        <LanguageProvider>
          <QueryClientProvider client={queryClient}>
            <Toaster />
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/explore" element={
                <Suspense fallback={<div>Loading...</div>}>
                  <ExplorePageLazy />
                </Suspense>
              } />
              <Route path="/search" element={
                <Suspense fallback={<div>Loading...</div>}>
                  <SearchPageLazy />
                </Suspense>
              } />
              <Route path="/submit" element={
                <Suspense fallback={<div>Loading...</div>}>
                  <SubmitPageLazy />
                </Suspense>
              } />
              <Route path="/profile" element={
                <Suspense fallback={<div>Loading...</div>}>
                  <ProfilePageLazy />
                </Suspense>
              } />
              <Route path="/fact/:id" element={
                <Suspense fallback={<div>Loading...</div>}>
                  <FactPageLazy />
                </Suspense>
              } />
              <Route path="/admin" element={
                <Suspense fallback={<div>Loading...</div>}>
                  <AdminPageLazy />
                </Suspense>
              } />
              <Route path="/discover" element={
                <Suspense fallback={<div>Loading...</div>}>
                  <DiscoverPageLazy />
                </Suspense>
              } />
              <Route path="/discovery" element={
                <Suspense fallback={<div>Loading...</div>}>
                  <DiscoveryPageLazy />
                </Suspense>
              } />
              <Route path="/gamification" element={
                <Suspense fallback={<div>Loading...</div>}>
                  <GamificationPageLazy />
                </Suspense>
              } />
              <Route path="/media" element={
                <Suspense fallback={<div>Loading...</div>}>
                  <MediaManagementPageLazy />
                </Suspense>
              } />
              <Route path="/billing" element={
                <Suspense fallback={<div>Loading...</div>}>
                  <BillingPageLazy />
                </Suspense>
              } />
              <Route path="/social" element={
                <Suspense fallback={<div>Loading...</div>}>
                  <SocialPageLazy />
                </Suspense>
              } />
              <Route path="/stories" element={
                <Suspense fallback={<div>Loading...</div>}>
                  <StoriesPageLazy />
                </Suspense>
              } />
              <Route path="/auth" element={<AuthMain />} />
              <Route path="/auth/callback" element={<AuthCallback />} />
              <Route path="/auth/confirm" element={<AuthConfirm />} />
              <Route path="/auth/reset-password" element={<AuthResetPassword />} />
              <Route path="/lore/submit" element={<LoreSubmit />} />
              <Route path="/components" element={<ComponentShowcase />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </QueryClientProvider>
        </LanguageProvider>
      </AuthProvider>
    </Router>
  );
};

export default App;
