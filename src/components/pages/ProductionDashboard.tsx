import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { CheckCircle, AlertTriangle, XCircle, RefreshCw } from 'lucide-react';
import { runProductionReadinessChecks, getProductionReadinessScore, getCriticalIssues } from '@/utils/production-checks';

export const ProductionDashboard = () => {
  const [checks, setChecks] = React.useState(runProductionReadinessChecks());
  const [score, setScore] = React.useState(getProductionReadinessScore());
  const [criticalIssues, setCriticalIssues] = React.useState(getCriticalIssues());

  const refreshChecks = () => {
    const newChecks = runProductionReadinessChecks();
    setChecks(newChecks);
    setScore(getProductionReadinessScore());
    setCriticalIssues(getCriticalIssues());
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pass':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'fail':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pass':
        return <Badge variant="default" className="bg-green-100 text-green-800">Pass</Badge>;
      case 'warning':
        return <Badge variant="default" className="bg-yellow-100 text-yellow-800">Warning</Badge>;
      case 'fail':
        return <Badge variant="destructive">Fail</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Production Readiness Dashboard</h1>
        <Button onClick={refreshChecks} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh Checks
        </Button>
      </div>

      {/* Overall Score */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Production Readiness Score
            <Badge variant={score >= 80 ? "default" : score >= 60 ? "secondary" : "destructive"}>
              {score}%
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Progress value={score} className="mb-4" />
          <p className="text-sm text-muted-foreground">
            {score >= 80 && "Excellent! Your application is ready for production."}
            {score >= 60 && score < 80 && "Good progress! Address the remaining issues before production."}
            {score < 60 && "Critical issues need to be resolved before production deployment."}
          </p>
          
          {criticalIssues.length > 0 && (
            <div className="mt-4 p-4 bg-red-50 rounded-lg">
              <h4 className="font-semibold text-red-800 mb-2">Critical Issues ({criticalIssues.length})</h4>
              <ul className="text-sm text-red-700 space-y-1">
                {criticalIssues.map((issue, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <XCircle className="h-4 w-4" />
                    {issue.message}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Detailed Checks */}
      <Card>
        <CardHeader>
          <CardTitle>Detailed Checks</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {checks.map((check, index) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  {getStatusIcon(check.status)}
                  <div>
                    <h4 className="font-medium">{check.name}</h4>
                    <p className="text-sm text-muted-foreground">{check.message}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {check.critical && (
                    <Badge variant="outline" className="text-xs">Critical</Badge>
                  )}
                  {getStatusBadge(check.status)}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle>Next Steps</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-start gap-2">
              <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
              <div>
                <h4 className="font-medium">✅ Completed</h4>
                <p className="text-sm text-muted-foreground">
                  Error monitoring, security headers, and production configuration have been implemented.
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-500 mt-0.5" />
              <div>
                <h4 className="font-medium">🚀 Ready for Final Testing</h4>
                <p className="text-sm text-muted-foreground">
                  Run comprehensive testing including E2E, performance, and security tests before production deployment.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};