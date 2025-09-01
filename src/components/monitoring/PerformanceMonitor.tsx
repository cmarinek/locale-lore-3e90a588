
import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Activity, Zap, Globe, Image, Clock } from 'lucide-react';
import { trackMetric } from '@/utils/monitoring';

interface PerformanceMetrics {
  lcp: number;
  fid: number;
  cls: number;
  fcp: number;
  ttfb: number;
  loadTime: number;
}

export const PerformanceMonitor: React.FC = () => {
  const [metrics, setMetrics] = useState<Partial<PerformanceMetrics>>({});
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Only show in development
    if (process.env.NODE_ENV !== 'development') return;

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

      setMetrics(prev => ({ ...prev, ...newMetrics }));
    });

    observer.observe({ entryTypes: ['largest-contentful-paint', 'first-input', 'layout-shift'] });

    // Show after a delay
    setTimeout(() => setIsVisible(true), 2000);

    return () => observer.disconnect();
  }, []);

  if (!isVisible || Object.keys(metrics).length === 0) return null;

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
      <Card className="p-4 w-80 bg-background/95 backdrop-blur">
        <div className="flex items-center gap-2 mb-3">
          <Activity className="w-4 h-4" />
          <span className="font-semibold text-sm">Performance Metrics</span>
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
        </div>
      </Card>
    </div>
  );
};
