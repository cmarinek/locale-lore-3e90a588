
import { lazy } from 'react';

// Lazy load components for better performance
export const LazyExplore = lazy(() => import('@/pages/Explore').then(module => ({ default: module.Explore })));
export const LazySearch = lazy(() => import('@/pages/Search').then(module => ({ default: module.Search })));
export const LazySubmit = lazy(() => import('@/pages/Submit').then(module => ({ default: module.Submit })));
export const LazyProfile = lazy(() => import('@/pages/Profile').then(module => ({ default: module.Profile })));
export const LazyFact = lazy(() => import('@/pages/Fact').then(module => ({ default: module.Fact })));
export const LazyDiscovery = lazy(() => import('@/pages/Discovery'));
export const LazyDiscover = lazy(() => import('@/pages/Discover'));
export const LazyComponentShowcase = lazy(() => import('@/pages/ComponentShowcase'));
export const LazyGamification = lazy(() => import('@/pages/Gamification'));
export const LazyMediaManagement = lazy(() => import('@/pages/MediaManagement'));
export const LazyBilling = lazy(() => import('@/pages/Billing').then(module => ({ default: module.Billing })));
export const LazySocial = lazy(() => import('@/pages/Social').then(module => ({ default: module.Social })));
export const LazyStories = lazy(() => import('@/pages/Stories'));
