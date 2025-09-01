
import React, { Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Skeleton } from '@/components/ui/skeleton';
import { preloadRoute } from '@/utils/performance';

// Lazy load route components with preloading
const Discovery = React.lazy(() => {
  const importPromise = import('@/pages/Discovery');
  preloadRoute(() => importPromise);
  return importPromise;
});

const Explore = React.lazy(() => import('@/pages/Explore').then(module => ({ default: module.default })));
const Search = React.lazy(() => import('@/pages/Search').then(module => ({ default: module.default })));
const Submit = React.lazy(() => import('@/pages/Submit').then(module => ({ default: module.default })));
const Profile = React.lazy(() => import('@/pages/Profile').then(module => ({ default: module.default })));
const Fact = React.lazy(() => import('@/pages/Fact').then(module => ({ default: module.default })));
const Gamification = React.lazy(() => import('@/pages/Gamification'));
const Admin = React.lazy(() => import('@/pages/Admin'));
const AuthMain = React.lazy(() => import('@/pages/AuthMain'));
const AuthCallback = React.lazy(() => import('@/pages/AuthCallback'));
const AuthConfirm = React.lazy(() => import('@/pages/AuthConfirm'));
const AuthResetPassword = React.lazy(() => import('@/pages/AuthResetPassword'));
const ComponentShowcase = React.lazy(() => import('@/pages/ComponentShowcase'));
const NotFound = React.lazy(() => import('@/pages/NotFound'));

// Loading component with skeleton
const RouteLoadingSkeleton = () => (
  <div className="min-h-screen p-4 space-y-6">
    <div className="space-y-3">
      <Skeleton className="h-8 w-1/3" />
      <Skeleton className="h-4 w-2/3" />
    </div>
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="space-y-3">
          <Skeleton className="h-48 w-full rounded-lg" />
          <div className="space-y-2 p-4">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
            <Skeleton className="h-3 w-full" />
          </div>
        </div>
      ))}
    </div>
  </div>
);

export const LazyRoutes: React.FC = () => {
  return (
    <Suspense fallback={<RouteLoadingSkeleton />}>
      <Routes>
        <Route path="/" element={<Discovery />} />
        <Route path="/auth" element={<AuthMain />} />
        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route path="/auth/confirm" element={<AuthConfirm />} />
        <Route path="/auth/reset-password" element={<AuthResetPassword />} />
        <Route path="/components" element={<ComponentShowcase />} />
        <Route path="/discover" element={<Discovery />} />
        <Route path="/explore" element={<Explore />} />
        <Route path="/search" element={<Search />} />
        <Route path="/submit" element={<Submit />} />
        <Route path="/fact/:id" element={<Fact />} />
        <Route path="/profile/:id?" element={<Profile />} />
        <Route path="/gamification" element={<Gamification />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
};
