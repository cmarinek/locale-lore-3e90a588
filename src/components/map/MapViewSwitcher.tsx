import React from 'react';
import { Map, LayoutGrid, List } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export type MapViewMode = 'map' | 'hybrid' | 'list';

interface MapViewSwitcherProps {
  currentView: MapViewMode;
  onViewChange: (view: MapViewMode) => void;
}

export const MapViewSwitcher: React.FC<MapViewSwitcherProps> = ({
  currentView,
  onViewChange,
}) => {
  return (
    <div className="fixed top-20 left-1/2 -translate-x-1/2 z-20">
      <div className="bg-background/95 backdrop-blur-sm border border-border rounded-lg shadow-lg p-1 flex gap-1">
        <Button
          variant={currentView === 'map' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => onViewChange('map')}
          className={cn(
            "gap-2 transition-all",
            currentView === 'map' && "shadow-sm"
          )}
        >
          <Map className="h-4 w-4" />
          Map View
        </Button>
        
        <Button
          variant={currentView === 'hybrid' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => onViewChange('hybrid')}
          className={cn(
            "gap-2 transition-all",
            currentView === 'hybrid' && "shadow-sm"
          )}
        >
          <LayoutGrid className="h-4 w-4" />
          Hybrid View
        </Button>
        
        <Button
          variant={currentView === 'list' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => onViewChange('list')}
          className={cn(
            "gap-2 transition-all",
            currentView === 'list' && "shadow-sm"
          )}
        >
          <List className="h-4 w-4" />
          List View
        </Button>
      </div>
    </div>
  );
};
