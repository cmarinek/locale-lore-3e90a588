import React from 'react';
import { MapPin, CheckCircle2, TrendingUp } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface MapStatsOverlayProps {
  totalStories: number;
  verifiedStories: number;
  trendingStories?: number;
}

export const MapStatsOverlay: React.FC<MapStatsOverlayProps> = ({
  totalStories,
  verifiedStories,
  trendingStories = 0,
}) => {
  return (
    <div className="fixed top-20 left-4 z-20">
      <div className="bg-background/95 backdrop-blur-sm border border-border rounded-lg shadow-lg p-4 space-y-3 min-w-[200px]">
        <h3 className="text-sm font-semibold text-foreground mb-2">Map Statistics</h3>
        
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
            <MapPin className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="text-2xl font-bold text-foreground">{totalStories}</p>
            <p className="text-xs text-muted-foreground">Total Stories</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-success/10 flex items-center justify-center">
            <CheckCircle2 className="h-5 w-5 text-success" />
          </div>
          <div>
            <p className="text-2xl font-bold text-foreground">{verifiedStories}</p>
            <p className="text-xs text-muted-foreground">Verified</p>
          </div>
        </div>
        
        {trendingStories > 0 && (
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-warning/10 flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-warning" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{trendingStories}</p>
              <p className="text-xs text-muted-foreground">Trending</p>
            </div>
          </div>
        )}
        
        <Badge variant="secondary" className="w-full justify-center mt-2">
          Live Updates Active
        </Badge>
      </div>
    </div>
  );
};
