
import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { EnhancedSkeleton } from '@/components/ui/enhanced-skeleton';

// Lazy load route components for better performance
const LazyExplore = lazy(() => import('@/pages/Explore'));
const LazySearch = lazy(() => import('@/pages/Search'));
const LazySubmit = lazy(() => import('@/pages/Submit'));
const LazyProfile = lazy(() => import('@/pages/Profile'));
const LazyFact = lazy(() => import('@/pages/Fact'));
const LazyAdmin = lazy(() => import('@/pages/Admin'));
const LazyGamification = lazy(() => import('@/pages/Gamification'));
const LazyDiscover = lazy(() => import('@/pages/Discover'));
const LazyDiscovery = lazy(() => import('@/pages/Discovery'));
const LazyIndex = lazy(() => import('@/pages/Index'));
const LazyAuthMain = lazy(() => import('@/pages/AuthMain'));
const LazyAuthCallback = lazy(() => import('@/pages/AuthCallback'));
const LazyAuthConfirm = lazy(() => import('@/pages/AuthConfirm'));
const LazyAuthResetPassword = lazy(() => import('@/pages/AuthResetPassword'));
const LazyLoreSubmit = lazy(() => import('@/pages/LoreSubmit'));
const LazyNotFound = lazy(() => import('@/pages/NotFound'));
const LazyComponentShowcase = lazy(() => import('@/pages/ComponentShowcase'));

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
