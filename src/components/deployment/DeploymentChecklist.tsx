import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Clock, 
  ExternalLink,
  RefreshCw,
  Rocket 
} from 'lucide-react';
import { 
  runPreDeploymentChecks, 
  getCriticalFailures, 
  getDeploymentScore,
  type DeploymentCheck 
} from '@/utils/pre-deployment-checks';
import { toast } from 'sonner';

export const DeploymentChecklist: React.FC = () => {
  const [checks, setChecks] = useState<DeploymentCheck[]>([]);
  const [loading, setLoading] = useState(true);
  const [score, setScore] = useState(0);

  const loadChecks = async () => {
    setLoading(true);
    try {
      const results = await runPreDeploymentChecks();
      setChecks(results);
      setScore(getDeploymentScore(results));
    } catch (error) {
      toast.error('Failed to run deployment checks');
      console.error('Deployment checks error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadChecks();
  }, []);

  const criticalFailures = getCriticalFailures(checks);
  const canDeploy = criticalFailures.length === 0;

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pass':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'fail':
        return <XCircle className="h-5 w-5 text-red-600" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
      case 'pending':
        return <Clock className="h-5 w-5 text-gray-400" />;
      default:
        return null;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'critical':
        return 'destructive';
      case 'recommended':
        return 'default';
      case 'optional':
        return 'secondary';
      default:
        return 'default';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <RefreshCw className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overall Status */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Rocket className="h-6 w-6" />
                Pre-Deployment Score
              </CardTitle>
              <CardDescription>
                {canDeploy 
                  ? '✅ All critical checks passed - ready to deploy!' 
                  : `⚠️ ${criticalFailures.length} critical issue${criticalFailures.length !== 1 ? 's' : ''} must be resolved`
                }
              </CardDescription>
            </div>
            <div className="text-right">
              <div className={`text-4xl font-bold ${score >= 90 ? 'text-green-600' : score >= 70 ? 'text-yellow-600' : 'text-red-600'}`}>
                {score}%
              </div>
              <Button variant="ghost" size="sm" onClick={loadChecks} className="mt-2">
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Progress value={score} className="h-3" />
        </CardContent>
      </Card>

      {/* Critical Failures Alert */}
      {criticalFailures.length > 0 && (
        <Alert variant="destructive">
          <XCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Deployment Blocked:</strong> {criticalFailures.length} critical issue{criticalFailures.length !== 1 ? 's' : ''} must be resolved before deploying to production.
          </AlertDescription>
        </Alert>
      )}

      {/* Checks by Category */}
      {['critical', 'recommended', 'optional'].map(category => {
        const categoryChecks = checks.filter(c => c.category === category);
        if (categoryChecks.length === 0) return null;

        return (
          <Card key={category}>
            <CardHeader>
              <CardTitle className="capitalize flex items-center gap-2">
                {category} Checks
                <Badge variant={getCategoryColor(category)}>
                  {categoryChecks.filter(c => c.status === 'pass').length}/{categoryChecks.length}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {categoryChecks.map(check => (
                <div 
                  key={check.id} 
                  className="flex items-start justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-start gap-3 flex-1">
                    {getStatusIcon(check.status)}
                    <div className="flex-1 space-y-1">
                      <div className="font-medium">{check.name}</div>
                      <div className="text-sm text-muted-foreground">{check.description}</div>
                      {check.action && check.status !== 'pass' && (
                        <div className="text-sm text-orange-600 dark:text-orange-400 mt-2">
                          💡 {check.action}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {check.link && (
                      <Button
                        variant="ghost"
                        size="sm"
                        asChild
                      >
                        <a 
                          href={check.link} 
                          target={check.link.startsWith('http') ? '_blank' : undefined}
                          rel={check.link.startsWith('http') ? 'noopener noreferrer' : undefined}
                        >
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        );
      })}

      {/* Deployment Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Ready to Deploy?</CardTitle>
          <CardDescription>
            Follow these steps to deploy your application to production
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <Button 
              className="w-full justify-start" 
              asChild
              disabled={!canDeploy}
              variant={canDeploy ? 'default' : 'secondary'}
            >
              <a href="https://lovable.dev/publish" target="_blank" rel="noopener noreferrer">
                <Rocket className="h-4 w-4 mr-2" />
                Deploy to Production with Lovable
              </a>
            </Button>
            
            <Button variant="outline" className="w-full justify-start" asChild>
              <a href="https://docs.lovable.dev/deployment" target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4 mr-2" />
                View Deployment Documentation
              </a>
            </Button>
          </div>

          {!canDeploy && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Resolve all critical issues above before deploying to production.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
