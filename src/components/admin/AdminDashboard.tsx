
import React, { useState } from 'react';
import { useAdmin } from '@/hooks/useAdmin';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { ContentModerationPanel } from '@/components/admin/ContentModerationPanel';
import { UserManagementPanel } from '@/components/admin/UserManagementPanel';
import { AnalyticsDashboard } from '@/components/admin/AnalyticsDashboard';
import { ReportsPanel } from '@/components/admin/ReportsPanel';
import { PaymentDashboard } from '@/components/admin/PaymentDashboard';
import { PromoCodeManager } from '@/components/admin/PromoCodeManager';
import FactAcquisitionManager from './FactAcquisitionManager';
import { MobileAppBuilder } from './MobileAppBuilder';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, AlertTriangle } from 'lucide-react';
import { useTranslation } from 'react-i18next';

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
      case 'reports':
        return <ReportsPanel />;
      case 'acquisition':
        return <FactAcquisitionManager />;
      case 'mobile':
        return <MobileAppBuilder />;
      default:
        return <AnalyticsDashboard />;
    }
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AdminSidebar activeTab={activeTab} onTabChange={setActiveTab} />
        
        <div className="flex-1 flex flex-col">
          {/* Header with sidebar trigger */}
          <header className="h-16 flex items-center justify-between border-b bg-background/95 backdrop-blur-sm px-4">
            <div className="flex items-center gap-3">
              <SidebarTrigger />
              <div className="flex items-center gap-3">
                <Shield className="w-6 h-6 text-primary" />
                <div>
                  <h1 className="text-xl font-bold">{t('dashboard')}</h1>
                  <p className="text-xs text-muted-foreground hidden sm:block">
                    Admin Dashboard
                  </p>
                </div>
              </div>
            </div>
          </header>

          {/* Alert */}
          <div className="p-4">
            <Alert className="text-sm">
              <Shield className="h-4 w-4" />
              <AlertDescription>
                Admin access active. All actions are logged.
              </AlertDescription>
            </Alert>
          </div>

          {/* Main content */}
          <main className="flex-1 p-4">
            {renderContent()}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};
