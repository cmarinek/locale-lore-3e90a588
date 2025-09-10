import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Download, Shield, FileText, Database, Image, MessageSquare } from 'lucide-react';
import { useTranslation } from '@/hooks/useSafeTranslation';

interface DataExportPanelProps {
  onExportData: () => Promise<void>;
  loading: boolean;
}

export const DataExportPanel = ({ onExportData, loading }: DataExportPanelProps) => {
  const { t } = useTranslation('profile');

  const exportTypes = [
    {
      icon: FileText,
      label: 'Profile Information',
      description: 'Username, bio, settings, and account details',
    },
    {
      icon: Database,
      label: 'Submitted Content',
      description: 'Facts, stories, and comments you\'ve created',
    },
    {
      icon: MessageSquare,
      label: 'Activity History',
      description: 'Votes, reactions, and interaction history',
    },
    {
      icon: Image,
      label: 'Media Files',
      description: 'Uploaded images and profile pictures',
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Download className="h-5 w-5" />
          {t('dataManagement.exportData', { defaultValue: 'Export Your Data' })}
        </CardTitle>
        <CardDescription>
          {t('dataManagement.exportDescription', { 
            defaultValue: 'Download a complete copy of all your data including profile, content, and activity history.' 
          })}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Alert>
          <Shield className="h-4 w-4" />
          <AlertDescription>
            Your export will include all the data types listed below. Files will be provided in JSON format for easy access and portability.
          </AlertDescription>
        </Alert>

        <div className="grid gap-4 md:grid-cols-2">
          {exportTypes.map((type, index) => {
            const Icon = type.icon;
            return (
              <div key={index} className="flex items-start gap-3 p-3 border rounded-lg">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Icon className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-sm">{type.label}</h4>
                  <p className="text-xs text-muted-foreground">{type.description}</p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="space-y-4">
          <Alert>
            <FileText className="h-4 w-4" />
            <AlertDescription className="space-y-2">
              <p><strong>Export Format:</strong> Your data will be downloaded as a ZIP file containing JSON files for each data type.</p>
              <p><strong>Processing Time:</strong> Large exports may take a few minutes to prepare. You'll receive a download link when ready.</p>
              <p><strong>Data Security:</strong> Export links expire after 24 hours for your security.</p>
            </AlertDescription>
          </Alert>
          
          <Button 
            onClick={onExportData} 
            disabled={loading}
            className="w-full"
            size="lg"
          >
            <Download className="h-4 w-4 mr-2" />
            {loading ? 
              t('dataManagement.exportInProgress', { defaultValue: 'Preparing Export...' }) : 
              t('dataManagement.downloadData', { defaultValue: 'Download My Data' })
            }
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};