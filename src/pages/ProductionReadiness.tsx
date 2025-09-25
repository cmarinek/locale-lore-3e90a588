import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { MainLayout } from '@/components/templates/MainLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  runProductionReadinessChecks, 
  getProductionReadinessScore, 
  getCriticalIssues,
  getChecksByCategory,
  getDeploymentChecklist,
  ProductionReadinessCheck 
} from '@/utils/production-checks';
import { 
  CheckCircle, 
  AlertTriangle, 
  XCircle, 
  Rocket, 
  Shield, 
  Zap, 
  Scale, 
  Monitor, 
  Smartphone, 
  Search,
  Globe,
  ExternalLink
} from 'lucide-react';

export const ProductionReadiness = () => {
  // v16 - Fixed TDZ errors by moving icon mappings into component
  const categoryIcons = useMemo(() => ({
    security: Shield,
    performance: Zap,
    legal: Scale,
    monitoring: Monitor,
    mobile: Smartphone,
    seo: Search
  }), []);

  const categoryColors = useMemo(() => ({
    security: 'text-red-600',
    performance: 'text-blue-600',
    legal: 'text-purple-600',
    monitoring: 'text-green-600',
    mobile: 'text-orange-600',
    seo: 'text-indigo-600'
  }), []);
  const [checks, setChecks] = useState<ProductionReadinessCheck[]>([]);
  const [score, setScore] = useState(0);
  const [criticalIssues, setCriticalIssues] = useState<ProductionReadinessCheck[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadChecks = () => {
      try {
        const allChecks = runProductionReadinessChecks();
        const currentScore = getProductionReadinessScore();
        const issues = getCriticalIssues();

        setChecks(allChecks);
        setScore(currentScore);
        setCriticalIssues(issues);
      } catch (error) {
        console.error('Failed to load production checks:', error);
      } finally {
        setLoading(false);
      }
    };

    loadChecks();
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pass':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
      case 'fail':
        return <XCircle className="h-5 w-5 text-red-600" />;
      default:
        return null;
    }
  };

  const getScoreColor = () => {
    if (score >= 90) return 'text-green-600';
    if (score >= 80) return 'text-blue-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const renderChecksByCategory = (category: string) => {
    const categoryChecks = getChecksByCategory(category);
    const Icon = categoryIcons[category as keyof typeof categoryIcons];
    const colorClass = categoryColors[category as keyof typeof categoryColors];

    return (
      <Card key={category}>
        <CardHeader>
          <CardTitle className={`flex items-center gap-2 capitalize ${colorClass}`}>
            <Icon className="h-5 w-5" />
            {category}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {categoryChecks.map((check, index) => (
            <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  {getStatusIcon(check.status)}
                  <span className="font-medium">{check.name}</span>
                  {check.critical && (
                    <Badge variant="destructive" className="text-xs">Critical</Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">{check.message}</p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading production readiness...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <Helmet>
        <title>Production Readiness | Locale Lore</title>
        <meta name="description" content="Production readiness dashboard and deployment checklist for Locale Lore." />
      </Helmet>

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="space-y-8">
          {/* Header */}
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center gap-2 text-primary">
              <Rocket className="h-8 w-8" />
              <h1 className="text-4xl font-bold">Production Readiness</h1>
            </div>
            <p className="text-muted-foreground text-lg">
              Comprehensive production deployment assessment and guidance
            </p>
          </div>

          {/* Score Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Overall Readiness Score</span>
                <span className={`text-3xl font-bold ${getScoreColor()}`}>
                  {score}%
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Progress value={score} className="h-4" />
              
              {criticalIssues.length > 0 && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>{criticalIssues.length} critical issue{criticalIssues.length !== 1 ? 's' : ''}</strong> must be resolved before production deployment.
                  </AlertDescription>
                </Alert>
              )}

              {score >= 90 && (
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Production Ready!</strong> Your application meets all production requirements.
                  </AlertDescription>
                </Alert>
              )}

              <div className="grid md:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {checks.filter(c => c.status === 'pass').length}
                  </div>
                  <p className="text-sm text-muted-foreground">Passing</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-600">
                    {checks.filter(c => c.status === 'warning').length}
                  </div>
                  <p className="text-sm text-muted-foreground">Warnings</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">
                    {checks.filter(c => c.status === 'fail').length}
                  </div>
                  <p className="text-sm text-muted-foreground">Failed</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Detailed Checks */}
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid w-full grid-cols-8">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="security">Security</TabsTrigger>
              <TabsTrigger value="performance">Performance</TabsTrigger>
              <TabsTrigger value="legal">Legal</TabsTrigger>
              <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
              <TabsTrigger value="mobile">Mobile</TabsTrigger>
              <TabsTrigger value="seo">SEO</TabsTrigger>
              <TabsTrigger value="deploy">Deploy</TabsTrigger>
            </TabsList>

            <TabsContent value="overview">
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Object.keys(categoryIcons).map(category => renderChecksByCategory(category))}
              </div>
            </TabsContent>

            {Object.keys(categoryIcons).map(category => (
              <TabsContent key={category} value={category}>
                <div className="space-y-6">
                  {renderChecksByCategory(category)}
                </div>
              </TabsContent>
            ))}

            <TabsContent value="deploy">
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Globe className="h-5 w-5" />
                      Deployment Checklist
                    </CardTitle>
                    <CardDescription>
                      Step-by-step guide for production deployment
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {getDeploymentChecklist().map((section, index) => (
                      <div key={index} className="space-y-3">
                        <h3 className="font-semibold text-lg border-b pb-2">
                          {section.category}
                        </h3>
                        <div className="space-y-2">
                          {section.items.map((item, itemIndex) => (
                            <div key={itemIndex} className="flex items-center gap-3">
                              <input 
                                type="checkbox" 
                                className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary" 
                              />
                              <span className="text-sm">{item}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Next Steps</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <Button asChild className="w-full justify-start">
                        <a href="https://lovable.dev/publish" target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-4 w-4 mr-2" />
                          Deploy to Production with Lovable
                        </a>
                      </Button>
                      
                      <Button variant="outline" asChild className="w-full justify-start">
                        <a href="https://docs.lovable.dev" target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-4 w-4 mr-2" />
                          Read Deployment Documentation
                        </a>
                      </Button>

                      <Button variant="outline" asChild className="w-full justify-start">
                        <Link to="/admin" className="flex items-center">
                          <Monitor className="h-4 w-4 mr-2" />
                          Open Admin Dashboard
                        </Link>
                      </Button>
                    </div>

                    <Alert>
                      <Rocket className="h-4 w-4" />
                      <AlertDescription>
                        <strong>Ready to launch?</strong> Consider setting up monitoring, custom domain, 
                        and mobile app distribution after initial deployment.
                      </AlertDescription>
                    </Alert>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </MainLayout>
  );
};