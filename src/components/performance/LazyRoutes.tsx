
import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { EnhancedSkeleton } from '@/components/ui/enhanced-skeleton';

// Lazy load route components for better performance
// Handle both default and named exports
const LazyExplore = lazy(() => import('@/pages/Explore').then(module => ({ default: module.default || module })));
const LazySearch = lazy(() => import('@/pages/Search').then(module => ({ default: module.default || module })));
const LazySubmit = lazy(() => import('@/pages/Submit').then(module => ({ default: module.default || module })));
const LazyProfile = lazy(() => import('@/pages/Profile').then(module => ({ default: module.default || module })));
const LazyFact = lazy(() => import('@/pages/Fact').then(module => ({ default: module.default || module })));
const LazyAdmin = lazy(() => import('@/pages/Admin').then(module => ({ default: module.default || module })));
const LazyGamification = lazy(() => import('@/pages/Gamification').then(module => ({ default: module.default || module })));
const LazyDiscover = lazy(() => import('@/pages/Discover').then(module => ({ default: module.default || module })));
const LazyDiscovery = lazy(() => import('@/pages/Discovery').then(module => ({ default: module.default || module })));
const LazyIndex = lazy(() => import('@/pages/Index').then(module => ({ default: module.default || module })));
const LazyAuthMain = lazy(() => import('@/pages/AuthMain').then(module => ({ default: module.default || module })));
const LazyAuthCallback = lazy(() => import('@/pages/AuthCallback').then(module => ({ default: module.default || module })));
const LazyAuthConfirm = lazy(() => import('@/pages/AuthConfirm').then(module => ({ default: module.default || module })));
const LazyAuthResetPassword = lazy(() => import('@/pages/AuthResetPassword').then(module => ({ default: module.default || module })));
const LazyLoreSubmit = lazy(() => import('@/pages/LoreSubmit').then(module => ({ default: module.default || module })));
const LazyNotFound = lazy(() => import('@/pages/NotFound').then(module => ({ default: module.default || module })));
const LazyComponentShowcase = lazy(() => import('@/pages/ComponentShowcase').then(module => ({ default: module.default || module })));

const LoadingFallback = () => (
  <div className="min-h-screen p-6">
    <EnhancedSkeleton variant="card" lines={4} />
  </div>
);

export const LazyRoutes = () => {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <Routes>
        <Route path="/" element={<LazyIndex />} />
        <Route path="/explore" element={<LazyExplore />} />
        <Route path="/discover" element={<LazyDiscover />} />
        <Route path="/discovery" element={<LazyDiscovery />} />
        <Route path="/search" element={<LazySearch />} />
        <Route path="/submit" element={<LazySubmit />} />
        <Route path="/lore-submit" element={<LazyLoreSubmit />} />
        <Route path="/profile" element={<LazyProfile />} />
        <Route path="/fact/:id" element={<LazyFact />} />
        <Route path="/admin" element={<LazyAdmin />} />
        <Route path="/gamification" element={<LazyGamification />} />
        <Route path="/auth" element={<LazyAuthMain />} />
        <Route path="/auth/callback" element={<LazyAuthCallback />} />
        <Route path="/auth/confirm" element={<LazyAuthConfirm />} />
        <Route path="/auth/reset-password" element={<LazyAuthResetPassword />} />
        <Route path="/showcase" element={<LazyComponentShowcase />} />
        <Route path="*" element={<LazyNotFound />} />
      </Routes>
    </Suspense>
  );
};
