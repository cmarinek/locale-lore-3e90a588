

import { lazy } from 'react';

// Lazy load pages - handle both default and named exports dynamically
export const LazyExplore = lazy(() => import('@/pages/Explore').then(module => ({ default: module.default || module.Explore || Object.values(module)[0] })));
export const LazySearch = lazy(() => import('@/pages/Search').then(module => ({ default: module.default || module.Search || Object.values(module)[0] })));
export const LazySubmit = lazy(() => import('@/pages/Submit').then(module => ({ default: module.default || module.Submit || Object.values(module)[0] })));
export const LazyProfile = lazy(() => import('@/pages/Profile').then(module => ({ default: module.default || module.Profile || Object.values(module)[0] })));
export const LazyFact = lazy(() => import('@/pages/Fact').then(module => ({ default: module.default || module.Fact || Object.values(module)[0] })));
export const LazyAdmin = lazy(() => import('@/pages/Admin').then(module => ({ default: module.default || module.Admin || Object.values(module)[0] })));
export const LazyDiscover = lazy(() => import('@/pages/Discover').then(module => ({ default: module.default || module.Discover || Object.values(module)[0] })));
export const LazyGamification = lazy(() => import('@/pages/Gamification').then(module => ({ default: module.default || module.Gamification || Object.values(module)[0] })));
export const LazyComponentShowcase = lazy(() => import('@/pages/ComponentShowcase').then(module => ({ default: module.default || module.ComponentShowcase || Object.values(module)[0] })));
export const LazyLoreSubmit = lazy(() => import('@/pages/LoreSubmit').then(module => ({ default: module.default || module.LoreSubmit || Object.values(module)[0] })));

