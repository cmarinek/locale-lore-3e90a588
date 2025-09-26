export interface NavigationItem {
  id: string;
  label: string;
  path: string;
  icon: React.ComponentType<any>;
  description?: string;
  badge?: string | number;
  requiresAuth?: boolean;
  adminOnly?: boolean;
  mobileOnly?: boolean;
  desktopOnly?: boolean;
  category?: 'primary' | 'secondary' | 'utility';
}

export interface NavigationGroup {
  id: string;
  label: string;
  items: NavigationItem[];
  collapsible?: boolean;
  defaultOpen?: boolean;
}

export type UserRole = 'guest' | 'free' | 'contributor' | 'admin';

export interface NavigationConfig {
  primary: NavigationItem[];
  secondary: NavigationItem[];
  utility: NavigationItem[];
  mobile: NavigationItem[];
  desktop: NavigationItem[];
}