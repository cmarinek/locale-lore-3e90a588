
import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Activity, Zap, Globe, Image } from 'lucide-react';
import { useAdmin } from '@/hooks/useAdmin';

interface PerformanceMetrics {
  lcp: number;
  fid: number;
  cls: number;
  fcp: number;
  ttfb: number;
}

export const PerformanceMonitor: React.FC = () => {
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const { isAdmin, loading } = useAdmin();

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
            break;
          case 'first-input':
            newMetrics.fid = (entry as any).processingStart - entry.startTime;
            break;
          case 'layout-shift':
            if (!(entry as any).hadRecentInput) {
              newMetrics.cls = (newMetrics.cls || 0) + (entry as any).value;
            }
            break;
        }
      });

      // Get navigation timing metrics
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      if (navigation) {
        newMetrics.fcp = navigation.responseStart - navigation.fetchStart;
        newMetrics.ttfb = navigation.responseStart - navigation.requestStart;
      }

      setMetrics(prev => ({ ...prev, ...newMetrics } as PerformanceMetrics));
    });

    observer.observe({ entryTypes: ['largest-contentful-paint', 'first-input', 'layout-shift'] });

    // Show after a delay
    setTimeout(() => setIsVisible(true), 2000);

    return () => observer.disconnect();
  }, []);

  // Only show to admins
  if (!isVisible || !metrics || loading || !isAdmin) return null;

  const getScoreColor = (metric: keyof PerformanceMetrics, value: number) => {
    const thresholds = {
      lcp: { good: 2500, poor: 4000 },
      fid: { good: 100, poor: 300 },
      cls: { good: 0.1, poor: 0.25 },
      fcp: { good: 1800, poor: 3000 },
      ttfb: { good: 800, poor: 1800 }
    };

    const threshold = thresholds[metric];
    if (value <= threshold.good) return 'bg-green-500/20 text-green-700';
    if (value <= threshold.poor) return 'bg-yellow-500/20 text-yellow-700';
    return 'bg-red-500/20 text-red-700';
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Card className="p-4 w-80 bg-background/95 backdrop-blur">
        <div className="flex items-center gap-2 mb-3">
          <Activity className="w-4 h-4" />
          <span className="font-semibold text-sm">Performance Metrics</span>
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm flex items-center gap-1">
              <Zap className="w-3 h-3" />
              LCP
            </span>
            <Badge className={getScoreColor('lcp', metrics.lcp)}>
              {Math.round(metrics.lcp)}ms
            </Badge>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-sm flex items-center gap-1">
              <Globe className="w-3 h-3" />
              FID
            </span>
            <Badge className={getScoreColor('fid', metrics.fid)}>
              {Math.round(metrics.fid)}ms
            </Badge>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-sm flex items-center gap-1">
              <Image className="w-3 h-3" />
              CLS
            </span>
            <Badge className={getScoreColor('cls', metrics.cls)}>
              {metrics.cls.toFixed(3)}
            </Badge>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-sm">FCP</span>
            <Badge className={getScoreColor('fcp', metrics.fcp)}>
              {Math.round(metrics.fcp)}ms
            </Badge>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-sm">TTFB</span>
            <Badge className={getScoreColor('ttfb', metrics.ttfb)}>
              {Math.round(metrics.ttfb)}ms
            </Badge>
          </div>
        </div>
      </Card>
    </div>
  );
};
