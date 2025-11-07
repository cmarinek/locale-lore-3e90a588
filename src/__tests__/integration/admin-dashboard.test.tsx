import type { ReactNode } from 'react';
import { render, screen, fireEvent } from '@/test/utils';

jest.mock('@/hooks/useAdmin', () => ({
  __esModule: true,
  useAdmin: jest.fn(),
}));

jest.mock('@/config/environments');

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (_key: string, options?: { defaultValue?: string }) => options?.defaultValue ?? _key,
  }),
}));

jest.mock('@/components/ui/sidebar', () => ({
  SidebarProvider: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  SidebarTrigger: ({ children }: { children?: ReactNode }) => <button>{children ?? 'Open Sidebar'}</button>,
  Sidebar: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  SidebarContent: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  SidebarGroup: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  SidebarGroupLabel: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  SidebarGroupContent: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  SidebarMenu: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  SidebarMenuItem: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  SidebarMenuButton: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  useSidebar: () => ({ state: 'expanded' }),
}));

jest.mock('@/components/admin/AnalyticsDashboard', () => ({
  AnalyticsDashboard: () => <div>Analytics Overview</div>,
}));

jest.mock('@/components/admin/PaymentDashboard', () => ({
  PaymentDashboard: () => <div>Payments Panel</div>,
}));

jest.mock('@/components/admin/PromoCodeManager', () => ({
  PromoCodeManager: () => <div>Promotions Manager</div>,
}));

jest.mock('@/components/admin/ContentModerationPanel', () => ({
  ContentModerationPanel: () => <div>Moderation Panel</div>,
}));

jest.mock('@/components/admin/UserManagementPanel', () => ({
  UserManagementPanel: () => <div>User Management</div>,
}));

jest.mock('@/components/admin/ReportsPanel', () => ({
  ReportsPanel: () => <div>Reports Panel</div>,
}));

jest.mock('@/components/admin/FactAcquisitionManager', () => ({
  __esModule: true,
  default: () => <div>Fact Acquisition</div>,
}));

jest.mock('@/components/admin/MobileAppBuilder', () => ({
  MobileAppBuilder: () => <div>Mobile Builder</div>,
}));

jest.mock('@/pages/MediaManagement', () => ({
  __esModule: true,
  default: () => <div>Media Management</div>,
}));

const { AdminDashboard } = require('@/components/admin/AdminDashboard') as typeof import('@/components/admin/AdminDashboard');
const { useAdmin } = jest.requireMock('@/hooks/useAdmin') as { useAdmin: jest.Mock };

const mockedUseAdmin = useAdmin;

describe('Admin dashboard access control', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('shows a loading indicator while permissions are checked', () => {
    mockedUseAdmin.mockReturnValue({ isAdmin: false, loading: true });

    render(<AdminDashboard />);

    expect(screen.getByText(/checking admin permissions/i)).toBeInTheDocument();
  });

  it('blocks access for non-admin users', () => {
    mockedUseAdmin.mockReturnValue({ isAdmin: false, loading: false });

    render(<AdminDashboard />);

    expect(screen.getByText(/access denied/i)).toBeInTheDocument();
  });

  it('renders analytics by default and allows switching tabs for admins', () => {
    mockedUseAdmin.mockReturnValue({ isAdmin: true, loading: false });

    render(<AdminDashboard />);

    expect(screen.getByText(/analytics overview/i)).toBeInTheDocument();

    const paymentsTab = screen.getByRole('button', { name: /payments/i });
    fireEvent.click(paymentsTab);

    expect(screen.getByText(/payments panel/i)).toBeInTheDocument();
  });
});
