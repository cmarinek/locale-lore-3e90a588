
import React, { useState } from 'react';
import { MainLayout } from '@/components/templates/MainLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ContributorPlans } from '@/components/billing/ContributorPlans';
import { SubscriptionDashboard } from '@/components/billing/SubscriptionDashboard';
import { useAuth } from '@/contexts/AuthContext';
import { motion } from 'framer-motion';
import { CreditCard, Package, History, Settings } from 'lucide-react';

export const Billing: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');

  if (!user) {
    return (
      <MainLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Please sign in</h2>
            <p className="text-muted-foreground">You need to be signed in to access billing.</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-primary/5">
        <div className="container mx-auto px-4 py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-3xl font-bold mb-2">Billing & Subscriptions</h1>
            <p className="text-muted-foreground">
              Manage your subscriptions, view payment history, and upgrade your plan
            </p>
          </motion.div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="dashboard" className="flex items-center gap-2">
                <CreditCard className="h-4 w-4" />
                Dashboard
              </TabsTrigger>
              <TabsTrigger value="plans" className="flex items-center gap-2">
                <Package className="h-4 w-4" />
                Become a Contributor
              </TabsTrigger>
            </TabsList>

            <TabsContent value="dashboard">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <SubscriptionDashboard />
              </motion.div>
            </TabsContent>

            <TabsContent value="plans">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <ContributorPlans />
              </motion.div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </MainLayout>
  );
};
