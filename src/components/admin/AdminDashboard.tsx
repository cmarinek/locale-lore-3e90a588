
import React from 'react';
import { useAdmin } from '@/hooks/useAdmin';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ContentModerationPanel } from '@/components/admin/ContentModerationPanel';
import { UserManagementPanel } from '@/components/admin/UserManagementPanel';
import { AnalyticsDashboard } from '@/components/admin/AnalyticsDashboard';
import { ReportsPanel } from '@/components/admin/ReportsPanel';
import { PaymentDashboard } from '@/components/admin/PaymentDashboard';
import { PromoCodeManager } from '@/components/admin/PromoCodeManager';
import FactAcquisitionManager from './FactAcquisitionManager';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, AlertTriangle } from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const { isAdmin, loading } = useAdmin();

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
              <h2 className="text-2xl font-bold">Access Denied</h2>
              <p className="text-muted-foreground">
                You don't have permission to access the admin dashboard.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-2 sm:p-4">
      <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
        <div className="flex items-start sm:items-center gap-3 flex-col sm:flex-row">
          <div className="flex items-center gap-3">
            <Shield className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
            <div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold">Admin Dashboard</h1>
              <p className="text-sm text-muted-foreground hidden sm:block">Manage content, users, payments, and monitor system health</p>
            </div>
          </div>
        </div>

        <Alert className="text-sm">
          <Shield className="h-4 w-4" />
          <AlertDescription>
            Admin access active. All actions are logged.
          </AlertDescription>
        </Alert>

        <Tabs defaultValue="analytics" className="space-y-4 sm:space-y-6">
          <TabsList className="grid w-full grid-cols-3 sm:grid-cols-7 h-auto">
            <TabsTrigger value="analytics" className="text-xs sm:text-sm px-2 py-2">Analytics</TabsTrigger>
            <TabsTrigger value="payments" className="text-xs sm:text-sm px-2 py-2">Payments</TabsTrigger>
            <TabsTrigger value="promos" className="text-xs sm:text-sm px-2 py-2">Promos</TabsTrigger>
            <TabsTrigger value="moderation" className="text-xs sm:text-sm px-2 py-2">Moderation</TabsTrigger>
            <TabsTrigger value="users" className="text-xs sm:text-sm px-2 py-2">Users</TabsTrigger>
            <TabsTrigger value="reports" className="text-xs sm:text-sm px-2 py-2">Reports</TabsTrigger>
            <TabsTrigger value="acquisition" className="text-xs sm:text-sm px-2 py-2">Acquisition</TabsTrigger>
          </TabsList>

          <TabsContent value="analytics" className="space-y-4 sm:space-y-6">
            <AnalyticsDashboard />
          </TabsContent>

          <TabsContent value="payments" className="space-y-4 sm:space-y-6">
            <PaymentDashboard />
          </TabsContent>

          <TabsContent value="promos" className="space-y-4 sm:space-y-6">
            <PromoCodeManager />
          </TabsContent>

          <TabsContent value="moderation" className="space-y-4 sm:space-y-6">
            <ContentModerationPanel />
          </TabsContent>

          <TabsContent value="users" className="space-y-4 sm:space-y-6">
            <UserManagementPanel />
          </TabsContent>

          <TabsContent value="reports" className="space-y-4 sm:space-y-6">
            <ReportsPanel />
          </TabsContent>

          <TabsContent value="acquisition" className="space-y-4 sm:space-y-6">
            <FactAcquisitionManager />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};
