import React, { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Map, Search, BookOpen, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAppStore } from '@/stores/appStore';

const tabs = [
  {
    id: 'explore' as const,
    label: 'Explore',
    href: '/explore',
    icon: Map,
  },
  {
    id: 'search' as const,
    label: 'Search',
    href: '/search',
    icon: Search,
  },
  {
    id: 'submit' as const,
    label: 'Submit',
    href: '/submit',
    icon: BookOpen,
  },
  {
    id: 'profile' as const,
    label: 'Profile',
    href: '/profile',
    icon: User,
  },
];

export const BottomNavigation: React.FC = () => {
  const location = useLocation();
  const { 
    activeTab, 
    setActiveTab, 
    mobile, 
    triggerHapticFeedback,
    handleTouchInteraction 
  } = useAppStore();

  const isActive = (href: string) => {
    if (href === '/explore' && (location.pathname === '/' || location.pathname === '/discover')) {
      return true;
    }
    return location.pathname.startsWith(href);
  };

  const handleTabClick = (tabId: typeof activeTab) => {
    setActiveTab(tabId);
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
        "glass border-t bg-background/95 backdrop-blur-lg",
        "safe-area-padding-bottom"
      )}
      style={{
        paddingBottom: `max(env(safe-area-inset-bottom), ${mobile?.safeAreaInsets?.bottom || 0}px)`,
      }}
    >
      <div className="grid grid-cols-4 h-16">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const active = isActive(tab.href);
          
          return (
            <Link
              key={tab.id}
              to={tab.href}
              onClick={() => handleTabClick(tab.id)}
              className={cn(
                "flex flex-col items-center justify-center gap-1 px-2 py-1 text-xs font-medium",
                "transition-all duration-200 tap-highlight-none touch-manipulation",
                !mobile?.reduceAnimations && "haptic-feedback",
                active
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground active:text-primary"
              )}
              onTouchStart={() => triggerHapticFeedback('light')}
            >
              <div
                className={cn(
                  "flex items-center justify-center w-8 h-8 rounded-lg transition-all duration-200",
                  active && "bg-primary/10",
                  !mobile?.reduceAnimations && active && "scale-110"
                )}
              >
                <Icon 
                  className={cn(
                    "w-5 h-5 transition-transform duration-200",
                    !mobile?.reduceAnimations && active && "scale-110"
                  )} 
                />
              </div>
              <span className={cn(
                "transition-all duration-200 leading-tight",
                active ? "font-semibold" : "font-medium"
              )}>
                {tab.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};