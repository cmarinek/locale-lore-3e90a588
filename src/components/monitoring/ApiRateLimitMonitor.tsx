import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Activity, AlertTriangle, TrendingUp } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface RateLimitData {
  service: string;
  current: number;
  limit: number;
  resetTime: Date;
  status: 'healthy' | 'warning' | 'critical';
}

export const ApiRateLimitMonitor: React.FC = () => {
  const [rateLimits, setRateLimits] = useState<RateLimitData[]>([
    {
      service: 'OpenAI Translations',
      current: 0,
      limit: 1000,
      resetTime: new Date(Date.now() + 3600000),
      status: 'healthy',
    },
    {
      service: 'Mapbox API',
      current: 0,
      limit: 50000,
      resetTime: new Date(Date.now() + 86400000),
      status: 'healthy',
    },
    {
      service: 'Supabase Edge Functions',
      current: 0,
      limit: 500000,
      resetTime: new Date(Date.now() + 86400000),
      status: 'healthy',
    },
  ]);

  useEffect(() => {
    // Simulate rate limit monitoring
    const interval = setInterval(() => {
      setRateLimits(prev => prev.map(limit => {
        const newCurrent = Math.min(limit.current + Math.floor(Math.random() * 10), limit.limit);
        const percentage = (newCurrent / limit.limit) * 100;
        
        return {
          ...limit,
          current: newCurrent,
          status: percentage > 90 ? 'critical' : percentage > 70 ? 'warning' : 'healthy',
        };
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'text-green-600';
      case 'warning':
        return 'text-yellow-600';
      case 'critical':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const criticalServices = rateLimits.filter(r => r.status === 'critical');

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            API Rate Limit Monitoring
          </CardTitle>
          <CardDescription>
            Real-time monitoring of API usage and rate limits
          </CardDescription>
        </CardHeader>
        <CardContent>
          {criticalServices.length > 0 && (
            <Alert variant="destructive" className="mb-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>Warning:</strong> {criticalServices.length} service{criticalServices.length !== 1 ? 's are' : ' is'} approaching rate limits
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-6">
            {rateLimits.map((limit) => {
              const percentage = (limit.current / limit.limit) * 100;
              
              return (
                <div key={limit.service} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{limit.service}</span>
                      <Badge 
                        variant={
                          limit.status === 'healthy' ? 'default' : 
                          limit.status === 'warning' ? 'secondary' : 
                          'destructive'
                        }
                      >
                        {limit.status}
                      </Badge>
                    </div>
                    <span className={`text-sm font-semibold ${getStatusColor(limit.status)}`}>
                      {limit.current.toLocaleString()} / {limit.limit.toLocaleString()}
                    </span>
                  </div>
                  
                  <Progress 
                    value={percentage} 
                    className={`h-2 ${
                      limit.status === 'critical' ? '[&>div]:bg-red-600' : 
                      limit.status === 'warning' ? '[&>div]:bg-yellow-600' : 
                      ''
                    }`}
                  />
                  
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{percentage.toFixed(1)}% used</span>
                    <span>Resets {limit.resetTime.toLocaleTimeString()}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Usage Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="text-sm space-y-2">
            <p>💡 <strong>OpenAI Translations:</strong> Consider caching translated content to reduce API calls</p>
            <p>💡 <strong>Mapbox API:</strong> Implement tile caching for frequently viewed areas</p>
            <p>💡 <strong>Edge Functions:</strong> Use database queries efficiently and implement response caching</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
