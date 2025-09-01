import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Compass, Search, BookOpen, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAppStore } from '@/stores/appStore';

const tabs = [
  {
    id: 'explore' as const,
    label: 'Explore',
    href: '/explore',
    icon: Compass,
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
  const { activeTab, setActiveTab } = useAppStore();

  const isActive = (href: string) => {
    if (href === '/explore' && location.pathname === '/') {
      return true;
    }
    return location.pathname.startsWith(href);
  };

  const handleTabClick = (tabId: typeof activeTab) => {
    setActiveTab(tabId);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden glass border-t bg-background/95 backdrop-blur-lg">
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
                "flex flex-col items-center justify-center gap-1 px-2 py-1 text-xs font-medium transition-all duration-200 haptic-feedback",
                active
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <div
                className={cn(
                  "flex items-center justify-center w-8 h-8 rounded-lg transition-all duration-200",
                  active && "bg-primary/10 scale-110"
                )}
              >
                <Icon 
                  className={cn(
                    "w-5 h-5 transition-transform duration-200",
                    active && "scale-110"
                  )} 
                />
              </div>
              <span className={cn(
                "transition-all duration-200",
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