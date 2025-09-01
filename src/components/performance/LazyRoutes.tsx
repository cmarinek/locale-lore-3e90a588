
import { lazy } from 'react';

// Lazy load components for better performance
export const LazyExplore = lazy(() => import('@/pages/Explore').then(module => ({ default: module.Explore })));
export const LazySearch = lazy(() => import('@/pages/Search').then(module => ({ default: module.Search })));
export const LazySubmit = lazy(() => import('@/pages/Submit').then(module => ({ default: module.Submit })));
export const LazyProfile = lazy(() => import('@/pages/Profile').then(module => ({ default: module.Profile })));
export const LazyFact = lazy(() => import('@/pages/Fact').then(module => ({ default: module.Fact })));
export const LazyDiscovery = lazy(() => import('@/pages/Discovery').then(module => ({ default: module.Discovery })));
export const LazyDiscover = lazy(() => import('@/pages/Discover').then(module => ({ default: module.Discover })));
export const LazyComponentShowcase = lazy(() => import('@/pages/ComponentShowcase').then(module => ({ default: module.ComponentShowcase })));
export const LazyGamification = lazy(() => import('@/pages/Gamification').then(module => ({ default: module.Gamification })));
export const LazyMediaManagement = lazy(() => import('@/pages/MediaManagement').then(module => ({ default: module.MediaManagement })));
export const LazyBilling = lazy(() => import('@/pages/Billing').then(module => ({ default: module.Billing })));
export const LazySocial = lazy(() => import('@/pages/Social').then(module => ({ default: module.Social })));
export const LazyStories = lazy(() => import('@/pages/Stories'));
