import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { MainLayout } from '@/components/templates/MainLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useProfile } from '@/hooks/useProfile';
import { ProfileEditor } from '@/components/profile/ProfileEditor';
import { SettingsPanel } from '@/components/profile/SettingsPanel';
import { SubscriptionManager } from '@/components/profile/SubscriptionManager';
import { StatisticsCard } from '@/components/profile/StatisticsCard';
import { AchievementShowcase } from '@/components/profile/AchievementShowcase';
import { DataExportPanel } from '@/components/profile/DataExportPanel';
import { DataDeletionPanel } from '@/components/profile/DataDeletionPanel';
import { SubscriptionStatusCard } from '@/components/ui/subscription-status-card';
import { useAuth } from '@/contexts/AuthProvider';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/integrations/supabase/client';
import { ErrorBoundary } from '@/components/ui/error-boundary';

export const Profile: React.FC = () => {
  const { id } = useParams<{ id?: string }>();
  const { user } = useAuth();
  const { t } = useTranslation('profile');
  const [isContributor, setIsContributor] = useState(false);
  const [checkingSubscription, setCheckingSubscription] = useState(true);

  console.log('Profile component rendering:', { id, user: user?.id, isOwnProfile: !id || id === user?.id });
  
  const {
    settings,
    statistics,
    subscription,
    loading,
    updateSettings,
    exportUserData,
    requestAccountDeletion,
    refreshSubscription
  } = useProfile();

  const isOwnProfile = !id || id === user?.id;

  // Check subscription status
  useEffect(() => {
    const checkSubscription = async () => {
      if (!user) {
        setCheckingSubscription(false);
        return;
      }

      try {
        const { data } = await supabase.functions.invoke('check-subscription', {
          body: { user_id: user.id }
        });
        setIsContributor(data?.subscribed || false);
      } catch (error) {
        console.error('Error checking subscription:', error);
        setIsContributor(false);
      } finally {
        setCheckingSubscription(false);
      }
    };

    checkSubscription();
  }, [user]);

  if (loading) {
    return (
      <MainLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-muted-foreground">{t('loading', { defaultValue: 'Loading profile...' })}</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  // For now, we'll only show own profile since we don't have profile data from useProfile
  if (!isOwnProfile) {
    return (
      <MainLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-xl font-semibold mb-2">Profile not available</h2>
            <p className="text-muted-foreground mb-4">You can only view your own profile for now.</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <ErrorBoundary>
      <MainLayout>
        <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-primary/5">
          <div className="container mx-auto px-4 py-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8"
            >
              <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold">
                  {t('myProfile', { defaultValue: 'My Profile' })}
                </h1>
              </div>
              
              {/* Subscription Status */}
              <SubscriptionStatusCard 
                isContributor={isContributor}
                className="mb-6"
              />
            </motion.div>

            <Tabs defaultValue="profile" className="space-y-6">
              <TabsList className="w-full overflow-x-auto">
                <TabsTrigger value="profile">{t('editProfile', { defaultValue: 'Edit Profile' })}</TabsTrigger>
                <TabsTrigger value="statistics">{t('statistics.title', { defaultValue: 'Statistics' })}</TabsTrigger>
                <TabsTrigger value="achievements">{t('achievements.title', { defaultValue: 'Achievements' })}</TabsTrigger>
                <TabsTrigger value="settings">{t('preferences.title', { defaultValue: 'Preferences' })}</TabsTrigger>
                <TabsTrigger value="subscription">{t('subscription.title', { defaultValue: 'Subscription' })}</TabsTrigger>
                <TabsTrigger value="data">{t('dataManagement.title', { defaultValue: 'Data Management' })}</TabsTrigger>
              </TabsList>

              <TabsContent value="profile">
                <ErrorBoundary>
                  <ProfileEditor
                    profile={user}
                    onUpdate={() => {}}
                  />
                </ErrorBoundary>
              </TabsContent>

              <TabsContent value="statistics">
                <ErrorBoundary>
                  <StatisticsCard statistics={statistics} />
                </ErrorBoundary>
              </TabsContent>

              <TabsContent value="achievements">
                <ErrorBoundary>
                  <AchievementShowcase />
                </ErrorBoundary>
              </TabsContent>

              <TabsContent value="settings">
                <ErrorBoundary>
                  <SettingsPanel
                    settings={settings}
                    onUpdate={updateSettings}
                    loading={loading}
                  />
                </ErrorBoundary>
              </TabsContent>

              <TabsContent value="subscription">
                <ErrorBoundary>
                  <SubscriptionManager
                    subscription={subscription}
                    onRefresh={refreshSubscription}
                    loading={loading}
                  />
                </ErrorBoundary>
              </TabsContent>

              <TabsContent value="data">
                <ErrorBoundary>
                  <div className="space-y-6">
                    <DataExportPanel
                      onExportData={exportUserData}
                      loading={loading}
                    />
                    <DataDeletionPanel
                      onRequestDeletion={requestAccountDeletion}
                      loading={loading}
                    />
                  </div>
                </ErrorBoundary>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </MainLayout>
    </ErrorBoundary>
  );
};