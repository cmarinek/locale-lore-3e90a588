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
      // Use real Web Vitals data
      const { onCLS, onLCP, onTTFB, onINP } = await import('web-vitals');
      
      const vitalsData: WebVital[] = [];

      // Collect CLS (Cumulative Layout Shift)
      onCLS((metric) => {
        vitalsData.push({
          name: 'Cumulative Layout Shift (CLS)',
          value: parseFloat(metric.value.toFixed(3)),
          rating: metric.rating === 'good' ? 'good' : metric.rating === 'needs-improvement' ? 'needs-improvement' : 'poor',
          threshold: { good: 0.1, poor: 0.25 },
          unit: '',
        });
        if (vitalsData.length >= 3) setWebVitals([...vitalsData]);
      });

      // Collect INP (Interaction to Next Paint) - replaces FID
      onINP((metric) => {
        vitalsData.push({
          name: 'Interaction to Next Paint (INP)',
          value: Math.round(metric.value),
          rating: metric.rating === 'good' ? 'good' : metric.rating === 'needs-improvement' ? 'needs-improvement' : 'poor',
          threshold: { good: 200, poor: 500 },
          unit: 'ms',
        });
        if (vitalsData.length >= 3) setWebVitals([...vitalsData]);
      });

      // Collect LCP (Largest Contentful Paint)
      onLCP((metric) => {
        vitalsData.push({
          name: 'Largest Contentful Paint (LCP)',
          value: Math.round(metric.value),
          rating: metric.rating === 'good' ? 'good' : metric.rating === 'needs-improvement' ? 'needs-improvement' : 'poor',
          threshold: { good: 2500, poor: 4000 },
          unit: 'ms',
        });
        if (vitalsData.length >= 3) setWebVitals([...vitalsData]);
      });

      // Collect TTFB (Time to First Byte)
      onTTFB((metric) => {
        vitalsData.push({
          name: 'Time to First Byte (TTFB)',
          value: Math.round(metric.value),
          rating: metric.rating === 'good' ? 'good' : metric.rating === 'needs-improvement' ? 'needs-improvement' : 'poor',
          threshold: { good: 800, poor: 1800 },
          unit: 'ms',
        });
        if (vitalsData.length >= 3) setWebVitals([...vitalsData]);
      });

      // Fallback timeout
      setTimeout(() => {
        if (vitalsData.length === 0) {
          // Use navigation timing as fallback
          const perfData = performance.getEntriesByType('navigation')[0];
          if (perfData) {
            setWebVitals([
              {
                name: 'Page Load Time',
                value: Math.round(perfData.loadEventEnd - perfData.fetchStart),
                rating: perfData.loadEventEnd - perfData.fetchStart < 2000 ? 'good' : 'needs-improvement',
                threshold: { good: 2000, poor: 4000 },
                unit: 'ms',
              },
            ]);
          }
        }
        setLoading(false);
      }, 2000);
    } catch (error) {
      console.error('Failed to load performance metrics:', error);
      setWebVitals([]);
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
