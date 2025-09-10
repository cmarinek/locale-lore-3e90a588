import { useMemo } from 'react';
import { NavigationItem, NavigationConfig, UserRole } from '@/types/navigation';
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
  return useMemo(() => {
    // Core navigation items that form the backbone of the app
    const CORE_NAVIGATION: NavigationItem[] = [
      {
        id: 'home',
        label: 'home',
        path: '/',
        icon: Home,
        category: 'primary'
      },
      {
        id: 'explore',
        label: 'explore',
        path: '/explore',
        icon: Compass,
        category: 'primary'
      },
      {
        id: 'search',
        label: 'search',
        path: '/search',
        icon: Search,
        category: 'primary'
      },
      {
        id: 'stories',
        label: 'stories',
        path: '/stories',
        icon: Camera,
        category: 'primary'
      }
    ];

    const USER_NAVIGATION: NavigationItem[] = [
      {
        id: 'submit',
        label: 'submit',
        path: '/submit',
        icon: Plus,
        requiresAuth: true,
        category: 'secondary'
      },
      {
        id: 'social',
        label: 'social',
        path: '/social',
        icon: Users,
        requiresAuth: true,
        category: 'secondary'
      }
    ];

    const UTILITY_NAVIGATION: NavigationItem[] = [
      {
        id: 'profile',
        label: 'profile',
        path: '/profile',
        icon: User,
        requiresAuth: true,
        category: 'utility'
      }
    ];

    const ADMIN_NAVIGATION: NavigationItem[] = [
      {
        id: 'admin',
        label: 'admin',
        path: '/admin',
        icon: Shield,
        requiresAuth: true,
        adminOnly: true,
        category: 'utility'
      }
    ];

    const MOBILE_PRIMARY_NAVIGATION: NavigationItem[] = [
      {
        id: 'home',
        label: 'home',
        path: '/',
        icon: Home,
        category: 'primary'
      },
      {
        id: 'explore',
        label: 'explore',
        path: '/explore',
        icon: Compass,
        category: 'primary'
      },
      {
        id: 'create',
        label: 'submit',
        path: '/submit',
        icon: Plus,
        requiresAuth: true,
        category: 'primary'
      },
      {
        id: 'profile',
        label: 'profile',
        path: '/profile',
        icon: User,
        category: 'primary'
      }
    ];

    const GUEST_NAVIGATION: NavigationItem[] = [
      {
        id: 'home',
        label: 'home',
        path: '/',
        icon: Home,
        category: 'primary'
      },
      {
        id: 'explore',
        label: 'explore',
        path: '/explore',
        icon: Compass,
        category: 'primary'
      },
      {
        id: 'stories',
        label: 'stories',
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
  }, []);
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