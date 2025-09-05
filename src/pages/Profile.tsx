import React from 'react';
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
import { useAuth } from '@/contexts/AuthContext';
import { motion } from 'framer-motion';
import { useTranslation } from '@/hooks/useTranslation';

export const Profile: React.FC = () => {
  const { id } = useParams<{ id?: string }>();
  const { user } = useAuth();
  const { t } = useTranslation('profile');
  
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
                {t('myProfile')}
              </h1>
            </div>
          </motion.div>

          <Tabs defaultValue="profile" className="space-y-6">
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="profile">{t('editProfile')}</TabsTrigger>
              <TabsTrigger value="statistics">{t('statistics.title', { defaultValue: 'Statistics' })}</TabsTrigger>
              <TabsTrigger value="achievements">{t('achievements.title')}</TabsTrigger>
              <TabsTrigger value="settings">{t('preferences.title')}</TabsTrigger>
              <TabsTrigger value="subscription">Subscription</TabsTrigger>
              <TabsTrigger value="data">{t('dataManagement.title')}</TabsTrigger>
            </TabsList>

            <TabsContent value="profile">
              <ProfileEditor
                profile={user}
                onUpdate={() => {}}
              />
            </TabsContent>

            <TabsContent value="statistics">
              <StatisticsCard statistics={statistics} />
            </TabsContent>

            <TabsContent value="achievements">
              <AchievementShowcase />
            </TabsContent>

            <TabsContent value="settings">
              <SettingsPanel
                settings={settings}
                onUpdate={updateSettings}
                loading={loading}
              />
            </TabsContent>

            <TabsContent value="subscription">
              <SubscriptionManager
                subscription={subscription}
                onRefresh={refreshSubscription}
                loading={loading}
              />
            </TabsContent>

            <TabsContent value="data">
              <DataDeletionPanel
                onExportData={exportUserData}
                loading={loading}
              />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </MainLayout>
  );
};