
import { lazy } from 'react';

// Lazy load pages with proper default exports
export const LazyExplore = lazy(() => import('@/pages/Explore').then(module => ({ default: module.Explore })));
export const LazySearch = lazy(() => import('@/pages/Search').then(module => ({ default: module.Search })));
export const LazySubmit = lazy(() => import('@/pages/Submit').then(module => ({ default: module.Submit })));
export const LazyProfile = lazy(() => import('@/pages/Profile').then(module => ({ default: module.Profile })));
export const LazyFact = lazy(() => import('@/pages/Fact').then(module => ({ default: module.Fact })));
export const LazyAdmin = lazy(() => import('@/pages/Admin').then(module => ({ default: module.Admin })));
export const LazyDiscover = lazy(() => import('@/pages/Discover').then(module => ({ default: module.Discover })));
export const LazyGamification = lazy(() => import('@/pages/Gamification').then(module => ({ default: module.Gamification })));
export const LazyComponentShowcase = lazy(() => import('@/pages/ComponentShowcase').then(module => ({ default: module.ComponentShowcase })));
