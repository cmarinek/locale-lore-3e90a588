import React from 'react';
import { useAdvancedPerformance } from '@/hooks/useAdvancedPerformance';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { AlertTriangle, Zap, MemoryStick, Clock, Wifi, Trophy, Target } from 'lucide-react';
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
  const { metrics, isPerformanceExcellent, isPerformanceGood, getOptimizationSuggestions } = useAdvancedPerformance(enabled);
  const { isAdmin } = useAdmin();

  if (!enabled || (process.env.NODE_ENV === 'production' && !isAdmin)) return null;

  const getPerformanceColor = (score: number) => {
    if (score >= 95) return 'bg-emerald-500';
    if (score >= 80) return 'bg-green-500';
    if (score >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getPerformanceIcon = () => {
    if (isPerformanceExcellent) return Trophy;
    if (isPerformanceGood) return Target;
    return AlertTriangle;
  };

  if (!showDetailed) {
    const PerformanceIcon = getPerformanceIcon();
    return (
      <div className={`fixed top-4 left-4 z-50 ${className}`}>
        <Badge 
          className={`flex items-center gap-1 text-xs text-white ${getPerformanceColor(metrics.performanceScore)}`}
        >
          <PerformanceIcon className="h-3 w-3" />
          <span className="font-medium">{Math.round(metrics.performanceScore)}</span>
          <span className="text-xs opacity-80">| {Math.round(metrics.fps)}fps</span>
        </Badge>
      </div>
    );
  }

  const PerformanceIcon = getPerformanceIcon();
  const suggestions = getOptimizationSuggestions();

  return (
    <Card className={`fixed top-4 left-4 z-50 p-3 min-w-[280px] max-w-[350px] ${className}`}>
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Performance 2025</span>
          <div className="flex items-center gap-1">
            <PerformanceIcon className="h-4 w-4" />
            <span className={`text-sm font-bold ${getPerformanceColor(metrics.performanceScore)} px-2 py-1 rounded text-white`}>
              {Math.round(metrics.performanceScore)}
            </span>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1">
              <Zap className="h-3 w-3" />
              FPS
            </span>
            <span className="font-mono font-medium">
              {Math.round(metrics.fps)}
            </span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              Frame
            </span>
            <span className="font-mono font-medium">
              {metrics.frameTime.toFixed(1)}ms
            </span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1">
              <MemoryStick className="h-3 w-3" />
              Memory
            </span>
            <span className="font-mono font-medium">
              {metrics.memoryUsage.toFixed(0)}MB
            </span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1">
              <Wifi className="h-3 w-3" />
              Network
            </span>
            <span className="font-mono font-medium">
              {metrics.networkLatency.toFixed(0)}ms
            </span>
          </div>
        </div>

        <div className="space-y-1">
          <div className="text-xs font-medium">Core Web Vitals</div>
          <div className="grid grid-cols-3 gap-1 text-xs">
            <div className={`px-1 py-0.5 rounded text-center ${metrics.budgetCompliance.lcp ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              LCP
            </div>
            <div className={`px-1 py-0.5 rounded text-center ${metrics.budgetCompliance.fid ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              FID
            </div>
            <div className={`px-1 py-0.5 rounded text-center ${metrics.budgetCompliance.cls ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              CLS
            </div>
          </div>
        </div>

        {suggestions.length > 0 && (
          <div className="space-y-1">
            <div className="text-xs font-medium text-yellow-600">Optimization Tips</div>
            <div className="space-y-1">
              {suggestions.slice(0, 2).map((suggestion, index) => (
                <div key={index} className="text-xs text-muted-foreground leading-tight">
                  • {suggestion}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};