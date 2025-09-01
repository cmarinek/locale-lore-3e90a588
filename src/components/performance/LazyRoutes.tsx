
import { lazy } from 'react';

// Lazy load route components with proper default export handling
const LazyExplore = lazy(() => import('@/pages/Explore').then(module => ({ default: module.default || module.Explore || module })));
const LazySearch = lazy(() => import('@/pages/Search').then(module => ({ default: module.default || module.Search || module })));
const LazySubmit = lazy(() => import('@/pages/Submit').then(module => ({ default: module.default || module.Submit || module })));
const LazyProfile = lazy(() => import('@/pages/Profile').then(module => ({ default: module.default || module.Profile || module })));
const LazyFact = lazy(() => import('@/pages/Fact').then(module => ({ default: module.default || module.Fact || module })));
const LazyAdmin = lazy(() => import('@/pages/Admin').then(module => ({ default: module.default || module.Admin || module })));
const LazyDiscover = lazy(() => import('@/pages/Discover').then(module => ({ default: module.default || module.Discover || module })));
const LazyGamification = lazy(() => import('@/pages/Gamification').then(module => ({ default: module.default || module.Gamification || module })));

export const LazyRoutes = {
  Explore: LazyExplore,
  Search: LazySearch,
  Submit: LazySubmit,
  Profile: LazyProfile,
  Fact: LazyFact,
  Admin: LazyAdmin,
  Discover: LazyDiscover,
  Gamification: LazyGamification,
};
