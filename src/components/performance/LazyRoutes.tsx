
import { lazy } from 'react';

// Lazy load pages for better performance
export const LazyExplore = lazy(() => import('@/pages/Explore'));
export const LazySearch = lazy(() => import('@/pages/Search'));
export const LazySubmit = lazy(() => import('@/pages/Submit'));
export const LazyProfile = lazy(() => import('@/pages/Profile'));
export const LazyFact = lazy(() => import('@/pages/Fact'));
export const LazyAdmin = lazy(() => import('@/pages/Admin').then(module => ({ default: module.Admin })));
export const LazyDiscover = lazy(() => import('@/pages/Discover'));
export const LazyGamification = lazy(() => import('@/pages/Gamification').then(module => ({ default: module.Gamification })));
export const LazyComponentShowcase = lazy(() => import('@/pages/ComponentShowcase').then(module => ({ default: module.ComponentShowcase })));
export const LazyLoreSubmit = lazy(() => import('@/pages/LoreSubmit').then(module => ({ default: module.LoreSubmit })));
export const LazyBilling = lazy(() => import('@/pages/Billing').then(module => ({ default: module.Billing })));
