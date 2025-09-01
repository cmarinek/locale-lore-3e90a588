
import { lazy } from 'react';

// Lazy load route components
const Explore = lazy(() => import('@/pages/Explore').then(m => ({ default: m.Explore })));
const Search = lazy(() => import('@/pages/Search').then(m => ({ default: m.Search })));
const Submit = lazy(() => import('@/pages/Submit').then(m => ({ default: m.Submit })));
const Profile = lazy(() => import('@/pages/Profile').then(m => ({ default: m.Profile })));
const Fact = lazy(() => import('@/pages/Fact').then(m => ({ default: m.Fact })));
const AdminDashboard = lazy(() => import('@/components/admin/AdminDashboard'));
const Discover = lazy(() => import('@/pages/Discover').then(m => ({ default: m.Discover })));
const Gamification = lazy(() => import('@/pages/Gamification'));

export {
  Explore,
  Search,
  Submit,
  Profile,
  Fact,
  AdminDashboard,
  Discover,
  Gamification
};
