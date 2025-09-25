import React from 'react';
import { usePerformanceMonitor } from '@/hooks/usePerformanceMonitor';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { AlertTriangle, Zap, MemoryStick, Clock } from 'lucide-react';
import { useAdmin } from '@/hooks/useAdmin';

interface PerformanceMonitorProps {
  enabled?: boolean;
  showDetailed?: boolean;
  className?: string;
}

export const PerformanceMonitor: React.FC<PerformanceMonitorProps> = ({
  enabled = true,
  showDetailed = false,
  className = ""
}) => {
  const { metrics, isPerformanceGood } = usePerformanceMonitor(enabled);
  const { isAdmin } = useAdmin();

  if (!enabled || (process.env.NODE_ENV === 'production' && !isAdmin)) return null;

  if (!showDetailed) {
    return (
      <div className={`fixed top-4 left-4 z-50 ${className}`}>
        <Badge 
          variant={isPerformanceGood ? "default" : "destructive"}
          className="flex items-center gap-1 text-xs"
        >
          {!isPerformanceGood && <AlertTriangle className="h-3 w-3" />}
          <Zap className="h-3 w-3" />
          {Math.round(metrics.fps)} FPS
        </Badge>
      </div>
    );
  }

  return (
    <Card className={`fixed top-4 left-4 z-50 p-3 min-w-[200px] ${className}`}>
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Performance</span>
          {!isPerformanceGood && (
            <AlertTriangle className="h-4 w-4 text-destructive" />
          )}
        </div>
        
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span className="flex items-center gap-1">
              <Zap className="h-3 w-3" />
              FPS
            </span>
            <span className="font-mono">
              {Math.round(metrics.fps)}
            </span>
          </div>
          
          <div className="flex items-center justify-between text-xs">
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              Frame Time
            </span>
            <span className="font-mono">
              {metrics.frameTime.toFixed(1)}ms
            </span>
          </div>
          
          {metrics.memoryUsage && (
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-1">
                <MemoryStick className="h-3 w-3" />
                Memory
              </span>
              <span className="font-mono">
                {metrics.memoryUsage.toFixed(1)}MB
              </span>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};