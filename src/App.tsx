
import React, { Suspense, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/sonner';
import { AuthProvider } from '@/contexts/AuthContext';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { MobileProvider } from '@/components/providers/MobileProvider';
import { PerformanceMonitor } from '@/components/monitoring/PerformanceMonitor';
import { ErrorBoundary } from '@/components/monitoring/ErrorBoundary';
import { AnimatedPage, PageTransition } from '@/components/ui/animated-page';
import { ScrollProgress } from '@/components/ui/smooth-scroll';
import { EnhancedSkeleton } from '@/components/ui/enhanced-skeleton';
import { initializeErrorTracking, initializePerformanceMonitoring } from '@/utils/monitoring';
import { analytics } from '@/utils/analytics';
import { seoManager } from '@/utils/seo';

// Initialize i18n
import '@/utils/i18n';

// Lazy load routes for better performance
import {
  LazyExplore,
  LazySearch,
  LazySubmit,
  LazyProfile,
  LazyFact,
  LazyAdmin,
  LazyDiscover,
  LazyGamification,
  LazyComponentShowcase,
  LazyLoreSubmit
} from '@/components/performance/LazyRoutes';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (replaces cacheTime)
    },
  },
});

function AppContent() {
  const location = useLocation();

  useEffect(() => {
    // Track page views
    analytics.trackPageView(location.pathname, document.title);
    
    // Update SEO for route changes
    seoManager.updateMeta({
      url: window.location.href,
    });
  }, [location]);

  return (
    <>
      <ScrollProgress />
      <PageTransition location={location.pathname}>
        <AnimatedPage>
          <Routes>
            <Route path="/" element={
              <Suspense fallback={<EnhancedSkeleton />}>
                <LazyExplore />
              </Suspense>
            } />
            <Route path="/search" element={
              <Suspense fallback={<EnhancedSkeleton />}>
                <LazySearch />
              </Suspense>
            } />
            <Route path="/submit" element={
              <Suspense fallback={<EnhancedSkeleton />}>
                <LazySubmit />
              </Suspense>
            } />
            <Route path="/profile" element={
              <Suspense fallback={<EnhancedSkeleton />}>
                <LazyProfile />
              </Suspense>
            } />
            <Route path="/fact/:id" element={
              <Suspense fallback={<EnhancedSkeleton />}>
                <LazyFact />
              </Suspense>
            } />
            <Route path="/admin" element={
              <Suspense fallback={<EnhancedSkeleton />}>
                <LazyAdmin />
              </Suspense>
            } />
            <Route path="/discover" element={
              <Suspense fallback={<EnhancedSkeleton />}>
                <LazyDiscover />
              </Suspense>
            } />
            <Route path="/gamification" element={
              <Suspense fallback={<EnhancedSkeleton />}>
                <LazyGamification />
              </Suspense>
            } />
            <Route path="/showcase" element={
              <Suspense fallback={<EnhancedSkeleton />}>
                <LazyComponentShowcase />
              </Suspense>
            } />
            <Route path="/lore-submit" element={
              <Suspense fallback={<EnhancedSkeleton />}>
                <LazyLoreSubmit />
              </Suspense>
            } />
          </Routes>
        </AnimatedPage>
      </PageTransition>
    </>
  );
}

function App() {
  useEffect(() => {
    // Initialize monitoring and analytics
    initializeErrorTracking();
    initializePerformanceMonitoring();
    analytics.initialize();

    // Set default SEO
    seoManager.updateMeta({
      title: 'Locale Lore - Discover Local Stories',
      description: 'Discover and explore local stories, culture, and hidden gems in your area.',
    });
  }, []);

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <LanguageProvider>
          <AuthProvider>
            <MobileProvider>
              <Router>
                <PerformanceMonitor />
                <AppContent />
                <Toaster />
              </Router>
            </MobileProvider>
          </AuthProvider>
        </LanguageProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
