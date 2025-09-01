
import { lazy } from 'react';

// Lazy load pages - these pages use named exports, so we need to wrap them
export const LazyExplore = lazy(() => import('@/pages/Explore').then(module => ({ default: module.Explore || module.default })));
export const LazySearch = lazy(() => import('@/pages/Search').then(module => ({ default: module.Search || module.default })));
export const LazySubmit = lazy(() => import('@/pages/Submit').then(module => ({ default: module.Submit || module.default })));
export const LazyProfile = lazy(() => import('@/pages/Profile').then(module => ({ default: module.Profile || module.default })));
export const LazyFact = lazy(() => import('@/pages/Fact').then(module => ({ default: module.Fact || module.default })));
export const LazyAdmin = lazy(() => import('@/pages/Admin').then(module => ({ default: module.Admin || module.default })));
export const LazyDiscover = lazy(() => import('@/pages/Discover').then(module => ({ default: module.Discover || module.default })));
export const LazyGamification = lazy(() => import('@/pages/Gamification').then(module => ({ default: module.Gamification || module.default })));
export const LazyComponentShowcase = lazy(() => import('@/pages/ComponentShowcase').then(module => ({ default: module.ComponentShowcase || module.default })));
export const LazyLoreSubmit = lazy(() => import('@/pages/LoreSubmit').then(module => ({ default: module.LoreSubmit || module.default })));
