import React, { Suspense, lazy, useState, useMemo } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthProvider';
import { LoadingIntroduction } from '@/components/ui/loading-introduction';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

// Eager load critical pages
import Index from '@/pages/Index';
import AuthMain from '@/pages/AuthMain';
import NotFound from '@/pages/NotFound';

// Lazy load secondary pages
const AuthCallback = lazy(() => import('@/pages/AuthCallback'));
const AuthConfirm = lazy(() => import('@/pages/AuthConfirm'));
const AuthResetPassword = lazy(() => import('@/pages/AuthResetPassword'));
const Explore = lazy(() => import('@/pages/Explore').then(m => ({ default: m.Explore })));

const Search = lazy(() => import('@/pages/Search').then(m => ({ default: m.Search })));
const Submit = lazy(() => import('@/pages/Submit').then(m => ({ default: m.Submit })));
const Profile = lazy(() => import('@/pages/Profile').then(m => ({ default: m.Profile })));
const Fact = lazy(() => import('@/pages/Fact').then(m => ({ default: m.Fact })));
const ComponentShowcase = lazy(() => import('@/pages/ComponentShowcase'));
const Gamification = lazy(() => import('@/pages/Gamification').then(m => ({ default: m.Gamification })));
const Hybrid = lazy(() => import('@/pages/Hybrid').then(m => ({ default: m.Hybrid })));
const MediaManagement = lazy(() => import('@/pages/MediaManagement'));
const Billing = lazy(() => import('@/pages/Billing').then(m => ({ default: m.Billing })));
const Social = lazy(() => import('@/pages/Social').then(m => ({ default: m.Social })));
const Stories = lazy(() => import('@/pages/Stories'));
const ContributorEconomy = lazy(() => import('@/pages/ContributorEconomy'));
const Admin = lazy(() => import('@/pages/Admin'));
const Privacy = lazy(() => import('@/pages/Privacy').then(m => ({ default: m.Privacy })));
const Terms = lazy(() => import('@/pages/Terms').then(m => ({ default: m.Terms })));
const ProductionReadiness = lazy(() => import('@/pages/ProductionReadiness').then(m => ({ default: m.ProductionReadiness })));
const PreDeploymentDashboard = lazy(() => import('@/pages/PreDeploymentDashboard').then(m => ({ default: m.PreDeploymentDashboard })));
const Support = lazy(() => import('@/pages/Support').then(m => ({ default: m.Support })));
const ContentGuidelines = lazy(() => import('@/pages/ContentGuidelines').then(m => ({ default: m.ContentGuidelines })));
const TranslationTest = lazy(() => import('@/pages/TranslationTest'));
const Monitoring = lazy(() => import('@/pages/Monitoring'));
const SecurityAudit = lazy(() => import('@/pages/SecurityAudit'));
const PerformanceMonitor = lazy(() => import('@/pages/PerformanceMonitor'));
const LazyMap = lazy(() => import('@/pages/Map'));
const Help = lazy(() => import('@/pages/Help'));
const TermsOfService = lazy(() => import('@/pages/TermsOfService'));
const PrivacyPolicy = lazy(() => import('@/pages/PrivacyPolicy'));
const RefundPolicy = lazy(() => import('@/pages/RefundPolicy'));
const BillingSuccess = lazy(() => import('@/pages/BillingSuccess').then(m => ({ default: m.BillingSuccess })));
const BillingCanceled = lazy(() => import('@/pages/BillingCanceled').then(m => ({ default: m.BillingCanceled })));
const Settings = lazy(() => import('@/pages/Settings'));
const PrivacySettings = lazy(() => import('@/pages/PrivacySettings'));
const TranslationManager = lazy(() => import('@/pages/admin/TranslationManager').then(m => ({ default: m.TranslationManager })));
const MakeAdmin = lazy(() => import('@/pages/MakeAdmin'));
const RBACTesting = lazy(() => import('@/pages/admin/RBACTesting'));

const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
  </div>
);

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