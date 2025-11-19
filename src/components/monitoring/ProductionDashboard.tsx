
import React, { useEffect, useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Activity, AlertTriangle, CheckCircle, Clock, Database, Globe, Shield, Zap } from 'lucide-react';
import { config } from '@/config/environments';
import { analytics } from '@/utils/analytics';
import { trackMetric } from '@/utils/monitoring';

interface SystemMetrics {
  webVitals: {
    lcp: number;
    fid: number;
    cls: number;
  };
  errors: {
    count: number;
    rate: number;
  };
  performance: {
    loadTime: number;
    ttfb: number;
  };
  security: {
    cspViolations: number;
    httpsStatus: boolean;
  };
  deployment: {
    environment: string;
    version: string;
    lastDeploy: string;
  };
}

export const ProductionDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<SystemMetrics>({
    webVitals: { lcp: 0, fid: 0, cls: 0 },
    errors: { count: 0, rate: 0 },
    performance: { loadTime: 0, ttfb: 0 },
    security: { cspViolations: 0, httpsStatus: true },
    deployment: {
      environment: config.environment,
      version: '1.0.0',
      lastDeploy: new Date().toISOString()
    }
  });

  const [alerts, setAlerts] = useState<Array<{
    id: string;
    type: 'error' | 'warning' | 'info';
    message: string;
    timestamp: string;
  }>>([]);

  useEffect(() => {
    // Simulate real-time metrics collection
    const interval = setInterval(() => {
      // Collect Web Vitals
      if ('performance' in window) {
        const navigation = performance.getEntriesByType('navigation')[0];
        
        const newMetrics: SystemMetrics = {
          webVitals: {
            lcp: Math.random() * 2500 + 1000, // 1-3.5s
            fid: Math.random() * 100 + 50,    // 50-150ms
            cls: Math.random() * 0.2          // 0-0.2
          },
          errors: {
            count: Math.floor(Math.random() * 5),
            rate: Math.random() * 0.01 // 0-1%
          },
          performance: {
            loadTime: navigation ? navigation.loadEventEnd - navigation.fetchStart : 0,
            ttfb: navigation ? navigation.responseStart - navigation.requestStart : 0
          },
          security: {
            cspViolations: Math.floor(Math.random() * 3),
            httpsStatus: window.location.protocol === 'https:'
          },
          deployment: {
            environment: config.environment,
            version: '1.0.0',
            lastDeploy: new Date().toISOString()
          }
        };

        setMetrics(newMetrics);

        // Track metrics
        trackMetric('dashboard_lcp', newMetrics.webVitals.lcp);
        trackMetric('dashboard_fid', newMetrics.webVitals.fid);
        trackMetric('dashboard_cls', newMetrics.webVitals.cls);

        // Generate alerts based on thresholds
        const newAlerts: typeof alerts = [];
        
        if (newMetrics.webVitals.lcp > 2500) {
          newAlerts.push({
            id: 'lcp-alert',
            type: 'warning',
            message: 'LCP exceeds 2.5s threshold',
            timestamp: new Date().toISOString()
          });
        }

        if (newMetrics.errors.rate > 0.005) {
          newAlerts.push({
            id: 'error-rate-alert',
            type: 'error',
            message: 'Error rate exceeds 0.5% threshold',
            timestamp: new Date().toISOString()
          });
        }

        if (newMetrics.security.cspViolations > 0) {
          newAlerts.push({
            id: 'csp-alert',
            type: 'warning',
            message: `${newMetrics.security.cspViolations} CSP violations detected`,
            timestamp: new Date().toISOString()
          });
        }

        setAlerts(prev => [...newAlerts, ...prev.slice(0, 5)]);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (value: number, thresholds: { good: number; poor: number }) => {
    if (value <= thresholds.good) return 'text-green-600';
    if (value <= thresholds.poor) return 'text-yellow-600';
    return 'text-red-600';
  };

  // Move icon references inside function to avoid TDZ - v15
  const getStatusBadge = useCallback((status: 'healthy' | 'warning' | 'error') => {
    const variants = {
      healthy: { variant: 'default' as const, icon: CheckCircle, color: 'text-green-600' },
      warning: { variant: 'secondary' as const, icon: AlertTriangle, color: 'text-yellow-600' },
      error: { variant: 'destructive' as const, icon: AlertTriangle, color: 'text-red-600' }
    };
    
    const { variant, icon: Icon, color } = variants[status];
    
    return (
      <Badge variant={variant} className="flex items-center gap-1">
        <Icon className={`h-3 w-3 ${color}`} />
        {status}
      </Badge>
    );
  }, []);

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Production Monitoring</h1>
          <p className="text-muted-foreground">Real-time system health and performance metrics</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline">{metrics.deployment.environment}</Badge>
          <Badge variant="outline">v{metrics.deployment.version}</Badge>
        </div>
      </div>

      {/* System Status Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Health</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {getStatusBadge(
                metrics.errors.rate > 0.005 ? 'error' : 
                metrics.webVitals.lcp > 2500 ? 'warning' : 'healthy'
              )}
              <p className="text-xs text-muted-foreground">
                Last updated: {new Date().toLocaleTimeString()}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Performance</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              <span className={getStatusColor(metrics.webVitals.lcp, { good: 2500, poor: 4000 })}>
                {Math.round(metrics.webVitals.lcp)}ms
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              Largest Contentful Paint
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Error Rate</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              <span className={getStatusColor(metrics.errors.rate * 100, { good: 0.1, poor: 0.5 })}>
                {(metrics.errors.rate * 100).toFixed(2)}%
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              {metrics.errors.count} errors in last hour
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Security</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {getStatusBadge(
                !metrics.security.httpsStatus ? 'error' :
                metrics.security.cspViolations > 0 ? 'warning' : 'healthy'
              )}
              <p className="text-xs text-muted-foreground">
                HTTPS: {metrics.security.httpsStatus ? '✓' : '✗'}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Web Vitals Detail */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Largest Contentful Paint (LCP)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              <span className={getStatusColor(metrics.webVitals.lcp, { good: 2500, poor: 4000 })}>
                {Math.round(metrics.webVitals.lcp)}ms
              </span>
            </div>
            <div className="mt-2 text-xs text-muted-foreground">
              Target: &lt; 2.5s | Poor: &gt; 4s
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">First Input Delay (FID)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              <span className={getStatusColor(metrics.webVitals.fid, { good: 100, poor: 300 })}>
                {Math.round(metrics.webVitals.fid)}ms
              </span>
            </div>
            <div className="mt-2 text-xs text-muted-foreground">
              Target: &lt; 100ms | Poor: &gt; 300ms
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Cumulative Layout Shift (CLS)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              <span className={getStatusColor(metrics.webVitals.cls, { good: 0.1, poor: 0.25 })}>
                {metrics.webVitals.cls.toFixed(3)}
              </span>
            </div>
            <div className="mt-2 text-xs text-muted-foreground">
              Target: &lt; 0.1 | Poor: &gt; 0.25
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Alerts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            Recent Alerts
          </CardTitle>
        </CardHeader>
        <CardContent>
          {alerts.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">No recent alerts</p>
          ) : (
            <div className="space-y-2">
              {alerts.map((alert) => (
                <div key={alert.id} className="flex items-center justify-between p-2 border rounded">
                  <div className="flex items-center gap-2">
                    <Badge variant={alert.type === 'error' ? 'destructive' : 'secondary'}>
                      {alert.type}
                    </Badge>
                    <span className="text-sm">{alert.message}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {new Date(alert.timestamp).toLocaleTimeString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm">
              <Database className="h-3 w-3 mr-1" />
              Database Status
            </Button>
            <Button variant="outline" size="sm">
              <Globe className="h-3 w-3 mr-1" />
              CDN Status
            </Button>
            <Button variant="outline" size="sm">
              <Activity className="h-3 w-3 mr-1" />
              View Logs
            </Button>
            <Button variant="outline" size="sm">
              <Shield className="h-3 w-3 mr-1" />
              Security Scan
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
