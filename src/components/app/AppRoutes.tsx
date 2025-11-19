import React, { Suspense, lazy, useState, useMemo, useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthProvider';
import { LoadingIntroduction } from '@/components/ui/loading-introduction';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

// Eager load critical pages
import Index from '@/pages/Index';
import AuthMain from '@/pages/AuthMain';
import NotFound from '@/pages/NotFound';

// Helper function to create lazy-loaded components with proper error handling
const createLazyPage = <T extends React.ComponentType<any>>(
  importFn: () => Promise<{ default: T } | { [key: string]: T }>,
  pageName: string
) => {
  return lazy(() =>
    importFn()
      .then((module) => {
        // Check for default export first, then named export
        const component = (module as any).default || (module as any)[pageName];
        if (!component) {
          throw new Error(
            `Failed to load page: ${pageName} - Component not found. ` +
            `Ensure the file exports a valid component as default or named export "${pageName}".`
          );
        }
        return { default: component };
      })
      .catch((error) => {
        console.error(`Module import failed for ${pageName}:`, error);
        throw error;
      })
  );
};

// Lazy load secondary pages with error handling
const AuthCallback = createLazyPage(() => import('@/pages/AuthCallback'), 'AuthCallback');
const AuthConfirm = createLazyPage(() => import('@/pages/AuthConfirm'), 'AuthConfirm');
const AuthResetPassword = createLazyPage(() => import('@/pages/AuthResetPassword'), 'AuthResetPassword');
const Explore = createLazyPage(() => import('@/pages/Explore'), 'Explore');
const Search = createLazyPage(() => import('@/pages/Search'), 'Search');
const Submit = createLazyPage(() => import('@/pages/Submit'), 'Submit');
const Profile = createLazyPage(() => import('@/pages/Profile'), 'Profile');
const Fact = createLazyPage(() => import('@/pages/Fact'), 'Fact');
const ComponentShowcase = createLazyPage(() => import('@/pages/ComponentShowcase'), 'ComponentShowcase');
const Gamification = createLazyPage(() => import('@/pages/Gamification'), 'Gamification');
const Notifications = createLazyPage(() => import('@/pages/Notifications'), 'Notifications');
const Friends = createLazyPage(() => import('@/pages/Friends'), 'Friends');
const Hybrid = createLazyPage(() => import('@/pages/Hybrid'), 'Hybrid');
const MediaManagement = createLazyPage(() => import('@/pages/MediaManagement'), 'MediaManagement');
const Billing = createLazyPage(() => import('@/pages/Billing'), 'Billing');
const Social = createLazyPage(() => import('@/pages/Social'), 'Social');
const Stories = createLazyPage(() => import('@/pages/Stories'), 'Stories');
const ContributorEconomy = createLazyPage(() => import('@/pages/ContributorEconomy'), 'ContributorEconomy');
const Admin = createLazyPage(() => import('@/pages/Admin'), 'Admin');
const Privacy = createLazyPage(() => import('@/pages/Privacy'), 'Privacy');
const Terms = createLazyPage(() => import('@/pages/Terms'), 'Terms');
const ProductionReadiness = createLazyPage(() => import('@/pages/ProductionReadiness'), 'ProductionReadiness');
const PreDeploymentDashboard = createLazyPage(() => import('@/pages/PreDeploymentDashboard'), 'PreDeploymentDashboard');
const Support = createLazyPage(() => import('@/pages/Support'), 'Support');
const ContentGuidelines = createLazyPage(() => import('@/pages/ContentGuidelines'), 'ContentGuidelines');
const TranslationTest = createLazyPage(() => import('@/pages/TranslationTest'), 'TranslationTest');
const Monitoring = createLazyPage(() => import('@/pages/Monitoring'), 'Monitoring');
const SecurityAudit = createLazyPage(() => import('@/pages/SecurityAudit'), 'SecurityAudit');
const PerformanceMonitor = createLazyPage(() => import('@/pages/PerformanceMonitor'), 'PerformanceMonitor');
const LazyMap = createLazyPage(() => import('@/pages/Map'), 'Map');
const Help = createLazyPage(() => import('@/pages/Help'), 'Help');
const TermsOfService = createLazyPage(() => import('@/pages/TermsOfService'), 'TermsOfService');
const PrivacyPolicy = createLazyPage(() => import('@/pages/PrivacyPolicy'), 'PrivacyPolicy');
const RefundPolicy = createLazyPage(() => import('@/pages/RefundPolicy'), 'RefundPolicy');
const BillingSuccess = createLazyPage(() => import('@/pages/BillingSuccess'), 'BillingSuccess');
const BillingCanceled = createLazyPage(() => import('@/pages/BillingCanceled'), 'BillingCanceled');
const Settings = createLazyPage(() => import('@/pages/Settings'), 'Settings');
const PrivacySettings = createLazyPage(() => import('@/pages/PrivacySettings'), 'PrivacySettings');
const TranslationManager = createLazyPage(() => import('@/pages/admin/TranslationManager'), 'TranslationManager');
const MakeAdmin = createLazyPage(() => import('@/pages/MakeAdmin'), 'MakeAdmin');
const RBACTesting = createLazyPage(() => import('@/pages/admin/RBACTesting'), 'RBACTesting');
const FAQ = createLazyPage(() => import('@/pages/FAQ'), 'FAQ');
const ImplementationStatus = createLazyPage(() => import('@/pages/ImplementationStatus'), 'ImplementationStatus');

const LoadingFallback = () => {
  const [isStalled, setIsStalled] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsStalled(true), 10000); // 10 second timeout
    return () => clearTimeout(timer);
  }, []);

  if (isStalled) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-destructive mb-4">Page is taking longer than expected to load</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90"
          >
            Reload Page
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>
  );
};

export const AppRoutes: React.FC = React.memo(() => {
  const { loading: authLoading } = useAuth();
  const [showLoading, setShowLoading] = useState(true);
  const location = useLocation();

  const handleLoadingComplete = () => {
    setShowLoading(false);
  };

  // Only show loading on home page - memoized to prevent re-renders
  const isHomePage = useMemo(() => location.pathname === '/', [location.pathname]);
  const shouldShowLoading = isHomePage && showLoading;

  if (shouldShowLoading) {
    return (
      <LoadingIntroduction
        onComplete={handleLoadingComplete}
        minDisplayTime={2000}
      />
    );
  }

  return (
    <Suspense fallback={<LoadingFallback />}>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/auth/*" element={<AuthMain />} />
        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route path="/auth/confirm" element={<AuthConfirm />} />
        <Route path="/auth/reset-password" element={<AuthResetPassword />} />
        <Route path="/explore" element={<Explore />} />
        <Route path="/hybrid" element={<Hybrid />} />
        <Route path="/map" element={<LazyMap />} />
        <Route path="/search" element={<Search />} />
        <Route path="/submit" element={
          <ProtectedRoute requiresAuth>
            <Submit />
          </ProtectedRoute>
        } />
        <Route path="/profile/:id?" element={
          <ProtectedRoute requiresAuth>
            <Profile />
          </ProtectedRoute>
        } />
        <Route path="/fact/:id" element={<Fact />} />
        <Route path="/notifications" element={
          <ProtectedRoute requiresAuth>
            <Notifications />
          </ProtectedRoute>
        } />
        <Route path="/friends" element={
          <ProtectedRoute requiresAuth>
            <Friends />
          </ProtectedRoute>
        } />
        <Route path="/gamification" element={
          <ProtectedRoute requiresAuth>
            <Gamification />
          </ProtectedRoute>
        } />
        <Route path="/billing" element={
          <ProtectedRoute requiresAuth>
            <Billing />
          </ProtectedRoute>
        } />
        <Route path="/social" element={
          <ProtectedRoute requiresAuth>
            <Social />
          </ProtectedRoute>
        } />
        <Route path="/stories" element={<Stories />} />
        <Route path="/contributor" element={
          <ProtectedRoute contributorOnly>
            <ContributorEconomy />
          </ProtectedRoute>
        } />
        <Route path="/admin" element={
          <ProtectedRoute adminOnly>
            <Admin />
          </ProtectedRoute>
        } />
        <Route path="/monitoring" element={
          <ProtectedRoute adminOnly>
            <Monitoring />
          </ProtectedRoute>
        } />
        <Route path="/security-audit" element={
          <ProtectedRoute adminOnly>
            <SecurityAudit />
          </ProtectedRoute>
        } />
        <Route path="/performance" element={
          <ProtectedRoute adminOnly>
            <PerformanceMonitor />
          </ProtectedRoute>
        } />
        <Route path="/admin/translations" element={
          <ProtectedRoute adminOnly>
            <TranslationManager />
          </ProtectedRoute>
        } />
        <Route path="/make-admin" element={
          <ProtectedRoute requiresAuth>
            <MakeAdmin />
          </ProtectedRoute>
        } />
        <Route path="/rbac-testing" element={
          <ProtectedRoute adminOnly>
            <RBACTesting />
          </ProtectedRoute>
        } />
        <Route path="/help" element={<Help />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/terms-of-service" element={<TermsOfService />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/refund-policy" element={<RefundPolicy />} />
        <Route path="/refund" element={<RefundPolicy />} />
        <Route path="/billing/success" element={<BillingSuccess />} />
        <Route path="/billing/canceled" element={<BillingCanceled />} />
        <Route path="/settings" element={
          <ProtectedRoute requiresAuth>
            <Settings />
          </ProtectedRoute>
        } />
        <Route path="/privacy-settings" element={
          <ProtectedRoute requiresAuth>
            <PrivacySettings />
          </ProtectedRoute>
        } />
        <Route path="/support" element={<Support />} />
        <Route path="/content-guidelines" element={<ContentGuidelines />} />
        <Route path="/faq" element={<FAQ />} />
        <Route path="/implementation-status" element={<ImplementationStatus />} />
        {process.env.NODE_ENV === 'development' && (
          <>
            <Route path="/production-readiness" element={<ProductionReadiness />} />
            <Route path="/pre-deployment" element={<PreDeploymentDashboard />} />
            <Route path="/translation-test" element={<TranslationTest />} />
            <Route path="/showcase" element={<ComponentShowcase />} />
          </>
        )}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
});
