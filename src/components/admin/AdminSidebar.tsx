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
    <Sidebar className={state === "collapsed" ? "w-14" : "w-64"} collapsible="icon">
      <SidebarContent>
        {adminItems.map((group) => (
          <SidebarGroup key={group.group}>
            <SidebarGroupLabel>{state !== "collapsed" && group.group}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => (
                  <SidebarMenuItem key={item.value}>
                    <SidebarMenuButton 
                      asChild
                      className={activeTab === item.value ? "bg-muted text-primary font-medium" : "hover:bg-muted/50"}
                    >
                      <button 
                        onClick={() => onTabChange(item.value)}
                        className="flex items-center w-full text-left"
                      >
                        <item.icon className="h-4 w-4" />
                        {state !== "collapsed" && <span className="ml-2">{item.title}</span>}
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