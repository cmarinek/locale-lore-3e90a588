import * as React from 'react';
const { Suspense, useEffect, useState, lazy } = React;
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Index from '@/pages/Index';
import AuthMain from '@/pages/AuthMain';
import AuthCallback from '@/pages/AuthCallback';
import AuthConfirm from '@/pages/AuthConfirm';
import AuthResetPassword from '@/pages/AuthResetPassword';
import { Explore } from '@/pages/Explore';
import { Hybrid } from '@/pages/Hybrid';
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
import { Support } from '@/pages/Support';
import { ContentGuidelines } from '@/pages/ContentGuidelines';
import TranslationTest from '@/pages/TranslationTest';

import { AuthProvider } from '@/contexts/AuthProvider';
import { LanguageProvider } from '@/contexts/LanguageProvider';
import { ThemeProvider } from '@/contexts/ThemeProvider';
import { PerformanceOptimizedApp } from '@/components/performance/PerformanceOptimizedApp';
import { Toaster } from '@/components/ui/toaster';
import { HelmetProvider } from 'react-helmet-async';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import { ProductionErrorBoundary } from '@/components/common/ProductionErrorBoundary';
import { CookieConsent } from '@/components/compliance/CookieConsent';
import { LoadingIntroduction } from '@/components/ui/loading-introduction';
import { PerformanceMonitor } from '@/components/monitoring/PerformanceMonitor';
import { useAuth } from '@/contexts/AuthProvider';
import InitializationGate from '@/components/ui/initialization-gate';
import { SecurityUtils, SessionManager } from '@/utils/security';
import { seoManager, optimizeCriticalResources } from '@/utils/seo';
import { logError, logInfo } from '@/utils/production-logger';
import { validateProductionRequirements } from '@/utils/production-config';


// Lazy load the Map component
const LazyMap = lazy(() => import('@/pages/Map'));

// Component that handles loading and routing logic
const AppRoutes = () => {
  const { loading: authLoading } = useAuth();
  const [showLoading, setShowLoading] = useState(true);
  const location = useLocation();

  const handleLoadingComplete = () => {
    setShowLoading(false);
  };

  // Only show loading on home page
  const isHomePage = location.pathname === '/';
  const shouldShowLoading = isHomePage && (showLoading || authLoading);

  return (
    <>
      {shouldShowLoading ? (
        <LoadingIntroduction 
          onComplete={handleLoadingComplete}
          minDisplayTime={5000}
        />
      ) : (
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
            <Route path="/support" element={<Support />} />
            <Route path="/content-guidelines" element={<ContentGuidelines />} />
            <Route path="/translation-test" element={<TranslationTest />} />
            <Route path="/showcase" element={<ComponentShowcase />} />
            {/* Legacy redirects */}
            <Route path="/lore/submit" element={<Submit />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
          <Toaster />
          <CookieConsent />
          <PerformanceMonitor />
        </div>
      )}
    </>
  );
};

// Inner component that wraps routes with Router
const AppContent = () => {
  return (
    <Router>
      <AppRoutes />
    </Router>
  );
};

function App() {
  // Debug: Check if React is properly loaded
  console.log('React object:', React);
  console.log('useEffect:', React?.useEffect);
  
  // Safety check: Ensure React is properly loaded
  if (!React || typeof React.useEffect !== 'function') {
    console.error('React is not properly loaded or useEffect is not available');
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <h1>Loading Error</h1>
        <p>React is not properly loaded. Please refresh the page.</p>
      </div>
    );
  }
  
  // Initialize Phase 4 enhancements
  React.useEffect(() => {
    // Validate production requirements
    const { isReady, issues } = validateProductionRequirements();
    if (!isReady) {
      logError('Production validation failed', { issues });
    }

    // Validate environment
    if (!SecurityUtils.validateEnvironment()) {
      logError('Environment validation failed');
    }

    // Initialize session management
    const sessionManager = SessionManager.getInstance();
    const handleActivity = () => sessionManager.updateActivity();
    
    // Track user activity for session management
    window.addEventListener('click', handleActivity);
    window.addEventListener('keypress', handleActivity);
    window.addEventListener('scroll', handleActivity);

    // Initialize SEO and performance optimization
    seoManager.preloadCriticalResources();
    optimizeCriticalResources();

    // Set default meta tags with GeoCache Lore branding
    seoManager.updateMeta({
      title: 'GeoCache Lore - Discover Hidden Stories Around the World',
      description: 'Explore fascinating facts and hidden stories about locations worldwide.',
    });

    return () => {
      window.removeEventListener('click', handleActivity);
      window.removeEventListener('keypress', handleActivity);
      window.removeEventListener('scroll', handleActivity);
    };
  }, []);

  // Clear ServiceWorker cache on development reload
  React.useEffect(() => {
    if (import.meta.env.DEV && import.meta.hot) {
      logInfo('DEV mode: Clearing caches for fresh start');
      
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

  const ErrorBoundaryComponent = process.env.NODE_ENV === 'production' 
    ? ProductionErrorBoundary 
    : ErrorBoundary;

  return (
    <PerformanceOptimizedApp>
      <ErrorBoundaryComponent {...(process.env.NODE_ENV === 'development' ? { enableRecovery: true, showErrorDetails: true } : {})}>
        <HelmetProvider>
          <AuthProvider>
            <ThemeProvider>
              <LanguageProvider>
                <InitializationGate>
                  <AppContent />
                </InitializationGate>
              </LanguageProvider>
            </ThemeProvider>
          </AuthProvider>
        </HelmetProvider>
      </ErrorBoundaryComponent>
    </PerformanceOptimizedApp>
  );
}

export default App;