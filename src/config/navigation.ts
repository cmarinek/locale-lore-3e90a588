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
  Star
} from 'lucide-react';
import { NavigationItem, NavigationConfig, UserRole } from '@/types/navigation';

// Core navigation items that form the backbone of the app - v15
function getCoreNavigation(): NavigationItem[] {
  return [
  {
    id: 'home',
    label: 'Home',
    path: '/',
    icon: Home,
    description: 'Discover amazing local stories',
    category: 'primary'
  },
  {
    id: 'explore',
    label: 'Explore',
    path: '/explore',
    icon: Compass,
    description: 'Browse stories by location',
    category: 'primary'
  },
  {
    id: 'search',
    label: 'Search',
    path: '/search',
    icon: Search,
    description: 'Find specific stories',
    category: 'primary'
  },
  {
    id: 'stories',
    label: 'Stories',
    path: '/stories',
    icon: Camera,
    description: 'View and create stories',
    category: 'primary' // Remove requiresAuth - everyone can view stories
  }
  ];
}

// Secondary features available to authenticated users - v15
function getUserNavigation(): NavigationItem[] {
  return [
  {
    id: 'submit',
    label: 'Submit',
    path: '/submit',
    icon: Plus,
    description: 'Share your discoveries',
    requiresAuth: true,
    category: 'secondary'
  },
  {
    id: 'social',
    label: 'Social',
    path: '/social',
    icon: Users,
    description: 'Connect with community',
    requiresAuth: true,
    category: 'secondary'
  },
  {
    id: 'gamification',
    label: 'Challenges',
    path: '/gamification',
    icon: Trophy,
    description: 'Earn points and badges',
    requiresAuth: true,
    category: 'secondary'
  }
  ];
}

// Utility and account-related navigation - v15
function getUtilityNavigation(): NavigationItem[] {
  return [
  {
    id: 'profile',
    label: 'Profile',
    path: '/profile',
    icon: User,
    description: 'Manage your account',
    requiresAuth: true,
    category: 'utility'
  },
  {
    id: 'billing',
    label: 'Billing',
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
}

// Admin-only navigation - v15
function getAdminNavigation(): NavigationItem[] {
  return [
  {
    id: 'admin',
    label: 'Admin',
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
}

// Mobile-optimized navigation (bottom nav) - v15
function getMobilePrimaryNavigation(): NavigationItem[] {
  return [
  {
    id: 'home',
    label: 'Home',
    path: '/',
    icon: Home,
    category: 'primary'
  },
  {
    id: 'explore',
    label: 'Explore',
    path: '/explore',
    icon: Compass,
    category: 'primary'
  },
  {
    id: 'create',
    label: 'Create',
    path: '/submit',
    icon: Plus,
    requiresAuth: true,
    category: 'primary'
  },
  {
    id: 'stories',
    label: 'Stories',
    path: '/stories',
    icon: Camera,
    category: 'primary' // Remove requiresAuth - everyone can view stories
  },
  {
    id: 'profile',
    label: 'Profile',
    path: '/profile',
    icon: User,
    category: 'primary'
  }
  ];
}

// Guest user navigation (not authenticated) - v15
function getGuestNavigation(): NavigationItem[] {
  return [
  {
    id: 'home',
    label: 'Home',
    path: '/',
    icon: Home,
    category: 'primary'
  },
  {
    id: 'explore',
    label: 'Explore',
    path: '/explore',
    icon: Compass,
    category: 'primary'
  },
  {
    id: 'stories',
    label: 'Stories',
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
}

// Function to get navigation items based on user role and context
export function getNavigationItems(userRole: UserRole, isAdmin: boolean = false): NavigationConfig {
  const isGuest = userRole === 'guest';
  const guestNavigation = getGuestNavigation();
  
  if (isGuest) {
    return {
      primary: guestNavigation,
      secondary: [],
      utility: [],
      mobile: guestNavigation.slice(0, 4), // Limit mobile nav items
      desktop: guestNavigation
    };
  }

  const coreNavigation = getCoreNavigation();
  const userNavigation = getUserNavigation();
  const utilityNavigation = getUtilityNavigation();
  const adminItems = isAdmin ? getAdminNavigation() : [];
  const mobileNavigation = getMobilePrimaryNavigation();
  
  return {
    primary: coreNavigation,
    secondary: userNavigation,
    utility: [...utilityNavigation, ...adminItems],
    mobile: mobileNavigation,
    desktop: [...coreNavigation, ...userNavigation, ...utilityNavigation, ...adminItems]
  };
}

// Function to check if a navigation item should be visible
export function isNavigationItemVisible(
  item: NavigationItem, 
  userRole: UserRole, 
  isAdmin: boolean = false
): boolean {
  // Check authentication requirements
  if (item.requiresAuth && userRole === 'guest') {
    return false;
  }
  
  // Check admin requirements
  if (item.adminOnly && !isAdmin) {
    return false;
  }
  
  return true;
}

// Function to get the appropriate navigation items for mobile bottom nav
export function getMobileNavigationItems(userRole: UserRole, isAdmin: boolean = false): NavigationItem[] {
  const config = getNavigationItems(userRole, isAdmin);
  return config.mobile.filter(item => isNavigationItemVisible(item, userRole, isAdmin));
}