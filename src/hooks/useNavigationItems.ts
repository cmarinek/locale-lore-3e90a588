import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { NavigationItem, NavigationConfig, UserRole } from '@/types/navigation';
import { useUserRole } from '@/hooks/useUserRole';
import { 
  Home, 
  Compass, 
  Search, 
  Plus, 
  User,
  Camera,
  Users,
  Trophy,
  Crown,
  Shield,
  Settings,
  Wallet,
  FileText,
  Share2,
  BarChart3,
  Star,
  MapPin
} from 'lucide-react';

export function useNavigationItems() {
  const { t } = useTranslation('navigation');

  return useMemo(() => {
    // Core navigation items that form the backbone of the app
    const CORE_NAVIGATION: NavigationItem[] = [
      {
        id: 'home',
        label: t('home'),
        path: '/',
        icon: Home,
        description: 'Discover amazing local stories',
        category: 'primary'
      },
      {
        id: 'explore',
        label: t('explore'),
        path: '/explore',
        icon: Compass,
        description: 'Browse stories by location',
        category: 'primary'
      },
      {
        id: 'map',
        label: 'Map',
        path: '/map',
        icon: MapPin,
        description: 'Explore stories on interactive map',
        category: 'primary'
      },
      {
        id: 'search',
        label: t('search'),
        path: '/search',
        icon: Search,
        description: 'Find specific stories',
        category: 'primary'
      },
      {
        id: 'stories',
        label: t('stories'),
        path: '/stories',
        icon: Camera,
        description: 'View and create stories',
        category: 'primary'
      }
    ];

    // Secondary features available to authenticated users
    const USER_NAVIGATION: NavigationItem[] = [
      {
        id: 'submit',
        label: t('submit'),
        path: '/submit',
        icon: Plus,
        description: 'Share your discoveries',
        requiresAuth: true,
        category: 'secondary'
      },
      {
        id: 'social',
        label: t('social'),
        path: '/social',
        icon: Users,
        description: 'Connect with community',
        requiresAuth: true,
        category: 'secondary'
      },
      {
        id: 'gamification',
        label: t('gamification'),
        path: '/gamification',
        icon: Trophy,
        description: 'Earn points and badges',
        requiresAuth: true,
        category: 'secondary'
      }
    ];

    // Utility and account-related navigation
    const UTILITY_NAVIGATION: NavigationItem[] = [
      {
        id: 'profile',
        label: t('profile'),
        path: '/profile',
        icon: User,
        description: 'Manage your account',
        requiresAuth: true,
        category: 'utility'
      },
      {
        id: 'billing',
        label: t('billing'),
        path: '/billing',
        icon: Wallet,
        description: 'Subscription and payments',
        requiresAuth: true,
        category: 'utility'
      },
      {
        id: 'contributor',
        label: 'Earn',
        path: '/contributor',
        icon: Crown,
        description: 'Contributor features',
        requiresAuth: true,
        category: 'utility'
      }
    ];

    // Admin-only navigation
    const ADMIN_NAVIGATION: NavigationItem[] = [
      {
        id: 'admin',
        label: t('admin'),
        path: '/admin',
        icon: Shield,
        description: 'Admin dashboard',
        requiresAuth: true,
        adminOnly: true,
        category: 'utility'
      },
      {
        id: 'media',
        label: 'Media',
        path: '/media',
        icon: FileText,
        description: 'Media management',
        requiresAuth: true,
        adminOnly: true,
        category: 'utility'
      }
    ];

    // Mobile-optimized navigation (bottom nav)
    const MOBILE_PRIMARY_NAVIGATION: NavigationItem[] = [
      {
        id: 'home',
        label: t('home'),
        path: '/',
        icon: Home,
        category: 'primary'
      },
      {
        id: 'map',
        label: 'Map',
        path: '/map',
        icon: MapPin,
        description: 'Explore stories on map',
        category: 'primary'
      },
      {
        id: 'stories',
        label: t('stories'),
        path: '/stories',
        icon: Camera,
        category: 'primary'
      },
      {
        id: 'create',
        label: t('submit'),
        path: '/submit',
        icon: Plus,
        requiresAuth: true,
        category: 'primary'
      },
      {
        id: 'profile',
        label: t('profile'),
        path: '/profile',
        icon: User,
        requiresAuth: true,
        category: 'primary'
      }
    ];

    // Guest user navigation (not authenticated)
    const GUEST_NAVIGATION: NavigationItem[] = [
      {
        id: 'home',
        label: t('home'),
        path: '/',
        icon: Home,
        category: 'primary'
      },
      {
        id: 'map',
        label: 'Map',
        path: '/map',
        icon: MapPin,
        description: 'Explore stories on map',
        category: 'primary'
      },
      {
        id: 'stories',
        label: t('stories'),
        path: '/stories',
        icon: Camera,
        category: 'primary'
      },
      {
        id: 'login',
        label: 'Login',
        path: '/auth',
        icon: User,
        category: 'primary'
      }
    ];

    return {
      CORE_NAVIGATION,
      USER_NAVIGATION,
      UTILITY_NAVIGATION,
      ADMIN_NAVIGATION,
      MOBILE_PRIMARY_NAVIGATION,
      GUEST_NAVIGATION
    };
  }, [t]);
}

// Function to get navigation items based on user role and context
export function useNavigationConfig(userRole: UserRole, isAdmin: boolean = false): NavigationConfig {
  const navigationItems = useNavigationItems();
  
  return useMemo(() => {
    const isGuest = userRole === 'guest';
    
    if (isGuest) {
      return {
        primary: navigationItems.GUEST_NAVIGATION,
        secondary: [],
        utility: [],
        mobile: navigationItems.GUEST_NAVIGATION.slice(0, 4),
        desktop: navigationItems.GUEST_NAVIGATION
      };
    }

    const adminItems = isAdmin ? navigationItems.ADMIN_NAVIGATION : [];
    
    return {
      primary: navigationItems.CORE_NAVIGATION,
      secondary: navigationItems.USER_NAVIGATION,
      utility: [...navigationItems.UTILITY_NAVIGATION, ...adminItems],
      mobile: navigationItems.MOBILE_PRIMARY_NAVIGATION,
      desktop: [...navigationItems.CORE_NAVIGATION, ...navigationItems.USER_NAVIGATION, ...navigationItems.UTILITY_NAVIGATION, ...adminItems]
    };
  }, [navigationItems, userRole, isAdmin]);
}

// Function to check if a navigation item should be visible
export function isNavigationItemVisible(
  item: NavigationItem, 
  userRole: UserRole, 
  isAdmin: boolean = false
): boolean {
  if (item.requiresAuth && userRole === 'guest') {
    return false;
  }
  
  if (item.adminOnly && !isAdmin) {
    return false;
  }
  
  return true;
}

// Function to get the appropriate navigation items for mobile bottom nav
export function useMobileNavigationItems(userRole: UserRole, isAdmin: boolean = false): NavigationItem[] {
  const config = useNavigationConfig(userRole, isAdmin);
  return config.mobile.filter(item => isNavigationItemVisible(item, userRole, isAdmin));
}

// Enhanced hook that uses current user role
export function useNavigationWithRole() {
  const { role, isAdmin, loading } = useUserRole();
  const { t } = useTranslation('navigation');

  const navigationConfig = useNavigationConfig(role, isAdmin);
  const mobileItems = useMobileNavigationItems(role, isAdmin);

  const isItemVisible = useMemo(() => {
    return (item: NavigationItem) => {
      if (loading) return false;
      return isNavigationItemVisible(item, role, isAdmin);
    };
  }, [role, isAdmin, loading]);

  return {
    ...navigationConfig,
    mobileItems,
    isItemVisible,
    userRole: role,
    isAdmin,
    loading
  };
}