
import { lazy } from 'react';

// Create lazy-loaded components with proper default exports
export const LazyRoutes = {
  Explore: lazy(() => import('@/pages/Explore').then(module => ({ default: module.default }))),
  Search: lazy(() => import('@/pages/Search').then(module => ({ default: module.default }))),
  Submit: lazy(() => import('@/pages/Submit').then(module => ({ default: module.default }))),
  Profile: lazy(() => import('@/pages/Profile').then(module => ({ default: module.default }))),
  Fact: lazy(() => import('@/pages/Fact').then(module => ({ default: module.default }))),
  Admin: lazy(() => import('@/pages/Admin').then(module => ({ default: module.default }))),
  Discover: lazy(() => import('@/pages/Discover').then(module => ({ default: module.default }))),
  Gamification: lazy(() => import('@/pages/Gamification').then(module => ({ default: module.default }))),
  ComponentShowcase: lazy(() => import('@/pages/ComponentShowcase').then(module => ({ default: module.default }))),
  LoreSubmit: lazy(() => import('@/pages/LoreSubmit').then(module => ({ default: module.default }))),
};
