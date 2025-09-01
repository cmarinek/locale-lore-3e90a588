
import { lazy } from 'react';

// Lazy load page components
export const LazyExplore = lazy(() => import('@/pages/Explore').then(module => ({ default: module.default })));
export const LazySearch = lazy(() => import('@/pages/Search').then(module => ({ default: module.default })));
export const LazySubmit = lazy(() => import('@/pages/Submit').then(module => ({ default: module.default })));
export const LazyProfile = lazy(() => import('@/pages/Profile').then(module => ({ default: module.default })));
export const LazyFact = lazy(() => import('@/pages/Fact').then(module => ({ default: module.default })));
export const LazyAdmin = lazy(() => import('@/pages/Admin').then(module => ({ default: module.default })));
export const LazyDiscover = lazy(() => import('@/pages/Discover').then(module => ({ default: module.default })));
export const LazyGamification = lazy(() => import('@/pages/Gamification').then(module => ({ default: module.default })));
export const LazyComponentShowcase = lazy(() => import('@/pages/ComponentShowcase').then(module => ({ default: module.default })));
export const LazyLoreSubmit = lazy(() => import('@/pages/LoreSubmit').then(module => ({ default: module.default })));
export const LazyBilling = lazy(() => import('@/pages/Billing').then(module => ({ default: module.Billing })));
