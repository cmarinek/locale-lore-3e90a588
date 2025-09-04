import React, { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { useAdmin } from '@/hooks/useAdmin';
import { useAppStore } from '@/stores/appStore';
import { getMobileNavigationItems } from '@/config/navigation';
import type { UserRole } from '@/types/navigation';

export const BottomNavigation: React.FC = () => {
  const location = useLocation();
  const { user } = useAuth();
  const { isAdmin } = useAdmin();
  const { 
    triggerHapticFeedback,
    handleTouchInteraction,
    mobile
  } = useAppStore();

  // Determine user role
  const userRole: UserRole = user ? 'user' : 'guest';
  
  // Get mobile navigation items based on user role and admin status
  const navigationItems = getMobileNavigationItems(userRole, isAdmin);

  const isActive = (path: string) => {
    // Handle exact home path matching
    if (path === '/' && location.pathname === '/') return true;
    
    // Handle explore/discover path aliasing
    if (path === '/explore' && (location.pathname === '/explore' || location.pathname === '/discover')) return true;
    
    // Handle profile path matching with dynamic user ID
    if (path === '/profile' && location.pathname.startsWith('/profile')) return true;
    
    // Handle general path matching
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    
    return false;
  };

  // Adjust paths for dynamic content
  const getNavigationPath = (item: any) => {
    if (item.id === 'profile' && user) {
      return `/profile/${user.id}`;
    }
    if (item.id === 'create') {
      return '/submit'; // Map create to submit for consistency
    }
    return item.path;
  };

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
      <div className={cn(
        "grid h-16 px-1",
        navigationItems.length === 5 ? "grid-cols-5" : 
        navigationItems.length === 4 ? "grid-cols-4" : "grid-cols-3"
      )}>
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const navigationPath = getNavigationPath(item);
          const active = isActive(navigationPath);
          
          return (
            <Link
              key={item.id}
              to={navigationPath}
              onClick={handleTabClick}
              className={cn(
                "flex flex-col items-center justify-center gap-1 px-1 py-2",
                "transition-all duration-200 rounded-lg",
                "touch-manipulation tap-highlight-none",
                "hover-scale", // Apply hover scale animation
                active
                  ? "text-primary bg-primary/10 shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              )}
              onTouchStart={() => triggerHapticFeedback('light')}
              aria-label={`Navigate to ${item.label}`}
              title={item.description}
            >
              <Icon 
                className={cn(
                  "w-5 h-5 transition-all duration-200",
                  active && "scale-110 drop-shadow-sm"
                )} 
              />
              <span className={cn(
                "text-xs font-medium transition-all duration-200 leading-tight",
                "truncate max-w-full",
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