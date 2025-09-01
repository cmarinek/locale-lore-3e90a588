
import { lazy } from 'react';

// Lazy load pages - handle the actual export patterns from the pages
export const LazyExplore = lazy(() => import('@/pages/Explore'));
export const LazySearch = lazy(() => import('@/pages/Search'));
export const LazySubmit = lazy(() => import('@/pages/Submit'));
export const LazyProfile = lazy(() => import('@/pages/Profile').then(module => ({ default: module.Profile || module.default })));
export const LazyFact = lazy(() => import('@/pages/Fact'));
export const LazyAdmin = lazy(() => import('@/pages/Admin'));
export const LazyDiscover = lazy(() => import('@/pages/Discover').then(module => ({ default: module.default || module.Discovery })));
export const LazyGamification = lazy(() => import('@/pages/Gamification'));
export const LazyComponentShowcase = lazy(() => import('@/pages/ComponentShowcase'));
export const LazyLoreSubmit = lazy(() => import('@/pages/LoreSubmit'));
