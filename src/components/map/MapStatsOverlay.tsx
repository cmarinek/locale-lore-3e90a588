import React, { useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BarChart3 } from 'lucide-react';
import { useUIStore } from '@/stores/uiStore';

interface MapStatsOverlayProps {
  totalStories: number;
  storiesInView: number;
  categoryDistribution: Record<string, { count: number; icon: string; color: string }>;
}

export const MapStatsOverlay: React.FC<MapStatsOverlayProps> = ({
  totalStories,
  storiesInView,
  categoryDistribution,
}) => {
  const showMapStats = useUIStore((state) => state.showMapStats);

  if (!showMapStats) return null;
  const topCategories = useMemo(() => {
    return Object.entries(categoryDistribution)
      .sort(([, a], [, b]) => b.count - a.count)
      .slice(0, 3);
  }, [categoryDistribution]);

  return (
    <Card className="absolute top-4 left-1/2 -translate-x-1/2 z-20 bg-background/95 backdrop-blur-md border-border/50 shadow-lg animate-fade-in">
      <div className="px-4 py-2 flex items-center gap-6">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-primary" />
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground">Total Stories</span>
            <span className="text-sm font-semibold text-foreground">{totalStories.toLocaleString()}</span>
          </div>
        </div>

        <div className="h-8 w-px bg-border" />

        <div className="flex flex-col">
          <span className="text-xs text-muted-foreground">In View</span>
          <span className="text-sm font-semibold text-primary animate-pulse">{storiesInView.toLocaleString()}</span>
        </div>

        {topCategories.length > 0 && (
          <>
            <div className="h-8 w-px bg-border" />
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Top:</span>
              {topCategories.map(([name, data]) => (
                <Badge
                  key={name}
                  variant="secondary"
                  className="text-xs animate-scale-in"
                  style={{ 
                    backgroundColor: `${data.color}20`,
                    color: data.color,
                    borderColor: `${data.color}40`
                  }}
                >
                  {data.icon} {data.count}
                </Badge>
              ))}
            </div>
          </>
        )}
      </div>
    </Card>
  );
};
