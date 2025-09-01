
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
      {/* Badge removed - interface doesn't include badge */}
            </Button>
          </Link>
        ))}
      </nav>

      {/* Mobile Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-background/80 backdrop-blur-md border-t border-border z-40">
        <div className="flex items-center justify-around py-2">
          {navItems.slice(0, 4).map(({ path, icon: Icon, label }) => (
            <Link key={path} to={path}>
              <Button
                variant={isActive(path) ? 'default' : 'ghost'}
                size="sm"
                className="flex flex-col gap-1 h-auto py-2"
              >
                <Icon className="w-5 h-5" />
                <span className="text-xs">{label}</span>
              </Button>
            </Link>
          ))}

          {user ? (
            <Link to="/contributor">
              <Button
                variant={isActive('/contributor') ? 'default' : 'ghost'}
                size="sm"
                className="flex flex-col gap-1 h-auto py-2 relative"
              >
                <Crown className="w-5 h-5 text-yellow-500" />
                <span className="text-xs">Earn</span>
                <Badge className="absolute -top-1 -right-1 text-xs px-1 py-0">
                  New
                </Badge>
              </Button>
            </Link>
          ) : (
            <Link to="/auth">
              <Button
                variant="ghost"
                size="sm"
                className="flex flex-col gap-1 h-auto py-2"
              >
                <User className="w-5 h-5" />
                <span className="text-xs">Login</span>
              </Button>
            </Link>
          )}
        </div>
      </nav>
    </>
  );
};
