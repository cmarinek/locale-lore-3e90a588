import React, { Suspense, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Index from '@/pages/Index';
import AuthMain from '@/pages/AuthMain';
import AuthCallback from '@/pages/AuthCallback';
import AuthConfirm from '@/pages/AuthConfirm';
import AuthResetPassword from '@/pages/AuthResetPassword';
import { Explore } from '@/pages/Explore';
import { Hybrid } from '@/pages/Hybrid';
import { LazyMap } from '@/components/performance/LazyRoutes';
import { Search } from '@/pages/Search';
import { Submit } from '@/pages/Submit';
import { Profile } from '@/pages/Profile';
import { Fact } from '@/pages/Fact';
import NotFound from '@/pages/NotFound';
import ComponentShowcase from '@/pages/ComponentShowcase';
import { Gamification } from '@/pages/Gamification';
import MediaManagement from '@/pages/MediaManagement';
import { Billing } from '@/pages/Billing';
import { Social } from '@/pages/Social';
import Stories from '@/pages/Stories';
import ContributorEconomy from '@/pages/ContributorEconomy';
import Admin from '@/pages/Admin';
import { Privacy } from '@/pages/Privacy';
import { Terms } from '@/pages/Terms';
import { ProductionReadiness } from '@/pages/ProductionReadiness';
import TranslationTest from '@/pages/TranslationTest';

import { AuthProvider } from '@/contexts/AuthProvider';
import { LanguageProvider } from '@/contexts/LanguageProvider';
import { ThemeProvider } from '@/contexts/ThemeProvider';
import { Toaster } from '@/components/ui/toaster';
import { HelmetProvider } from 'react-helmet-async';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import { CookieConsent } from '@/components/compliance/CookieConsent';
import { LoadingIntroduction } from '@/components/ui/loading-introduction';
import { useAuth } from '@/contexts/AuthProvider';


// Inner component that can use auth context
const AppContent = () => {
  const { loading: authLoading } = useAuth();
  const [showLoading, setShowLoading] = React.useState(true);
  const [appReady, setAppReady] = React.useState(false);

  React.useEffect(() => {
    // Simulate app initialization
    const initApp = async () => {
      // Wait for critical resources to load
      await new Promise(resolve => setTimeout(resolve, 1000));
      setAppReady(true);
    };
    
    initApp();
  }, []);

  const handleLoadingComplete = () => {
    setShowLoading(false);
  };

  // Show loading until both app and auth are ready
  const shouldShowLoading = showLoading || authLoading || !appReady;

  return (
    <>
      {shouldShowLoading ? (
        <LoadingIntroduction 
          onComplete={handleLoadingComplete}
          minDisplayTime={1000}
        />
      ) : (
        <Router>
          <div className="App">
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/auth/*" element={<AuthMain />} />
              <Route path="/auth/callback" element={<AuthCallback />} />
              <Route path="/auth/confirm" element={<AuthConfirm />} />
              <Route path="/auth/reset-password" element={<AuthResetPassword />} />
              <Route path="/explore" element={<Explore />} />
              <Route path="/hybrid" element={<Hybrid />} />
              <Route path="/map" element={<React.Suspense fallback={<div>Loading...</div>}><LazyMap /></React.Suspense>} />
              <Route path="/search" element={<Search />} />
              <Route path="/submit" element={<Submit />} />
              <Route path="/profile/:id?" element={<Profile />} />
              <Route path="/fact/:id" element={<Fact />} />
              <Route path="/gamification" element={<Gamification />} />
              <Route path="/media" element={<MediaManagement />} />
              <Route path="/billing" element={<Billing />} />
              <Route path="/social" element={<Social />} />
              <Route path="/stories" element={<Stories />} />
              <Route path="/contributor" element={<ContributorEconomy />} />
              <Route path="/admin" element={<Admin />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="/production-readiness" element={<ProductionReadiness />} />
              <Route path="/translation-test" element={<TranslationTest />} />
              <Route path="/showcase" element={<ComponentShowcase />} />
              {/* Legacy redirects */}
              <Route path="/lore/submit" element={<Submit />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
            <Toaster />
            <CookieConsent />
          </div>
        </Router>
      )}
    </>
  );
};

function App() {
  console.log('App component rendering...');

  // Clear ServiceWorker cache on development reload
  useEffect(() => {
    if (import.meta.env.DEV && import.meta.hot) {
      console.log('[DEV] Clearing caches for fresh start');
      
      // Clear ServiceWorker
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.getRegistrations().then((registrations) => {
          registrations.forEach((registration) => {
            registration.unregister();
          });
        });
      }
      
      // Clear caches
      if ('caches' in window) {
        caches.keys().then((cacheNames) => {
          cacheNames.forEach((cacheName) => {
            caches.delete(cacheName);
          });
        });
      }
    }
  }, []);

  return (
    <ErrorBoundary>
      <HelmetProvider>
        <AuthProvider>
          <ThemeProvider>
            <LanguageProvider>
              <AppContent />
            </LanguageProvider>
          </ThemeProvider>
        </AuthProvider>
      </HelmetProvider>
    </ErrorBoundary>
  );
}

export default App;