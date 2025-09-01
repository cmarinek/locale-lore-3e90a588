
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import { 
  Home, 
  Search, 
  PlusCircle, 
  User, 
  Settings,
  Users,
  Film,
  Trophy
} from 'lucide-react';
import { Button } from './button';
import { Avatar, AvatarFallback, AvatarImage } from './avatar';

export const Navigation: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  const navItems = [
    { path: '/', icon: Home, label: 'Home' },
    { path: '/search', icon: Search, label: 'Search' },
    { path: '/stories', icon: Film, label: 'Stories' },
    { path: '/gamification', icon: Trophy, label: 'Rewards' },
    { path: '/social', icon: Users, label: 'Social' },
  ];

  if (!user) {
    return (
      <nav className="fixed bottom-0 left-0 right-0 bg-background/80 backdrop-blur-md border-t border-border z-50 md:hidden">
        <div className="flex items-center justify-around py-2">
          {navItems.slice(0, 3).map(({ path, icon: Icon, label }) => (
            <Link
              key={path}
              to={path}
              className={cn(
                "flex flex-col items-center gap-1 p-2 text-xs",
                isActive(path) 
                  ? "text-primary" 
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className="w-5 h-5" />
              <span>{label}</span>
            </Link>
          ))}
        </div>
      </nav>
    );
  }

  return (
    <>
      {/* Desktop Navigation */}
      <nav className="hidden md:flex fixed top-0 left-0 right-0 bg-background/80 backdrop-blur-md border-b border-border z-50 px-4 py-3">
        <div className="flex items-center justify-between w-full max-w-6xl mx-auto">
          <Link to="/" className="text-xl font-bold">
            Awesome Facts
          </Link>
          
          <div className="flex items-center gap-6">
            {navItems.map(({ path, icon: Icon, label }) => (
              <Link
                key={path}
                to={path}
                className={cn(
                  "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                  isActive(path)
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                )}
              >
                <Icon className="w-4 h-4" />
                {label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <Avatar className="w-8 h-8">
              <AvatarImage 
                src={user.user_metadata?.avatar_url} 
                alt={user.user_metadata?.full_name || user.email} 
              />
              <AvatarFallback>
                {user.user_metadata?.full_name?.charAt(0) || user.email?.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <span className="text-sm font-medium">
              {user.user_metadata?.full_name || user.email}
            </span>
          </div>
        </div>
      </nav>

      {/* Mobile Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-background/80 backdrop-blur-md border-t border-border z-50 md:hidden">
        <div className="flex items-center justify-around py-2">
          {navItems.map(({ path, icon: Icon, label }) => (
            <Link
              key={path}
              to={path}
              className={cn(
                "flex flex-col items-center gap-1 p-2 text-xs",
                isActive(path) 
                  ? "text-primary" 
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className="w-5 h-5" />
              <span>{label}</span>
            </Link>
          ))}
          
          <Link
            to="/profile"
            className={cn(
              "flex flex-col items-center gap-1 p-2 text-xs",
              isActive('/profile') 
                ? "text-primary" 
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Avatar className="w-5 h-5">
              <AvatarImage 
                src={user.user_metadata?.avatar_url} 
                alt={user.user_metadata?.full_name || user.email} 
              />
              <AvatarFallback className="text-xs">
                {user.user_metadata?.full_name?.charAt(0) || user.email?.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <span>Profile</span>
          </Link>
        </div>
      </nav>
    </>
  );
};
