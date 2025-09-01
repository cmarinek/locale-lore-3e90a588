import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/sonner';
import { AuthProvider } from '@/contexts/AuthContext';
import { MobileProvider } from '@/components/providers/MobileProvider';
import { PerformanceMonitor } from '@/components/performance/PerformanceMonitor';
import { AnimatedPage, PageTransition } from '@/components/ui/animated-page';
import { ScrollProgress } from '@/components/ui/smooth-scroll';
import { EnhancedSkeleton } from '@/components/ui/enhanced-skeleton';
import { AnimatePresence } from 'framer-motion';

// Lazy load routes for better performance
import { LazyRoutes } from '@/components/performance/LazyRoutes';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
    },
  },
});

function AppContent() {
  const location = useLocation();

  return (
    <>
      <ScrollProgress />
      <PageTransition location={location.pathname}>
        <AnimatedPage>
          <Routes location={location}>
            <Route path="/*" element={
              <Suspense fallback={
                <div className="min-h-screen p-6">
                  <EnhancedSkeleton variant="card" lines={4} />
                </div>
              }>
                <LazyRoutes />
              </Suspense>
            } />
          </Routes>
        </AnimatedPage>
      </PageTransition>
    </>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <MobileProvider>
          <Router>
            <PerformanceMonitor />
            <AppContent />
            <Toaster />
          </Router>
        </MobileProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
