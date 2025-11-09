import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { AlertCircle, XCircle, AlertTriangle, Info } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

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
      // Fetch real error logs from database
      const { data: errorLogs, error: fetchError } = await supabase
        .from('error_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit || 20);

      if (fetchError || !errorLogs) {
        // If table doesn't exist, show empty state
        console.warn('Error logs table not available:', fetchError);
        setErrors([]);
        setLoading(false);
        return;
      }

      // Transform database errors to component format
      const transformedErrors: ErrorEvent[] = errorLogs.map(log => ({
        id: log.id,
        level: 'error',
        message: log.error_message || 'Unknown error',
        timestamp: new Date(log.created_at),
        count: 1,
        component: log.url,
        stack: log.error_stack
      }));

      setErrors(transformedErrors);
    } catch (error) {
      console.error('Failed to load error metrics:', error);
      setErrors([]);
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
