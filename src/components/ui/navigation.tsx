
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useAdmin } from '@/hooks/useAdmin';
import { useTranslation } from '@/hooks/useTranslation';
import { User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useNavigationConfig } from '@/hooks/useNavigationItems';
import type { UserRole } from '@/types/navigation';

export const Navigation: React.FC = () => {
  const location = useLocation();
  const { user } = useAuth();
  const { isAdmin } = useAdmin();
  const { t } = useTranslation('auth');

  // Determine user role
  const userRole: UserRole = user ? 'user' : 'guest';
  
  // Get navigation configuration
  const navigationConfig = useNavigationConfig(userRole, isAdmin);
  
  // Filter utility navigation items for desktop header
  const headerActions = navigationConfig.utility.filter(item => {
    // Only show profile and admin items in header
    return item.id === 'profile' || item.id === 'admin';
  });

  // Add auth item for guests
  if (userRole === 'guest') {
    headerActions.push({
      id: 'auth',
      label: t('login'),
      path: '/auth',
      icon: User,
      category: 'utility' as const
    });
  }

  const isActive = (path: string) => {
    if (path === '/profile' && location.pathname.startsWith('/profile')) return true;
    return location.pathname === path;
  };

  const getNavigationPath = (item: any) => {
    if (item.id === 'profile' && user) {
      return `/profile/${user.id}`;
    }
    return item.path;
  };

  return (
    // Desktop only - essential header actions
    <nav className="hidden md:flex items-center space-x-1" role="navigation" aria-label="Main navigation">
      {headerActions.map((item) => {
        const Icon = item.icon;
        const navigationPath = getNavigationPath(item);
        const active = isActive(navigationPath);

        return (
          <Link key={item.id} to={navigationPath}>
            <Button
              variant={active ? "secondary" : "ghost"}
              size="sm"
              className={cn(
                "relative story-link", // Apply underline animation
                active && "bg-primary/10 text-primary"
              )}
              aria-label={`Navigate to ${item.label}`}
              title={item.description}
            >
              <Icon className="w-4 h-4 mr-2" />
              {item.label}
            </Button>
          </Link>
        );
      })}
    </nav>
  );
};
