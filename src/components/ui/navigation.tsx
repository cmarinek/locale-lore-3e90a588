
import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { SmartLink } from '@/components/SmartLink';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { useAuth } from '@/contexts/AuthProvider';
import { useAdmin } from '@/hooks/useAdmin';
import { useTranslation } from 'react-i18next';
import { User, LogOut, Settings, UserCog, Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useNavigationConfig } from '@/hooks/useNavigationItems';
import type { UserRole } from '@/types/navigation';
import { NotificationCenter } from '@/components/notifications/NotificationCenter';

export const Navigation: React.FC = () => {
  const location = useLocation();
  const { user, signOut } = useAuth();
  const { isAdmin } = useAdmin();
  const { t } = useTranslation('auth');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Determine user role
  const userRole: UserRole = user ? 'free' : 'guest';

  // Get navigation configuration
  const navigationConfig = useNavigationConfig(userRole, isAdmin);
  
  // Filter utility navigation items for desktop header
  const headerActions = navigationConfig.utility.filter(item => {
    // Show profile, billing, and admin items in header
    return item.id === 'profile' || item.id === 'billing' || item.id === 'admin';
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
    <>
      {/* Mobile hamburger menu */}
      <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="md:hidden"
            aria-label="Open navigation menu"
          >
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="right" className="w-80 overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Menu</SheetTitle>
          </SheetHeader>
          <div className="mt-6 space-y-4">
            {/* Primary navigation items */}
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-muted-foreground px-2">Navigation</h3>
              {navigationConfig.primary.map((item) => {
                const Icon = item.icon;
                const path = getNavigationPath(item);
                const active = isActive(path);

                return (
                  <SmartLink
                    key={item.id}
                    to={path}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Button
                      variant={active ? "secondary" : "ghost"}
                      className={cn(
                        "w-full justify-start gap-3",
                        active && "bg-primary/10 text-primary"
                      )}
                      aria-label={`Navigate to ${item.label}`}
                    >
                      <Icon className="h-5 w-5" />
                      <span>{item.label}</span>
                    </Button>
                  </SmartLink>
                );
              })}
            </div>

            {/* Utility navigation items */}
            {user && (
              <>
                <div className="border-t pt-4 space-y-2">
                  <h3 className="text-sm font-semibold text-muted-foreground px-2">Account</h3>
                  {headerActions.map((item) => {
                    const Icon = item.icon;
                    const path = getNavigationPath(item);
                    const active = isActive(path);

                    return (
                      <SmartLink
                        key={item.id}
                        to={path}
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <Button
                          variant={active ? "secondary" : "ghost"}
                          className={cn(
                            "w-full justify-start gap-3",
                            active && "bg-primary/10 text-primary"
                          )}
                          aria-label={`Navigate to ${item.label}`}
                        >
                          <Icon className="h-5 w-5" />
                          <span>{item.label}</span>
                        </Button>
                      </SmartLink>
                    );
                  })}
                  <SmartLink to="/settings" onClick={() => setMobileMenuOpen(false)}>
                    <Button
                      variant={isActive('/settings') ? "secondary" : "ghost"}
                      className="w-full justify-start gap-3"
                      aria-label="Navigate to Settings"
                    >
                      <Settings className="h-5 w-5" />
                      <span>Settings</span>
                    </Button>
                  </SmartLink>
                </div>

                <div className="border-t pt-4">
                  <Button
                    variant="ghost"
                    onClick={() => {
                      signOut();
                      setMobileMenuOpen(false);
                    }}
                    className="w-full justify-start gap-3 text-destructive hover:text-destructive hover:bg-destructive/10"
                    aria-label="Sign out of your account"
                  >
                    <LogOut className="h-5 w-5" />
                    <span>Sign Out</span>
                  </Button>
                </div>
              </>
            )}

            {/* Guest actions */}
            {!user && (
              <div className="border-t pt-4">
                <SmartLink to="/auth" onClick={() => setMobileMenuOpen(false)}>
                  <Button
                    variant="default"
                    className="w-full justify-start gap-3"
                    aria-label="Navigate to login"
                  >
                    <User className="h-5 w-5" />
                    <span>{t('login')}</span>
                  </Button>
                </SmartLink>
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>

      {/* Desktop navigation - essential header actions */}
      <nav className="hidden md:flex items-center space-x-1" role="navigation" aria-label="Main navigation">
      {headerActions.map((item) => {
        const Icon = item.icon;
        const navigationPath = getNavigationPath(item);
        const active = isActive(navigationPath);

        return (
          <SmartLink key={item.id} to={navigationPath}>
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
          </SmartLink>
        );
      })}
      
      {/* Notification Center for logged-in users */}
      {user && <NotificationCenter />}
      
      {/* User Dropdown Menu for logged-in users */}
      {user && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="relative">
              <UserCog className="w-4 h-4 mr-2" />
              Account
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuItem asChild>
              <SmartLink to={`/profile/${user.id}`} className="flex items-center">
                <User className="w-4 h-4 mr-2" />
                Profile
              </SmartLink>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <SmartLink to="/settings" className="flex items-center">
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </SmartLink>
            </DropdownMenuItem>
            {isAdmin && (
              <DropdownMenuItem asChild>
                <SmartLink to="/admin" className="flex items-center">
                  <UserCog className="w-4 h-4 mr-2" />
                  Admin
                </SmartLink>
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={signOut} className="flex items-center text-destructive focus:text-destructive">
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </nav>
    </>
  );
};
