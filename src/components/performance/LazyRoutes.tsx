
import { lazy } from 'react';

// Create lazy-loaded components with proper fallback handling
export const LazyRoutes = {
  Explore: lazy(() => import('@/pages/Explore')),
  Search: lazy(() => import('@/pages/Search')),
  Submit: lazy(() => import('@/pages/Submit')),
  Profile: lazy(() => import('@/pages/Profile')),
  Fact: lazy(() => import('@/pages/Fact')),
  Admin: lazy(() => import('@/pages/Admin')),
  Discover: lazy(() => import('@/pages/Discover')),
  Gamification: lazy(() => import('@/pages/Gamification')),
  ComponentShowcase: lazy(() => import('@/pages/ComponentShowcase')),
  LoreSubmit: lazy(() => import('@/pages/LoreSubmit')),
};
