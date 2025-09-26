import React, { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useAuthSafe } from '@/contexts/AuthProvider';
import { useAdmin } from '@/hooks/useAdmin';
import { useAppStore } from '@/stores/appStore';
import { useMobileNavigationItems } from '@/hooks/useNavigationItems';
import type { UserRole } from '@/types/navigation';

export const BottomNavigation: React.FC = () => {
  const location = useLocation();
  const authContext = useAuthSafe();
  const { isAdmin } = useAdmin();
  
  // Don't render if auth context is not available yet
  if (!authContext) {
    return null;
  }
  
  const { user } = authContext;
  const { 
    triggerHapticFeedback,
    handleTouchInteraction,
    mobile
  } = useAppStore();

  // Determine user role
  const userRole: UserRole = user ? 'user' : 'guest';
  
  // Get mobile navigation items based on user role and admin status
  const navigationItems = useMobileNavigationItems(userRole, isAdmin);

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
        "border-t border-border/50 bg-background/90 backdrop-blur-lg",
        "supports-[backdrop-filter]:bg-background/80",
        "shadow-lg shadow-black/10",
        "safe-area-padding-bottom"
      )}
      style={{
        paddingBottom: `max(env(safe-area-inset-bottom), ${mobile?.safeAreaInsets?.bottom || 0}px)`,
        background: 'linear-gradient(to top, hsl(var(--background)/0.95), hsl(var(--background)/0.85))',
      }}
    >
      <div className={cn(
        "grid h-20 px-2",
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
                "flex flex-col items-center justify-center gap-1.5 px-2 py-3",
                "transition-all duration-300 rounded-xl",
                "touch-manipulation tap-highlight-none",
                "hover-scale min-h-[44px]", // Apple's minimum touch target
                "relative group",
                active
                  ? "text-primary bg-primary/15 shadow-md border border-primary/20"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
              )}
              onTouchStart={() => triggerHapticFeedback('light')}
              aria-label={`Navigate to ${item.label}`}
              title={item.description}
            >
              {/* Active indicator */}
              {active && (
                <div className="absolute -top-0.5 left-1/2 transform -translate-x-1/2 w-8 h-1 bg-primary rounded-full" />
              )}
              
              <Icon 
                className={cn(
                  "w-6 h-6 transition-all duration-300",
                  active && "scale-110 drop-shadow-md text-primary",
                  !active && "group-hover:scale-105"
                )} 
              />
              <span className={cn(
                "text-[11px] font-medium transition-all duration-300 leading-tight",
                "truncate max-w-full text-center",
                active && "font-semibold text-primary",
                !active && "group-hover:text-foreground"
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