import React, { Suspense, lazy, useState } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthProvider';
import { LoadingIntroduction } from '@/components/ui/loading-introduction';

// Eager load critical pages
import Index from '@/pages/Index';
import AuthMain from '@/pages/AuthMain';
import NotFound from '@/pages/NotFound';

// Lazy load secondary pages
const AuthCallback = lazy(() => import('@/pages/AuthCallback'));
const AuthConfirm = lazy(() => import('@/pages/AuthConfirm'));
const AuthResetPassword = lazy(() => import('@/pages/AuthResetPassword'));
const Explore = lazy(() => import('@/pages/Explore').then(m => ({ default: m.Explore })));
const Hybrid = lazy(() => import('@/pages/Hybrid').then(m => ({ default: m.Hybrid })));
const Search = lazy(() => import('@/pages/Search').then(m => ({ default: m.Search })));
const Submit = lazy(() => import('@/pages/Submit').then(m => ({ default: m.Submit })));
const Profile = lazy(() => import('@/pages/Profile').then(m => ({ default: m.Profile })));
const Fact = lazy(() => import('@/pages/Fact').then(m => ({ default: m.Fact })));
const ComponentShowcase = lazy(() => import('@/pages/ComponentShowcase'));
const Gamification = lazy(() => import('@/pages/Gamification').then(m => ({ default: m.Gamification })));
const MediaManagement = lazy(() => import('@/pages/MediaManagement'));
const Billing = lazy(() => import('@/pages/Billing').then(m => ({ default: m.Billing })));
const Social = lazy(() => import('@/pages/Social').then(m => ({ default: m.Social })));
const Stories = lazy(() => import('@/pages/Stories'));
const ContributorEconomy = lazy(() => import('@/pages/ContributorEconomy'));
const Admin = lazy(() => import('@/pages/Admin'));
const Privacy = lazy(() => import('@/pages/Privacy').then(m => ({ default: m.Privacy })));
const Terms = lazy(() => import('@/pages/Terms').then(m => ({ default: m.Terms })));
const ProductionReadiness = lazy(() => import('@/pages/ProductionReadiness').then(m => ({ default: m.ProductionReadiness })));
const Support = lazy(() => import('@/pages/Support').then(m => ({ default: m.Support })));
const ContentGuidelines = lazy(() => import('@/pages/ContentGuidelines').then(m => ({ default: m.ContentGuidelines })));
const TranslationTest = lazy(() => import('@/pages/TranslationTest'));
const LazyMap = lazy(() => import('@/pages/Map'));

const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
  </div>
);

export const AppRoutes: React.FC = () => {
  const { loading: authLoading } = useAuth();
  const [showLoading, setShowLoading] = useState(true);
  const location = useLocation();

  const handleLoadingComplete = () => {
    setShowLoading(false);
  };

  // Only show loading on home page
  const isHomePage = location.pathname === '/';
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
    </Suspense>
  );
};