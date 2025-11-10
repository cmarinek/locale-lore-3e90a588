import React from 'react';
import { MainLayout } from '@/components/templates/MainLayout';
import { useProfile } from '@/hooks/useProfile';
import { DataExportPanel } from '@/components/profile/DataExportPanel';
import { DataDeletionPanel } from '@/components/profile/DataDeletionPanel';
import { ErrorBoundary } from '@/components/ui/error-boundary';
import { motion } from 'framer-motion';
import { Shield } from 'lucide-react';
import { useTranslation } from 'react-i18next';

/**
 * Privacy Settings Page
 * 
 * GDPR-compliant privacy management interface providing:
 * - Data export (Right to Access & Portability)
 * - Account deletion with 30-day grace period (Right to Erasure)
 * - Information about data rights
 */
export default function PrivacySettings() {
  const { t } = useTranslation('profile');
  const {
    loading,
    exportUserData,
    requestAccountDeletion,
  } = useProfile();

  return (
    <ErrorBoundary>
      <MainLayout>
        <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-primary/5">
          <div className="container mx-auto px-4 py-8 max-w-4xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8"
            >
              <div className="flex items-center gap-3 mb-2">
                <Shield className="h-8 w-8 text-primary" />
                <h1 className="text-3xl font-bold">
                  {t('dataManagement.title', { defaultValue: 'Privacy & Data Management' })}
                </h1>
              </div>
              <p className="text-muted-foreground">
                {t('dataManagement.description', { 
                  defaultValue: 'Manage your personal data and exercise your privacy rights under GDPR.' 
                })}
              </p>
            </motion.div>

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
          </div>
        </div>
      </MainLayout>
    </ErrorBoundary>
  );
}
