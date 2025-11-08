import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { AlertCircle, XCircle, AlertTriangle, Info } from 'lucide-react';
import { logger } from '@/utils/logger';

interface ErrorEvent {
  id: string;
  level: 'error' | 'warning' | 'info';
  message: string;
  timestamp: Date;
  count: number;
  component?: string;
  stack?: string;
}

interface ErrorMetricsProps {
  limit?: number;
  compact?: boolean;
}

export function ErrorMetrics({ limit, compact }: ErrorMetricsProps) {
  const [errors, setErrors] = useState<ErrorEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadErrorMetrics();
  }, []);

  const loadErrorMetrics = async () => {
    try {
      // In production, this would fetch from Sentry API
      // For now, showing mock data
      const mockErrors: ErrorEvent[] = [
        {
          id: '1',
          level: 'error',
          message: 'Failed to load user profile',
          timestamp: new Date(Date.now() - 1000 * 60 * 5),
          count: 3,
          component: 'ProfilePage',
          stack: 'Error at ProfilePage.tsx:45',
        },
        {
          id: '2',
          level: 'warning',
          message: 'Slow API response detected',
          timestamp: new Date(Date.now() - 1000 * 60 * 15),
          count: 12,
          component: 'APIClient',
        },
        {
          id: '3',
          level: 'error',
          message: 'Database connection timeout',
          timestamp: new Date(Date.now() - 1000 * 60 * 30),
          count: 1,
          stack: 'Error at supabase-client.ts:78',
        },
        {
          id: '4',
          level: 'info',
          message: 'User authentication succeeded',
          timestamp: new Date(Date.now() - 1000 * 60 * 45),
          count: 245,
          component: 'AuthProvider',
        },
      ];

      setErrors(limit ? mockErrors.slice(0, limit) : mockErrors);
    } catch (error) {
      logger.error('Failed to load error metrics', error as Error, {
        component: 'ErrorMetrics',
      });
    } finally {
      setLoading(false);
    }
  };

  const getIcon = (level: string) => {
    switch (level) {
      case 'error':
        return <XCircle className="h-4 w-4 text-destructive" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      default:
        return <Info className="h-4 w-4 text-blue-500" />;
    }
  };

  const getBadgeVariant = (level: string) => {
    switch (level) {
      case 'error':
        return 'destructive' as const;
      case 'warning':
        return 'secondary' as const;
      default:
        return 'outline' as const;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <AlertCircle className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (compact) {
    return (
      <div className="space-y-3">
        {errors.map((error) => (
          <div key={error.id} className="flex items-start gap-3 rounded-lg border p-3">
            {getIcon(error.level)}
            <div className="flex-1 space-y-1">
              <p className="text-sm font-medium">{error.message}</p>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span>{error.timestamp.toLocaleTimeString()}</span>
                {error.component && <span>• {error.component}</span>}
                <Badge variant="outline" className="ml-auto">
                  {error.count}x
                </Badge>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Errors</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">16</div>
            <p className="text-xs text-muted-foreground">Last 24 hours</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Error Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0.12%</div>
            <p className="text-xs text-muted-foreground">Of total requests</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Avg Resolution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2.3h</div>
            <p className="text-xs text-muted-foreground">Mean time to resolve</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Error Events</CardTitle>
          <CardDescription>Recent errors captured by Sentry</CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[400px]">
            <div className="space-y-4">
              {errors.map((error) => (
                <div
                  key={error.id}
                  className="flex items-start gap-4 rounded-lg border p-4 transition-colors hover:bg-accent"
                >
                  {getIcon(error.level)}
                  <div className="flex-1 space-y-2">
                    <div className="flex items-start justify-between">
                      <h4 className="font-semibold">{error.message}</h4>
                      <Badge variant={getBadgeVariant(error.level)}>{error.level}</Badge>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      <span>{error.timestamp.toLocaleString()}</span>
                      {error.component && (
                        <>
                          <span>•</span>
                          <span>{error.component}</span>
                        </>
                      )}
                      <span>•</span>
                      <span>{error.count} occurrences</span>
                    </div>
                    {error.stack && (
                      <pre className="mt-2 rounded bg-muted p-2 text-xs">
                        {error.stack}
                      </pre>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
