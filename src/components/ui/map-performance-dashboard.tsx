import React from 'react';
import { Card } from '@/components/ui/card';
import { usePerformanceMonitor } from '@/hooks/usePerformanceMonitor';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { useAdmin } from '@/hooks/useAdmin';

interface MapPerformanceDashboardProps {
  markersCount?: number;
  isVisible?: boolean;
}

export const MapPerformanceDashboard: React.FC<MapPerformanceDashboardProps> = ({ 
  markersCount = 0,
  isVisible = false 
}) => {
  const { metrics, isPerformanceGood } = usePerformanceMonitor(true);
  const { isAdmin } = useAdmin();

  if (!isVisible || (process.env.NODE_ENV === 'production' && !isAdmin)) {
    return null;
  }

  const getPerformanceStatus = () => {
    if (metrics.fps >= 50) return { icon: CheckCircle, color: 'text-green-500', label: 'Excellent' };
    if (metrics.fps >= 30) return { icon: AlertTriangle, color: 'text-yellow-500', label: 'Good' };
    return { icon: XCircle, color: 'text-red-500', label: 'Poor' };
  };

  const status = getPerformanceStatus();
  const StatusIcon = status.icon;

  return (
    <Card className="absolute top-20 left-4 p-3 bg-black/90 text-white text-xs z-50 min-w-[200px]">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="font-semibold">Map Performance</span>
          <Badge variant="outline" className={`${status.color} border-current`}>
            <StatusIcon className="w-3 h-3 mr-1" />
            {status.label}
          </Badge>
        </div>
        
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div>
            <div className="text-gray-400">FPS</div>
            <div className="font-mono">{Math.round(metrics.fps)}</div>
          </div>
          <div>
            <div className="text-gray-400">Frame Time</div>
            <div className="font-mono">{metrics.frameTime.toFixed(1)}ms</div>
          </div>
          <div>
            <div className="text-gray-400">Markers</div>
            <div className="font-mono">{markersCount}</div>
          </div>
          <div>
            <div className="text-gray-400">Render Time</div>
            <div className="font-mono">{metrics.renderTime.toFixed(0)}ms</div>
          </div>
        </div>

        {metrics.memoryUsage && (
          <div>
            <div className="text-gray-400">Memory</div>
            <div className="font-mono">{metrics.memoryUsage.toFixed(1)}MB</div>
          </div>
        )}

        <div className="pt-2 border-t border-gray-700">
          <div className="text-gray-400 text-xs">Performance Tips:</div>
          <ul className="text-xs space-y-1 mt-1">
            {metrics.fps < 30 && (
              <li className="text-yellow-400">• Reduce map complexity or zoom out</li>
            )}
            {markersCount > 200 && (
              <li className="text-yellow-400">• Too many markers - clustering enabled</li>
            )}
            {metrics.memoryUsage && metrics.memoryUsage > 100 && (
              <li className="text-red-400">• High memory usage detected</li>
            )}
          </ul>
        </div>
      </div>
    </Card>
  );
};