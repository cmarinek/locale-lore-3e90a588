import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';
import {
  BarChart3,
  CreditCard,
  Tag,
  Shield,
  Users,
  FileText,
  Database,
  Smartphone,
} from 'lucide-react';

const adminItems = [
  {
    group: 'Analytics',
    items: [
      { title: 'Dashboard', value: 'analytics', icon: BarChart3 },
    ]
  },
  {
    group: 'Business',
    items: [
      { title: 'Payments', value: 'payments', icon: CreditCard },
      { title: 'Promo Codes', value: 'promos', icon: Tag },
    ]
  },
  {
    group: 'Content',
    items: [
      { title: 'Moderation', value: 'moderation', icon: Shield },
      { title: 'Fact Acquisition', value: 'acquisition', icon: Database },
    ]
  },
  {
    group: 'System',
    items: [
      { title: 'Users', value: 'users', icon: Users },
      { title: 'Reports', value: 'reports', icon: FileText },
      { title: 'Mobile Builder', value: 'mobile', icon: Smartphone },
    ]
  }
];

interface AdminSidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({ activeTab, onTabChange }) => {
  const { state } = useSidebar();

  return (
    <Sidebar className={state === "collapsed" ? "w-16" : "w-64"} collapsible="icon">
      <SidebarContent className="pt-4">
        {adminItems.map((group) => (
          <SidebarGroup key={group.group}>
            {state !== "collapsed" && (
              <SidebarGroupLabel className="text-xs font-medium text-muted-foreground px-3 py-2">
                {group.group}
              </SidebarGroupLabel>
            )}
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => (
                  <SidebarMenuItem key={item.value}>
                    <SidebarMenuButton 
                      asChild
                      className={`
                        transition-colors duration-200
                        ${activeTab === item.value 
                          ? "bg-primary/10 text-primary font-medium border-r-2 border-primary" 
                          : "hover:bg-muted/60 text-muted-foreground hover:text-foreground"
                        }
                      `}
                    >
                      <button 
                        onClick={() => onTabChange(item.value)}
                        className="flex items-center w-full text-left gap-3 px-3 py-2.5"
                        title={state === "collapsed" ? item.title : undefined}
                      >
                        <item.icon className="h-4 w-4 shrink-0" />
                        {state !== "collapsed" && (
                          <span className="text-sm font-medium">{item.title}</span>
                        )}
                      </button>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
    </Sidebar>
  );
};