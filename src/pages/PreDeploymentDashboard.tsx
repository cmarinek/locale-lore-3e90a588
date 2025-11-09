import React from 'react';
import { Helmet } from 'react-helmet-async';
import { MainLayout } from '@/components/templates/MainLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DeploymentChecklist } from '@/components/deployment/DeploymentChecklist';
import { ApiRateLimitMonitor } from '@/components/monitoring/ApiRateLimitMonitor';
import { SecurityAuditPanel } from '@/components/monitoring/SecurityAuditPanel';
import { LoadTestingDashboard } from '@/components/performance/LoadTestingDashboard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Rocket, 
  Shield, 
  Activity, 
  Zap, 
  Database, 
  Globe,
  ExternalLink 
} from 'lucide-react';

export const PreDeploymentDashboard = () => {
  return (
    <MainLayout>
      <Helmet>
        <title>Pre-Deployment Dashboard | Locale Lore</title>
        <meta name="description" content="Complete pre-deployment checklist and production readiness dashboard" />
      </Helmet>

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="space-y-8">
          {/* Header */}
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center gap-2 text-primary">
              <Rocket className="h-8 w-8" />
              <h1 className="text-4xl font-bold">Pre-Deployment Dashboard</h1>
            </div>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Complete all checks before deploying to production
            </p>
          </div>

          <Tabs defaultValue="checklist" className="space-y-6">
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="checklist">
                <Rocket className="h-4 w-4 mr-2" />
                Checklist
              </TabsTrigger>
              <TabsTrigger value="security">
                <Shield className="h-4 w-4 mr-2" />
                Security
              </TabsTrigger>
              <TabsTrigger value="performance">
                <Zap className="h-4 w-4 mr-2" />
                Performance
              </TabsTrigger>
              <TabsTrigger value="api-limits">
                <Activity className="h-4 w-4 mr-2" />
                API Limits
              </TabsTrigger>
              <TabsTrigger value="database">
                <Database className="h-4 w-4 mr-2" />
                Database
              </TabsTrigger>
              <TabsTrigger value="domain">
                <Globe className="h-4 w-4 mr-2" />
                Domain
              </TabsTrigger>
            </TabsList>

            {/* Deployment Checklist */}
            <TabsContent value="checklist">
              <DeploymentChecklist />
            </TabsContent>

            {/* Security Audit */}
            <TabsContent value="security">
              <SecurityAuditPanel />
            </TabsContent>

            {/* Performance & Load Testing */}
            <TabsContent value="performance">
              <LoadTestingDashboard />
            </TabsContent>

            {/* API Rate Limits */}
            <TabsContent value="api-limits">
              <ApiRateLimitMonitor />
            </TabsContent>

            {/* Database Configuration */}
            <TabsContent value="database">
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Database Configuration</CardTitle>
                    <CardDescription>
                      Verify database settings before production deployment
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="p-4 border rounded-lg">
                        <h4 className="font-semibold mb-2">Connection Pooling</h4>
                        <p className="text-sm text-muted-foreground mb-3">
                          Ensure connection pooling is configured for optimal performance
                        </p>
                        <Button variant="outline" size="sm" asChild>
                          <a href="https://supabase.com/dashboard" target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="h-4 w-4 mr-2" />
                            Configure in Supabase
                          </a>
                        </Button>
                      </div>

                      <div className="p-4 border rounded-lg">
                        <h4 className="font-semibold mb-2">Backup Strategy</h4>
                        <p className="text-sm text-muted-foreground mb-3">
                          Enable automated daily backups with point-in-time recovery
                        </p>
                        <Button variant="outline" size="sm" asChild>
                          <a href="https://supabase.com/dashboard" target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="h-4 w-4 mr-2" />
                            Enable Backups
                          </a>
                        </Button>
                      </div>

                      <div className="p-4 border rounded-lg">
                        <h4 className="font-semibold mb-2">RLS Policies</h4>
                        <p className="text-sm text-muted-foreground mb-3">
                          All tables have Row Level Security enabled
                        </p>
                        <Button variant="outline" size="sm" asChild>
                          <a href="/admin/security" target="_blank">
                            <Shield className="h-4 w-4 mr-2" />
                            Review Security
                          </a>
                        </Button>
                      </div>

                      <div className="p-4 border rounded-lg">
                        <h4 className="font-semibold mb-2">Database Indexes</h4>
                        <p className="text-sm text-muted-foreground mb-3">
                          Optimize query performance with proper indexes
                        </p>
                        <Button variant="outline" size="sm" asChild>
                          <a href="https://supabase.com/dashboard" target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="h-4 w-4 mr-2" />
                            Check Indexes
                          </a>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Custom Domain Setup */}
            <TabsContent value="domain">
              <Card>
                <CardHeader>
                  <CardTitle>Custom Domain Configuration</CardTitle>
                  <CardDescription>
                    Connect your production domain to Lovable
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="p-4 bg-muted rounded-lg">
                      <h4 className="font-semibold mb-2">Step 1: Add Domain in Lovable</h4>
                      <p className="text-sm text-muted-foreground mb-3">
                        Go to your project settings and click "Connect Domain"
                      </p>
                      <Button asChild>
                        <a href="https://lovable.dev/projects" target="_blank" rel="noopener noreferrer">
                          <Globe className="h-4 w-4 mr-2" />
                          Open Lovable Dashboard
                        </a>
                      </Button>
                    </div>

                    <div className="p-4 bg-muted rounded-lg">
                      <h4 className="font-semibold mb-2">Step 2: Configure DNS Records</h4>
                      <p className="text-sm text-muted-foreground mb-3">
                        Add these records at your domain registrar:
                      </p>
                      <div className="space-y-2 text-sm font-mono bg-background p-3 rounded border">
                        <div>A Record: @ → 185.158.133.1</div>
                        <div>A Record: www → 185.158.133.1</div>
                        <div>TXT Record: _lovable → lovable_verify=...</div>
                      </div>
                    </div>

                    <div className="p-4 bg-muted rounded-lg">
                      <h4 className="font-semibold mb-2">Step 3: Wait for SSL</h4>
                      <p className="text-sm text-muted-foreground">
                        DNS propagation and SSL certificate provisioning can take up to 72 hours. 
                        Lovable will automatically configure HTTPS for your domain.
                      </p>
                    </div>

                    <Button variant="outline" asChild className="w-full">
                      <a href="https://docs.lovable.dev/features/custom-domain" target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-4 w-4 mr-2" />
                        View Detailed Documentation
                      </a>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </MainLayout>
  );
};
