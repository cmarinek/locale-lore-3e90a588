
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { useAdmin } from '@/hooks/useAdmin';
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
  Upload,
  Settings,
  Shield
} from 'lucide-react';

export const Navigation: React.FC = () => {
  const location = useLocation();
  const { user } = useAuth();
  const { isAdmin } = useAdmin();

  const isActive = (path: string) => location.pathname === path;

  const navItems = [
    { 
      path: '/', 
      icon: Home, 
      label: 'Home'
    },
    { 
      path: '/explore', 
      icon: Compass, 
      label: 'Explore'
    },
    { 
      path: '/search', 
      icon: Search, 
      label: 'Search'
    },
    { 
      path: '/stories', 
      icon: Camera, 
      label: 'Stories'
    },
    { 
      path: '/social', 
      icon: Users, 
      label: 'Social'
    },
  ];

  const userItems = user ? [
    { 
      path: '/submit', 
      icon: Plus, 
      label: 'Submit'
    },
    { 
      path: '/gamification', 
      icon: Trophy, 
      label: 'Achievements'
    },
      {
        path: '/contributor',
        icon: Crown,
        label: 'Earn'
      },
    { 
      path: '/media', 
      icon: Upload, 
      label: 'Media'
    },
    { 
      path: `/profile/${user.id}`, 
      icon: User, 
      label: 'Profile'
    },
    ...(isAdmin ? [{ 
      path: '/admin', 
      icon: Shield, 
      label: 'Admin'
    }] : []),
  ] : [
    { 
      path: '/auth', 
      icon: User, 
      label: 'Login'
    }
  ];

  return (
    <>
      {/* Desktop Navigation */}
      <nav className="hidden md:flex items-center space-x-1 p-1 bg-muted rounded-lg">
        {[...navItems, ...userItems].map(({ path, icon: Icon, label }) => (
          <Link key={path} to={path}>
            <Button
              variant={isActive(path) ? 'default' : 'ghost'}
              size="sm"
              className="relative"
            >
              <Icon className="w-4 h-4 mr-2" />
              {label}
            </Button>
          </Link>
        ))}
      </nav>

      {/* Mobile Navigation */}
      <nav className="md:hidden flex items-center space-x-1 p-1 bg-muted rounded-lg overflow-x-auto">
        {[...navItems, ...userItems].map(({ path, icon: Icon, label }) => (
          <Link key={path} to={path} className="flex-shrink-0">
            <Button
              variant={isActive(path) ? 'default' : 'ghost'}
              size="sm"
              className="relative"
            >
              <Icon className="w-4 h-4" />
            </Button>
          </Link>
        ))}
      </nav>
    </>
  );
};
