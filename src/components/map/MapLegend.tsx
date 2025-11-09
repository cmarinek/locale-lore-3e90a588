import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X, Info } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';

interface LegendItem {
  name: string;
  icon: string;
  color: string;
  count: number;
}

interface MapLegendProps {
  categories: LegendItem[];
  onClose: () => void;
}

export const MapLegend: React.FC<MapLegendProps> = ({ categories, onClose }) => {
  return (
    <Card className="absolute bottom-20 right-4 z-20 w-64 bg-background/95 backdrop-blur-md border-border/50 shadow-xl animate-slide-in-right">
      <div className="flex items-center justify-between p-3 border-b border-border">
        <div className="flex items-center gap-2">
          <Info className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-semibold text-foreground">Map Legend</h3>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="h-6 w-6 p-0"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>

      <ScrollArea className="max-h-80">
        <div className="p-3 space-y-2">
          {categories.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-4">
              No categories to display
            </p>
          ) : (
            categories.map((category) => (
              <div
                key={category.name}
                className="flex items-center justify-between p-2 rounded-md hover:bg-muted/50 transition-colors animate-fade-in"
              >
                <div className="flex items-center gap-2 flex-1">
                  <div
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: category.color }}
                  />
                  <span className="text-sm text-foreground">{category.icon}</span>
                  <span className="text-xs text-foreground truncate">
                    {category.name}
                  </span>
                </div>
                <Badge variant="secondary" className="text-xs">
                  {category.count}
                </Badge>
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </Card>
  );
};
