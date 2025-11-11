import React, { useState } from 'react';
import { MapPin, CheckCircle2, TrendingUp, ChevronDown, ChevronUp } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

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
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="fixed top-24 left-4 z-20">
      <div className="bg-background/95 backdrop-blur-sm border border-border rounded-lg shadow-lg w-[180px] overflow-hidden">
        {/* Header with toggle */}
        <div className="flex items-center justify-between p-3 border-b border-border">
          <h3 className="text-sm font-semibold text-foreground">Map Statistics</h3>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsExpanded(!isExpanded)}
            className="h-6 w-6"
          >
            {isExpanded ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>
        </div>

        {/* Collapsible content */}
        <div
          className={cn(
            "transition-all duration-300 ease-in-out overflow-hidden",
            isExpanded ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
          )}
        >
          <div className="p-3 space-y-2">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                <MapPin className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-xl font-bold text-foreground">{totalStories}</p>
                <p className="text-[10px] text-muted-foreground">Total</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-success/10 flex items-center justify-center">
                <CheckCircle2 className="h-4 w-4 text-success" />
              </div>
              <div>
                <p className="text-xl font-bold text-foreground">{verifiedStories}</p>
                <p className="text-[10px] text-muted-foreground">Verified</p>
              </div>
            </div>
            
            {trendingStories > 0 && (
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-warning/10 flex items-center justify-center">
                  <TrendingUp className="h-4 w-4 text-warning" />
                </div>
                <div>
                  <p className="text-xl font-bold text-foreground">{trendingStories}</p>
                  <p className="text-[10px] text-muted-foreground">Trending</p>
                </div>
              </div>
            )}
            
            <Badge variant="secondary" className="w-full justify-center text-[10px] py-0.5 animate-fade-in">
              Live
            </Badge>
          </div>
        </div>
      </div>
    </div>
  );
};

