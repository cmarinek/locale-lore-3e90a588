import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, AlertCircle, Calendar, XCircle } from 'lucide-react';

type FeatureStatus = 'complete' | 'partial' | 'planned' | 'not-planned';

interface Feature {
  name: string;
  status: FeatureStatus;
  details?: string;
  subFeatures?: { name: string; status: FeatureStatus; details?: string }[];
}

const features: Feature[] = [
  {
    name: 'Authentication & User Management',
    status: 'complete',
    subFeatures: [
      { name: 'Email/Password Sign Up & Login', status: 'complete' },
      { name: 'Password Reset Flow', status: 'complete' },
      { name: 'Email Verification', status: 'complete' },
      { name: 'Session Persistence', status: 'complete' },
      { name: 'Protected Routes', status: 'complete' },
      { name: 'OAuth Providers (Google, GitHub)', status: 'planned' },
    ],
  },
  {
    name: 'Role-Based Access Control (RBAC)',
    status: 'complete',
    subFeatures: [
      { name: 'User Roles (Admin, Contributor, User)', status: 'complete' },
      { name: 'Permission System', status: 'complete' },
      { name: 'Route Guards', status: 'complete' },
      { name: 'Admin Dashboard', status: 'complete' },
      { name: 'Role Assignment UI', status: 'complete' },
    ],
  },
  {
    name: 'Map & Geolocation',
    status: 'complete',
    subFeatures: [
      { name: 'Interactive Map (Mapbox)', status: 'complete' },
      { name: 'User Location Detection', status: 'complete' },
      { name: 'Custom Markers', status: 'complete' },
      { name: 'Marker Clustering', status: 'complete' },
      { name: 'Story Markers on Map', status: 'complete' },
      { name: 'Geofencing', status: 'planned' },
    ],
  },
  {
    name: 'Story/Fact Management',
    status: 'complete',
    subFeatures: [
      { name: 'Create Stories/Facts', status: 'complete' },
      { name: 'Edit Stories', status: 'complete' },
      { name: 'Delete Stories', status: 'complete' },
      { name: 'Story Categories', status: 'complete' },
      { name: 'Story Verification System', status: 'complete' },
      { name: 'Media Upload (Images)', status: 'complete' },
      { name: 'Video Upload', status: 'planned' },
    ],
  },
  {
    name: 'Notification System',
    status: 'complete',
    subFeatures: [
      { name: 'In-App Notifications', status: 'complete' },
      { name: 'Email Notifications', status: 'complete' },
      { name: 'Push Notifications', status: 'partial', details: 'PWA support ready, needs server implementation' },
      { name: 'Notification Preferences', status: 'complete' },
      { name: 'Real-time Updates', status: 'complete' },
    ],
  },
  {
    name: 'Privacy & Data Management',
    status: 'complete',
    subFeatures: [
      { name: 'Privacy Settings', status: 'complete' },
      { name: 'Profile Visibility Controls', status: 'complete' },
      { name: 'Data Export (GDPR)', status: 'complete' },
      { name: 'Account Deletion', status: 'complete' },
      { name: 'Cookie Consent', status: 'planned' },
    ],
  },
  {
    name: 'Security Features',
    status: 'complete',
    subFeatures: [
      { name: 'Row Level Security (RLS)', status: 'complete' },
      { name: 'SQL Injection Prevention', status: 'complete' },
      { name: 'XSS Protection', status: 'complete' },
      { name: 'CSRF Protection', status: 'complete' },
      { name: 'Security Monitoring', status: 'complete' },
      { name: 'Rate Limiting', status: 'partial', details: 'Basic implementation, needs edge function enhancement' },
      { name: '2FA/MFA', status: 'planned' },
    ],
  },
  {
    name: 'Social Features',
    status: 'partial',
    details: 'Core infrastructure ready, UI needs completion',
    subFeatures: [
      { name: 'User Profiles', status: 'complete' },
      { name: 'Follow System', status: 'planned' },
      { name: 'Comments', status: 'complete' },
      { name: 'Reactions/Votes', status: 'complete' },
      { name: 'Friend Requests', status: 'planned' },
      { name: 'Direct Messaging', status: 'planned' },
    ],
  },
  {
    name: 'Search & Discovery',
    status: 'partial',
    details: 'Basic search implemented, advanced features pending',
    subFeatures: [
      { name: 'Text Search', status: 'complete' },
      { name: 'Location-Based Search', status: 'complete' },
      { name: 'Filter by Category', status: 'complete' },
      { name: 'Full-Text Search', status: 'planned' },
      { name: 'Search Suggestions', status: 'planned' },
    ],
  },
  {
    name: 'Progressive Web App (PWA)',
    status: 'complete',
    subFeatures: [
      { name: 'Service Worker', status: 'complete' },
      { name: 'Offline Support', status: 'complete' },
      { name: 'Install Prompt', status: 'complete' },
      { name: 'App Manifest', status: 'complete' },
      { name: 'Background Sync', status: 'planned' },
    ],
  },
  {
    name: 'Internationalization (i18n)',
    status: 'complete',
    subFeatures: [
      { name: 'Multi-language Support', status: 'complete' },
      { name: 'Language Switching', status: 'complete' },
      { name: 'RTL Support', status: 'planned' },
    ],
  },
  {
    name: 'Admin Tools',
    status: 'complete',
    subFeatures: [
      { name: 'User Management', status: 'complete' },
      { name: 'Role Assignment', status: 'complete' },
      { name: 'Content Moderation', status: 'complete' },
      { name: 'Fact Acquisition Manager', status: 'complete' },
      { name: 'Translation Manager', status: 'complete' },
      { name: 'Analytics Dashboard', status: 'planned' },
    ],
  },
  {
    name: 'Performance Optimization',
    status: 'complete',
    subFeatures: [
      { name: 'Code Splitting', status: 'complete' },
      { name: 'Lazy Loading', status: 'complete' },
      { name: 'Image Optimization', status: 'complete' },
      { name: 'Caching Strategy', status: 'complete' },
      { name: 'CDN Integration', status: 'complete' },
    ],
  },
  {
    name: 'Testing',
    status: 'complete',
    subFeatures: [
      { name: 'Unit Tests', status: 'complete' },
      { name: 'Integration Tests', status: 'complete' },
      { name: 'E2E Tests', status: 'complete' },
      { name: 'Accessibility Tests', status: 'complete' },
      { name: 'Performance Tests', status: 'complete' },
      { name: 'Visual Regression Tests', status: 'complete' },
    ],
  },
];

const statusConfig: Record<FeatureStatus, { icon: any; color: string; label: string }> = {
  complete: {
    icon: CheckCircle2,
    color: 'bg-green-500/10 text-green-600 dark:text-green-400',
    label: 'Complete',
  },
  partial: {
    icon: AlertCircle,
    color: 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400',
    label: 'Partial',
  },
  planned: {
    icon: Calendar,
    color: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
    label: 'Planned',
  },
  'not-planned': {
    icon: XCircle,
    color: 'bg-gray-500/10 text-gray-600 dark:text-gray-400',
    label: 'Not Planned',
  },
};

const StatusBadge = ({ status }: { status: FeatureStatus }) => {
  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <Badge variant="secondary" className={config.color}>
      <Icon className="w-3 h-3 mr-1" />
      {config.label}
    </Badge>
  );
};

export default function ImplementationStatus() {
  const stats = {
    complete: features.filter(f => f.status === 'complete').length,
    partial: features.filter(f => f.status === 'partial').length,
    planned: features.filter(f => f.status === 'planned').length,
    total: features.length,
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8 px-4 max-w-5xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4">Implementation Status</h1>
          <p className="text-muted-foreground text-lg">
            Transparent overview of all features, their implementation status, and future plans.
          </p>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Features</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-green-600 dark:text-green-400">Complete</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.complete}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-yellow-600 dark:text-yellow-400">Partial</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.partial}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-blue-600 dark:text-blue-400">Planned</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.planned}</div>
            </CardContent>
          </Card>
        </div>

        {/* Feature List */}
        <div className="space-y-6">
          {features.map((feature) => (
            <Card key={feature.name}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-xl mb-2">{feature.name}</CardTitle>
                    {feature.details && (
                      <CardDescription className="text-sm">{feature.details}</CardDescription>
                    )}
                  </div>
                  <StatusBadge status={feature.status} />
                </div>
              </CardHeader>
              {feature.subFeatures && (
                <CardContent>
                  <div className="space-y-2">
                    {feature.subFeatures.map((sub) => (
                      <div
                        key={sub.name}
                        className="flex items-center justify-between py-2 px-3 rounded-md hover:bg-muted/50 transition-colors"
                      >
                        <span className="text-sm">{sub.name}</span>
                        <StatusBadge status={sub.status} />
                      </div>
                    ))}
                  </div>
                </CardContent>
              )}
            </Card>
          ))}
        </div>

        {/* Legend */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Status Legend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5" />
                <div>
                  <div className="font-medium">Complete</div>
                  <div className="text-sm text-muted-foreground">
                    Fully implemented, tested, and production-ready
                  </div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
                <div>
                  <div className="font-medium">Partial</div>
                  <div className="text-sm text-muted-foreground">
                    Core functionality implemented, some features pending
                  </div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                <div>
                  <div className="font-medium">Planned</div>
                  <div className="text-sm text-muted-foreground">
                    Scheduled for future development
                  </div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <XCircle className="w-5 h-5 text-gray-600 dark:text-gray-400 mt-0.5" />
                <div>
                  <div className="font-medium">Not Planned</div>
                  <div className="text-sm text-muted-foreground">
                    Not currently on the development roadmap
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
