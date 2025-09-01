import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Home, 
  Compass, 
  Search, 
  BookOpen, 
  User,
  Menu,
  X,
  Star
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import { useAppStore } from '@/stores/appStore';

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  description?: string;
}

const navigation: NavItem[] = [
  {
    label: 'Home',
    href: '/',
    icon: <Home className="w-4 h-4" />,
    description: 'Welcome & Overview'
  },
  {
    label: 'Explore',
    href: '/explore',
    icon: <Compass className="w-4 h-4" />,
    description: 'Discover Stories'
  },
  {
    label: 'Search',
    href: '/search',
    icon: <Search className="w-4 h-4" />,
    description: 'Advanced Search'
  },
  {
    label: 'Submit',
    href: '/submit',
    icon: <BookOpen className="w-4 h-4" />,
    description: 'Share Your Story'
  }
];

interface NavigationProps {
  className?: string;
}

export const Navigation: React.FC<NavigationProps> = ({ className }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isMobileMenuOpen, setMobileMenuOpen, setActiveTab } = useAppStore();

  const isActive = (href: string) => {
    if (href === '/') {
      return location.pathname === '/';
    }
    if (href === '/explore' && location.pathname === '/') {
      return true;
    }
    return location.pathname.startsWith(href);
  };

  const handleNavClick = (href: string) => {
    if (href === '/explore') setActiveTab('explore');
    else if (href === '/search') setActiveTab('search');
    else if (href === '/submit') setActiveTab('submit');
    else if (href === '/profile') setActiveTab('profile');
    setMobileMenuOpen(false);
  };

  return (
    <>
      {/* Desktop Navigation */}
      <nav className={cn("hidden md:flex items-center space-x-6", className)}>
        {navigation.map((item) => (
          <Link
            key={item.href}
            to={item.href}
            onClick={() => handleNavClick(item.href)}
            className={cn(
              "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors haptic-feedback",
              isActive(item.href)
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            )}
          >
            {item.icon}
            {item.label}
          </Link>
        ))}
        
        {user ? (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/profile')}
            className="flex items-center gap-2"
          >
            <User className="w-4 h-4" />
            Profile
          </Button>
        ) : (
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/auth')}
          >
            Sign In
          </Button>
        )}
      </nav>

      {/* Mobile Navigation Button */}
      <div className="md:hidden">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </Button>
      </div>

      {/* Mobile Navigation Menu */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur md:hidden">
          <div className="flex flex-col h-full">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-semibold">Navigation</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setMobileMenuOpen(false)}
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* Navigation Items */}
            <div className="flex-1 p-4 space-y-4">
              {navigation.map((item) => (
                <Link
                  key={item.href}
                  to={item.href}
                  onClick={() => handleNavClick(item.href)}
                  className={cn(
                    "flex items-center gap-4 p-4 rounded-lg transition-colors haptic-feedback",
                    isActive(item.href)
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-muted"
                  )}
                >
                  {item.icon}
                  <div className="flex-1">
                    <div className="font-medium">{item.label}</div>
                    {item.description && (
                      <div className="text-sm text-muted-foreground">{item.description}</div>
                    )}
                  </div>
                </Link>
              ))}

              {/* User Section */}
              <div className="border-t pt-4 mt-6">
                {user ? (
                  <div className="space-y-3">
                    <Link
                      to="/profile"
                      onClick={() => handleNavClick('/profile')}
                      className="flex items-center gap-4 p-4 rounded-lg hover:bg-muted transition-colors haptic-feedback"
                    >
                      <User className="w-5 h-5" />
                      <div>
                        <div className="font-medium">Profile</div>
                        <div className="text-sm text-muted-foreground">View your profile</div>
                      </div>
                    </Link>
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => {
                        setMobileMenuOpen(false);
                        // Handle sign out
                      }}
                    >
                      Sign Out
                    </Button>
                  </div>
                ) : (
                  <Button
                    className="w-full"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      navigate('/auth');
                    }}
                  >
                    Sign In
                  </Button>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t">
              <div className="flex items-center justify-center gap-2">
                <Star className="w-4 h-4 text-primary" />
                <span className="text-sm text-muted-foreground">LocaleLore</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};