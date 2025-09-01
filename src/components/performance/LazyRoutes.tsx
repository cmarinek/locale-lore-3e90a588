
import { lazy } from 'react';

// Lazy load components for better performance
export const LazyExplore = lazy(() => import('@/pages/Explore'));
export const LazySearch = lazy(() => import('@/pages/Search'));
export const LazySubmit = lazy(() => import('@/pages/Submit'));
export const LazyProfile = lazy(() => import('@/pages/Profile'));
export const LazyFact = lazy(() => import('@/pages/Fact'));
export const LazyAdmin = lazy(() => import('@/pages/Admin'));
export const LazyDiscover = lazy(() => import('@/pages/Discover'));
export const LazyGamification = lazy(() => import('@/pages/Gamification'));
export const LazyComponentShowcase = lazy(() => import('@/pages/ComponentShowcase'));
export const LazyLoreSubmit = lazy(() => import('@/pages/LoreSubmit'));
export const LazyBilling = lazy(() => import('@/pages/Billing'));

// Re-export direct components for compatibility
export { default as Discover } from '@/pages/Discover';
export { default as Gamification } from '@/pages/Gamification';
