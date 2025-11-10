
import React, { useState } from 'react';
import { useAdmin } from '@/hooks/useAdmin';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { ContentModerationPanel } from '@/components/admin/ContentModerationPanel';
import { UserManagementPanel } from '@/components/admin/UserManagementPanel';
import { RoleManagementPanel } from '@/components/admin/RoleManagementPanel';
import { AnalyticsDashboard } from '@/components/admin/AnalyticsDashboard';
import { ReportsPanel } from '@/components/admin/ReportsPanel';
import { PaymentDashboard } from '@/components/admin/PaymentDashboard';
import { PromoCodeManager } from '@/components/admin/PromoCodeManager';
import FactAcquisitionManager from './FactAcquisitionManager';
import { MobileAppBuilder } from './MobileAppBuilder';
import MediaManagement from '@/pages/MediaManagement';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, AlertTriangle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { SiteSettingsPanel } from './SiteSettingsPanel';
import { AnnouncementManager } from './AnnouncementManager';
import { MediaLibraryPanel } from './MediaLibraryPanel';
import { ThemeCustomizer } from './ThemeCustomizer';
import { SiteConfigurationPanel } from './SiteConfigurationPanel';
import { TranslationCoverageDashboard } from './TranslationCoverageDashboard';
import { TranslationManagementTools } from './TranslationManagementTools';

export const AdminDashboard: React.FC = () => {
  const { isAdmin, loading } = useAdmin();
  const { t } = useTranslation('admin');
  const [activeTab, setActiveTab] = useState('analytics');

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Checking admin permissions...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <AlertTriangle className="w-12 h-12 text-destructive mx-auto" />
              <h2 className="text-2xl font-bold">{t('accessDenied', { defaultValue: 'Access Denied' })}</h2>
              <p className="text-muted-foreground">
                {t('accessDeniedDescription', { defaultValue: "You don't have permission to access the admin dashboard." })}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'analytics':
        return <AnalyticsDashboard />;
      case 'payments':
        return <PaymentDashboard />;
      case 'promos':
        return <PromoCodeManager />;
      case 'moderation':
        return <ContentModerationPanel />;
      case 'users':
        return <UserManagementPanel />;
      case 'roles':
        return <RoleManagementPanel />;
      case 'reports':
        return <ReportsPanel />;
      case 'acquisition':
        return <FactAcquisitionManager />;
      case 'mobile':
        return <MobileAppBuilder />;
      case 'media':
        return <MediaManagement />;
      case 'media-library':
        return <MediaLibraryPanel />;
      case 'announcements':
        return <AnnouncementManager />;
      case 'theme':
        return <ThemeCustomizer />;
      case 'configuration':
        return <SiteConfigurationPanel />;
      case 'translations':
        return (
          <div className="space-y-6">
            <TranslationCoverageDashboard />
            <TranslationManagementTools />
          </div>
        );
      case 'settings':
        return <SiteSettingsPanel />;
      default:
        return <AnalyticsDashboard />;
    }
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AdminSidebar activeTab={activeTab} onTabChange={setActiveTab} />
        
        <div className="flex-1 flex flex-col min-h-screen">
          {/* Header with sidebar trigger */}
          <header className="h-16 flex items-center justify-between border-b bg-background/95 backdrop-blur-sm px-6 sticky top-0 z-10">
            <div className="flex items-center gap-4">
              <SidebarTrigger className="lg:hidden" />
              <div className="flex items-center gap-3">
                <Shield className="w-6 h-6 text-primary" />
                <div>
                  <h1 className="text-xl font-bold">{t('dashboard', { defaultValue: 'Admin Dashboard' })}</h1>
                  <p className="text-xs text-muted-foreground hidden sm:block">
                    System Administration & Management
                  </p>
                </div>
              </div>
            </div>
            
            {/* Status indicator */}
            <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 dark:bg-green-950 rounded-full">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-xs font-medium text-green-700 dark:text-green-300">
                Admin Active
              </span>
            </div>
          </header>

          {/* Alert */}
          <div className="p-6 pb-4">
            <Alert className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950">
              <Shield className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              <AlertDescription className="text-blue-800 dark:text-blue-200">
                Admin access active. All actions are monitored and logged for security purposes.
              </AlertDescription>
            </Alert>
          </div>

          {/* Main content */}
          <main className="flex-1 p-6 pt-2 overflow-auto">
            <div className="max-w-7xl mx-auto">
              {renderContent()}
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};
