import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { MainLayout } from '@/components/templates/MainLayout';
import { AdminDashboard } from '@/components/admin/AdminDashboard';
import { ContentModerationPanel } from '@/components/admin/ContentModerationPanel';
import { LoadTestingDashboard } from '@/components/performance/LoadTestingDashboard';
import { AdvancedPerformanceMonitor } from '@/components/performance/AdvancedPerformanceMonitor';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const Admin: React.FC = () => {
  return (
    <MainLayout>
      <Helmet>
        <title>Admin Dashboard | Locale Lore</title>
        <meta name="description" content="Administrative dashboard for managing Locale Lore platform" />
      </Helmet>
      
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <Tabs defaultValue="dashboard" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="moderation">Moderation</TabsTrigger>
            <TabsTrigger value="load-testing">Load Testing</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="support">Support</TabsTrigger>
          </TabsList>
          
          <TabsContent value="dashboard">
            <AdminDashboard />
          </TabsContent>
          
          <TabsContent value="moderation">
            <ContentModerationPanel />
          </TabsContent>
          
          <TabsContent value="load-testing">
            <LoadTestingDashboard />
          </TabsContent>

          <TabsContent value="performance">
            <AdvancedPerformanceMonitor />
          </TabsContent>
          
          <TabsContent value="support">
            <div className="text-center py-8">
              <p className="text-muted-foreground">Support management tools coming soon...</p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default Admin;