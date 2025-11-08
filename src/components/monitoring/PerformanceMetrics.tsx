import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Activity, Zap, Clock, TrendingUp } from 'lucide-react';
import { logger } from '@/utils/logger';

interface WebVital {
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  threshold: { good: number; poor: number };
  unit: string;
}

interface PerformanceMetricsProps {
  compact?: boolean;
}

export function PerformanceMetrics({ compact }: PerformanceMetricsProps) {
  const [webVitals, setWebVitals] = useState<WebVital[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPerformanceMetrics();
  }, []);

  const loadPerformanceMetrics = async () => {
    try {
      // Mock data - in production, fetch from performance API
      const mockVitals: WebVital[] = [
        {
          name: 'Largest Contentful Paint (LCP)',
          value: 1850,
          rating: 'good',
          threshold: { good: 2500, poor: 4000 },
          unit: 'ms',
        },
        {
          name: 'First Input Delay (FID)',
          value: 45,
          rating: 'good',
          threshold: { good: 100, poor: 300 },
          unit: 'ms',
        },
        {
          name: 'Cumulative Layout Shift (CLS)',
          value: 0.08,
          rating: 'good',
          threshold: { good: 0.1, poor: 0.25 },
          unit: '',
        },
        {
          name: 'Time to First Byte (TTFB)',
          value: 320,
          rating: 'needs-improvement',
          threshold: { good: 800, poor: 1800 },
          unit: 'ms',
        },
      ];

      setWebVitals(mockVitals);
    } catch (error) {
      logger.error('Failed to load performance metrics', error as Error, {
        component: 'PerformanceMetrics',
      });
    } finally {
      setLoading(false);
    }
  };

  const getRatingColor = (rating: string) => {
    switch (rating) {
      case 'good':
        return 'text-green-600';
      case 'needs-improvement':
        return 'text-yellow-600';
      case 'poor':
        return 'text-red-600';
      default:
        return 'text-muted-foreground';
    }
  };

  const getRatingBadge = (rating: string) => {
    switch (rating) {
      case 'good':
        return <Badge className="bg-green-500">Good</Badge>;
      case 'needs-improvement':
        return <Badge className="bg-yellow-500">Needs Improvement</Badge>;
      case 'poor':
        return <Badge variant="destructive">Poor</Badge>;
      default:
        return null;
    }
  };

  const getProgressValue = (vital: WebVital) => {
    const { value, threshold } = vital;
    if (value <= threshold.good) return 100;
    if (value >= threshold.poor) return 33;
    return 66;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Activity className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (compact) {
    return (
      <div className="space-y-4">
        {webVitals.map((vital) => (
          <div key={vital.name} className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">{vital.name}</span>
              <span className={`text-sm font-bold ${getRatingColor(vital.rating)}`}>
                {vital.value}{vital.unit}
              </span>
            </div>
            <Progress value={getProgressValue(vital)} className="h-2" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Page Load</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2.1s</div>
            <p className="text-xs text-muted-foreground">Average load time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">API Response</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">143ms</div>
            <p className="text-xs text-muted-foreground">P95 response time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Throughput</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2.4K</div>
            <p className="text-xs text-muted-foreground">Requests per minute</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cache Hit</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">87%</div>
            <p className="text-xs text-muted-foreground">Cache efficiency</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Core Web Vitals</CardTitle>
          <CardDescription>Google's recommended performance metrics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {webVitals.map((vital) => (
              <div key={vital.name} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <h4 className="text-sm font-semibold">{vital.name}</h4>
                    <p className="text-xs text-muted-foreground">
                      Good: &lt;{vital.threshold.good}{vital.unit} | Poor: &gt;
                      {vital.threshold.poor}{vital.unit}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-lg font-bold ${getRatingColor(vital.rating)}`}>
                      {vital.value}{vital.unit}
                    </span>
                    {getRatingBadge(vital.rating)}
                  </div>
                </div>
                <Progress value={getProgressValue(vital)} className="h-2" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
