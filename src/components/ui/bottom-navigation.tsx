import React, { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, 
  Compass, 
  Search, 
  Plus, 
  User,
  Trophy,
  Crown,
  Users,
  Camera,
  Shield
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { useAdmin } from '@/hooks/useAdmin';
import { useAppStore } from '@/stores/appStore';

export const BottomNavigation: React.FC = () => {
  const location = useLocation();
  const { user } = useAuth();
  const { isAdmin } = useAdmin();
  const { 
    triggerHapticFeedback,
    handleTouchInteraction,
    mobile
  } = useAppStore();

  const isActive = (path: string) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path === '/explore' && (location.pathname === '/explore' || location.pathname === '/discover')) return true;
    return location.pathname.startsWith(path);
  };

  // Core navigation items - always visible
  const coreNavItems = [
    { path: '/', icon: Home, label: 'Home' },
    { path: '/explore', icon: Compass, label: 'Explore' },
    { path: '/search', icon: Search, label: 'Search' },
    { path: '/stories', icon: Camera, label: 'Stories' },
  ];

  // User-specific items
  const userNavItems = user ? [
    { path: '/submit', icon: Plus, label: 'Submit' },
  ] : [];

  // Profile/Auth item
  const profileItem = user ? [
    { path: `/profile/${user.id}`, icon: User, label: 'Profile' }
  ] : [
    { path: '/auth', icon: User, label: 'Login' }
  ];

  // Combine all navigation items (max 5 for clean mobile layout)
  const allNavItems = [...coreNavItems, ...userNavItems].slice(0, 4).concat(profileItem);

  const handleTabClick = () => {
    handleTouchInteraction('tap');
  };

  // Handle safe area insets for iPhone X+ devices
  useEffect(() => {
    const updateSafeArea = () => {
      const style = getComputedStyle(document.documentElement);
      const insets = {
        top: parseInt(style.getPropertyValue('--safe-area-inset-top') || '0'),
        bottom: parseInt(style.getPropertyValue('--safe-area-inset-bottom') || '0'),
        left: parseInt(style.getPropertyValue('--safe-area-inset-left') || '0'),
        right: parseInt(style.getPropertyValue('--safe-area-inset-right') || '0'),
      };
      useAppStore.getState().setSafeAreaInsets(insets);
    };

    updateSafeArea();
    window.addEventListener('resize', updateSafeArea);
    return () => window.removeEventListener('resize', updateSafeArea);
  }, []);

  return (
    <nav 
      className={cn(
        "fixed bottom-0 left-0 right-0 z-50 md:hidden",
        "border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60",
        "safe-area-padding-bottom"
      )}
      style={{
        paddingBottom: `max(env(safe-area-inset-bottom), ${mobile?.safeAreaInsets?.bottom || 0}px)`,
      }}
    >
      <div className="grid grid-cols-5 h-16 px-1">
        {allNavItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={handleTabClick}
              className={cn(
                "flex flex-col items-center justify-center gap-1 px-1 py-2",
                "transition-all duration-200 rounded-lg",
                "touch-manipulation tap-highlight-none",
                active
                  ? "text-primary bg-primary/10"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              )}
              onTouchStart={() => triggerHapticFeedback('light')}
            >
              <Icon 
                className={cn(
                  "w-5 h-5 transition-all duration-200",
                  active && "scale-110"
                )} 
              />
              <span className={cn(
                "text-xs font-medium transition-all duration-200 leading-tight",
                active && "font-semibold"
              )}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};