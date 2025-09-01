
import { lazy } from 'react';

// Lazy load pages
export const ExplorePageLazy = lazy(() => import('@/pages/Explore'));
export const SearchPageLazy = lazy(() => import('@/pages/Search'));
export const SubmitPageLazy = lazy(() => import('@/pages/Submit'));
export const ProfilePageLazy = lazy(() => import('@/pages/Profile'));
export const FactPageLazy = lazy(() => import('@/pages/Fact'));
export const AdminPageLazy = lazy(() => import('@/pages/Admin'));
export const DiscoverPageLazy = lazy(() => import('@/pages/Discover'));
export const DiscoveryPageLazy = lazy(() => import('@/pages/Discovery'));
export const GamificationPageLazy = lazy(() => import('@/pages/Gamification'));
export const MediaManagementPageLazy = lazy(() => import('@/pages/MediaManagement'));
export const BillingPageLazy = lazy(() => import('@/pages/Billing'));
export const SocialPageLazy = lazy(() => import('@/pages/Social'));
export const StoriesPageLazy = lazy(() => import('@/pages/Stories'));

// Export default discover for compatibility
export { DiscoverPageLazy as default };
