
import { lazy } from 'react';

// Lazy load pages
export const ExplorePageLazy = lazy(() => import('@/pages/Explore').then(module => ({ default: module.Explore })));
export const SearchPageLazy = lazy(() => import('@/pages/Search').then(module => ({ default: module.Search })));
export const SubmitPageLazy = lazy(() => import('@/pages/Submit').then(module => ({ default: module.Submit })));
export const ProfilePageLazy = lazy(() => import('@/pages/Profile').then(module => ({ default: module.Profile })));
export const FactPageLazy = lazy(() => import('@/pages/Fact').then(module => ({ default: module.Fact })));
export const AdminPageLazy = lazy(() => import('@/pages/Admin').then(module => ({ default: module.Admin })));
export const DiscoverPageLazy = lazy(() => import('@/pages/Discover').then(module => ({ default: module.Discover })));
export const DiscoveryPageLazy = lazy(() => import('@/pages/Discovery').then(module => ({ default: module.Discovery })));
export const GamificationPageLazy = lazy(() => import('@/pages/Gamification').then(module => ({ default: module.Gamification })));
export const MediaManagementPageLazy = lazy(() => import('@/pages/MediaManagement').then(module => ({ default: module.MediaManagement })));
export const BillingPageLazy = lazy(() => import('@/pages/Billing').then(module => ({ default: module.Billing })));

// Export default discover for compatibility
export { DiscoverPageLazy as default };
