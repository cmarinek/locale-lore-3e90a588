import React from 'react';
import { useLocation } from 'react-router-dom';
import { SmartLink } from '@/components/SmartLink';
import { useAuth } from '@/contexts/AuthProvider';
import { useAdmin } from '@/hooks/useAdmin';
import { useTranslation } from 'react-i18next';
import { LogOut, User, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useNavigationConfig } from '@/hooks/useNavigationItems';
import type { UserRole } from '@/types/navigation';
import { Button } from '@/components/ui/button';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';

export function AppSidebar() {
  const location = useLocation();
  const { user, signOut } = useAuth();
  const { isAdmin } = useAdmin();
  const { t } = useTranslation('auth');
  const { setOpenMobile } = useSidebar();

  // Determine user role
  const userRole: UserRole = user ? 'free' : 'guest';
  
  // Get navigation configuration
  const navigationConfig = useNavigationConfig(userRole, isAdmin);

  const isActive = (path: string) => {
    if (path === '/profile' && location.pathname.startsWith('/profile')) return true;
    if (path === '/' && location.pathname === '/') return true;
    return location.pathname === path;
  };

  const getNavigationPath = (item: any) => {
    if (item.id === 'profile' && user) {
      return `/profile/${user.id}`;
    }
    return item.path;
  };

  const handleLinkClick = () => {
    // Close mobile sidebar when clicking a link
    setOpenMobile(false);
  };

  return (
    <Sidebar className="border-r border-border/50">
      <SidebarHeader className="border-b border-border/30 p-4">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-lg bg-gradient-to-r from-logo-blue to-logo-green bg-clip-text text-transparent">
            Menu
          </h2>
        </div>
      </SidebarHeader>

      <SidebarContent>
        {/* Primary Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel>Explore</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationConfig.primary.map((item) => {
                const Icon = item.icon;
                const navigationPath = getNavigationPath(item);
                const active = isActive(navigationPath);

                return (
                  <SidebarMenuItem key={item.id}>
                    <SidebarMenuButton asChild isActive={active}>
                      <SmartLink 
                        to={navigationPath}
                        onClick={handleLinkClick}
                        className="flex items-center gap-3"
                      >
                        <Icon className="w-5 h-5" />
                        <span>{item.label}</span>
                      </SmartLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Utility Navigation */}
        {navigationConfig.utility.length > 0 && (
          <SidebarGroup>
            <SidebarGroupLabel>Account</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {navigationConfig.utility.map((item) => {
                  const Icon = item.icon;
                  const navigationPath = getNavigationPath(item);
                  const active = isActive(navigationPath);

                  return (
                    <SidebarMenuItem key={item.id}>
                      <SidebarMenuButton asChild isActive={active}>
                        <SmartLink 
                          to={navigationPath}
                          onClick={handleLinkClick}
                          className="flex items-center gap-3"
                        >
                          <Icon className="w-5 h-5" />
                          <span>{item.label}</span>
                        </SmartLink>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {/* Guest Login */}
        {!user && (
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <SmartLink 
                      to="/auth"
                      onClick={handleLinkClick}
                      className="flex items-center gap-3"
                    >
                      <User className="w-5 h-5" />
                      <span>{t('login')}</span>
                    </SmartLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>

      {/* Footer with Sign Out */}
      {user && (
        <SidebarFooter className="border-t border-border/30 p-4">
          <Button
            variant="ghost"
            onClick={() => {
              signOut();
              handleLinkClick();
            }}
            className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10"
          >
            <LogOut className="w-5 h-5 mr-3" />
            Sign Out
          </Button>
        </SidebarFooter>
      )}
    </Sidebar>
  );
}
