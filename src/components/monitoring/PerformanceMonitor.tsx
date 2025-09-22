
import React, { useEffect, useState, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Activity, Zap, Globe, Image, Clock, AlertTriangle, CheckCircle } from 'lucide-react';
import { trackMetric } from '@/utils/monitoring';
import { useAdmin } from '@/hooks/useAdmin';
import { toast } from '@/hooks/use-toast';

interface PerformanceMetrics {
  lcp: number;
  fid: number;
  cls: number;
  fcp: number;
  ttfb: number;
  loadTime: number;
  memoryUsage?: number;
  domNodes?: number;
  jsHeapSize?: number;
}

interface PerformanceAlert {
  type: 'warning' | 'error';
  metric: string;
  value: number;
  threshold: number;
  message: string;
}

export const PerformanceMonitor: React.FC = () => {
  const [metrics, setMetrics] = useState<Partial<PerformanceMetrics>>({});
  const [isVisible, setIsVisible] = useState(false);
  const [alerts, setAlerts] = useState<PerformanceAlert[]>([]);
  const [overallScore, setOverallScore] = useState<'good' | 'poor' | 'needs-improvement'>('good');
  const { isAdmin, loading } = useAdmin();

  // Enhanced performance monitoring with alerts
  const checkPerformanceThresholds = useCallback((newMetrics: Partial<PerformanceMetrics>) => {
    const newAlerts: PerformanceAlert[] = [];
    
    // Check LCP (Largest Contentful Paint)
    if (newMetrics.lcp && newMetrics.lcp > 4000) {
      newAlerts.push({
        type: 'error',
        metric: 'LCP',
        value: newMetrics.lcp,
        threshold: 4000,
        message: 'Largest Contentful Paint is too slow'
      });
    } else if (newMetrics.lcp && newMetrics.lcp > 2500) {
      newAlerts.push({
        type: 'warning',
        metric: 'LCP',
        value: newMetrics.lcp,
        threshold: 2500,
        message: 'Largest Contentful Paint needs improvement'
      });
    }

    // Check CLS (Cumulative Layout Shift)
    if (newMetrics.cls && newMetrics.cls > 0.25) {
      newAlerts.push({
        type: 'error',
        metric: 'CLS',
        value: newMetrics.cls,
        threshold: 0.25,
        message: 'Too much layout shift detected'
      });
    }

    // Check memory usage
    if (newMetrics.memoryUsage && newMetrics.memoryUsage > 50) {
      newAlerts.push({
        type: 'warning',
        metric: 'Memory',
        value: newMetrics.memoryUsage,
        threshold: 50,
        message: 'High memory usage detected'
      });
    }

    setAlerts(newAlerts);

    // Calculate overall score
    const scores = [];
    if (newMetrics.lcp) scores.push(newMetrics.lcp <= 2500 ? 2 : newMetrics.lcp <= 4000 ? 1 : 0);
    if (newMetrics.fid) scores.push(newMetrics.fid <= 100 ? 2 : newMetrics.fid <= 300 ? 1 : 0);
    if (newMetrics.cls !== undefined) scores.push(newMetrics.cls <= 0.1 ? 2 : newMetrics.cls <= 0.25 ? 1 : 0);
    
    const avgScore = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 2;
    setOverallScore(avgScore >= 1.5 ? 'good' : avgScore >= 0.5 ? 'needs-improvement' : 'poor');
  }, []);

  useEffect(() => {
    // Show in development or to admins in production
    if (process.env.NODE_ENV !== 'development' && !isAdmin) return;

    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const newMetrics: Partial<PerformanceMetrics> = {};

      entries.forEach((entry) => {
        switch (entry.entryType) {
          case 'largest-contentful-paint':
            newMetrics.lcp = entry.startTime;
            trackMetric('lcp', entry.startTime);
            break;
          case 'first-input':
            newMetrics.fid = (entry as any).processingStart - entry.startTime;
            trackMetric('fid', newMetrics.fid);
            break;
          case 'layout-shift':
            if (!(entry as any).hadRecentInput) {
              newMetrics.cls = (newMetrics.cls || 0) + (entry as any).value;
              trackMetric('cls', newMetrics.cls);
            }
            break;
        }
      });

      // Get navigation timing metrics
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      if (navigation) {
        newMetrics.fcp = navigation.responseStart - navigation.fetchStart;
        newMetrics.ttfb = navigation.responseStart - navigation.requestStart;
        newMetrics.loadTime = navigation.loadEventEnd - navigation.fetchStart;
        
        trackMetric('fcp', newMetrics.fcp);
        trackMetric('ttfb', newMetrics.ttfb);
        trackMetric('loadTime', newMetrics.loadTime);
      }

      // Get memory metrics
      if ('memory' in performance) {
        const memory = (performance as any).memory;
        newMetrics.memoryUsage = Math.round(memory.usedJSHeapSize / 1024 / 1024);
        newMetrics.jsHeapSize = Math.round(memory.totalJSHeapSize / 1024 / 1024);
      }

      // Get DOM complexity
      newMetrics.domNodes = document.querySelectorAll('*').length;

      setMetrics(prev => {
        const finalMetrics = { ...prev, ...newMetrics };
        checkPerformanceThresholds(finalMetrics);
        return finalMetrics;
      });
    });

    observer.observe({ entryTypes: ['largest-contentful-paint', 'first-input', 'layout-shift'] });

    // Show after a delay
    setTimeout(() => setIsVisible(true), 2000);

    return () => observer.disconnect();
  }, [checkPerformanceThresholds]);

  // Show critical alerts as toasts
  useEffect(() => {
    alerts.forEach(alert => {
      if (alert.type === 'error') {
        toast({
          title: "Performance Issue",
          description: alert.message,
          variant: "destructive",
        });
      }
    });
  }, [alerts]);

  // Only show to admins or in development
  if (!isVisible || Object.keys(metrics).length === 0 || loading) return null;
  if (process.env.NODE_ENV === 'production' && !isAdmin) return null;

  const getScoreColor = (metric: keyof PerformanceMetrics, value: number) => {
    const thresholds = {
      lcp: { good: 2500, poor: 4000 },
      fid: { good: 100, poor: 300 },
      cls: { good: 0.1, poor: 0.25 },
      fcp: { good: 1800, poor: 3000 },
      ttfb: { good: 800, poor: 1800 },
      loadTime: { good: 3000, poor: 5000 },
    };

    const threshold = thresholds[metric];
    if (value <= threshold.good) return 'bg-green-500/20 text-green-700 dark:text-green-400';
    if (value <= threshold.poor) return 'bg-yellow-500/20 text-yellow-700 dark:text-yellow-400';
    return 'bg-red-500/20 text-red-700 dark:text-red-400';
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Card className="p-4 w-80 bg-background/95 backdrop-blur border-l-4" 
            style={{ 
              borderLeftColor: overallScore === 'good' ? '#22c55e' : 
                              overallScore === 'needs-improvement' ? '#f59e0b' : '#ef4444' 
            }}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4" />
            <span className="font-semibold text-sm">Performance</span>
          </div>
          <div className="flex items-center gap-1">
            {overallScore === 'good' ? (
              <CheckCircle className="w-4 h-4 text-green-500" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-yellow-500" />
            )}
            <span className={`text-xs font-medium ${
              overallScore === 'good' ? 'text-green-700 dark:text-green-400' :
              overallScore === 'needs-improvement' ? 'text-yellow-700 dark:text-yellow-400' :
              'text-red-700 dark:text-red-400'
            }`}>
              {overallScore === 'good' ? 'Good' : 
               overallScore === 'needs-improvement' ? 'Fair' : 'Poor'}
            </span>
          </div>
        </div>
        
        <div className="space-y-2 text-xs">
          {metrics.lcp && (
            <div className="flex justify-between items-center">
              <span className="flex items-center gap-1">
                <Zap className="w-3 h-3" />
                LCP
              </span>
              <Badge className={getScoreColor('lcp', metrics.lcp)}>
                {Math.round(metrics.lcp)}ms
              </Badge>
            </div>
          )}
          
          {metrics.fid && (
            <div className="flex justify-between items-center">
              <span className="flex items-center gap-1">
                <Globe className="w-3 h-3" />
                FID
              </span>
              <Badge className={getScoreColor('fid', metrics.fid)}>
                {Math.round(metrics.fid)}ms
              </Badge>
            </div>
          )}
          
          {metrics.cls !== undefined && (
            <div className="flex justify-between items-center">
              <span className="flex items-center gap-1">
                <Image className="w-3 h-3" />
                CLS
              </span>
              <Badge className={getScoreColor('cls', metrics.cls)}>
                {metrics.cls.toFixed(3)}
              </Badge>
            </div>
          )}
          
          {metrics.fcp && (
            <div className="flex justify-between items-center">
              <span className="text-sm">FCP</span>
              <Badge className={getScoreColor('fcp', metrics.fcp)}>
                {Math.round(metrics.fcp)}ms
              </Badge>
            </div>
          )}
          
          {metrics.ttfb && (
            <div className="flex justify-between items-center">
              <span className="text-sm">TTFB</span>
              <Badge className={getScoreColor('ttfb', metrics.ttfb)}>
                {Math.round(metrics.ttfb)}ms
              </Badge>
            </div>
          )}
          
          {metrics.loadTime && (
            <div className="flex justify-between items-center">
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                Load
              </span>
              <Badge className={getScoreColor('loadTime', metrics.loadTime)}>
                {Math.round(metrics.loadTime)}ms
              </Badge>
            </div>
          )}

          {/* Memory and DOM metrics */}
          {metrics.memoryUsage && (
            <div className="flex justify-between items-center">
              <span className="text-sm">Memory</span>
              <Badge className={metrics.memoryUsage > 50 ? 'bg-yellow-500/20 text-yellow-700 dark:text-yellow-400' : 'bg-green-500/20 text-green-700 dark:text-green-400'}>
                {metrics.memoryUsage}MB
              </Badge>
            </div>
          )}

          {metrics.domNodes && (
            <div className="flex justify-between items-center">
              <span className="text-sm">DOM Nodes</span>
              <Badge className={metrics.domNodes > 1000 ? 'bg-yellow-500/20 text-yellow-700 dark:text-yellow-400' : 'bg-green-500/20 text-green-700 dark:text-green-400'}>
                {metrics.domNodes}
              </Badge>
            </div>
          )}
        </div>

        {/* Performance alerts */}
        {alerts.length > 0 && (
          <div className="mt-3 pt-3 border-t border-border">
            <div className="text-xs font-medium mb-2 flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" />
              Issues ({alerts.length})
            </div>
            <div className="space-y-1">
              {alerts.slice(0, 2).map((alert, index) => (
                <div key={index} className={`text-xs p-2 rounded ${
                  alert.type === 'error' ? 'bg-red-500/10 text-red-700 dark:text-red-400' :
                  'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400'
                }`}>
                  {alert.message}
                </div>
              ))}
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};
