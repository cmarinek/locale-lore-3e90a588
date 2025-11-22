/**
 * Tour Builder - Multi-select mode for creating fact tours
 */

import React from 'react';
import {
  Route,
  X,
  GripVertical,
  Navigation,
  MapPin,
  Sparkles,
  Share2,
  Car,
  PersonStanding,
  Bike,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { EnhancedFact } from '@/types/fact';
import { TravelMode, TourWaypoint } from '@/types/tour';

export interface TourBuilderProps {
  waypoints: TourWaypoint[];
  travelMode: TravelMode;
  onTravelModeChange: (mode: TravelMode) => void;
  onRemoveWaypoint: (factId: string) => void;
  onReorderWaypoint: (fromIndex: number, toIndex: number) => void;
  onOptimizeRoute: () => void;
  onBuildTour: () => void;
  onCancel: () => void;
  onAddFactClick: () => void;
  className?: string;
  isOptimizing?: boolean;
  isBuilding?: boolean;
}

const TRAVEL_MODE_ICONS: Record<TravelMode, React.ReactNode> = {
  walking: <PersonStanding className="h-4 w-4" />,
  driving: <Car className="h-4 w-4" />,
  cycling: <Bike className="h-4 w-4" />,
};

const TRAVEL_MODE_LABELS: Record<TravelMode, string> = {
  walking: 'Walking',
  driving: 'Driving',
  cycling: 'Cycling',
};

export const TourBuilder: React.FC<TourBuilderProps> = ({
  waypoints,
  travelMode,
  onTravelModeChange,
  onRemoveWaypoint,
  onReorderWaypoint,
  onOptimizeRoute,
  onBuildTour,
  onCancel,
  onAddFactClick,
  className,
  isOptimizing = false,
  isBuilding = false,
}) => {
  const [draggedIndex, setDraggedIndex] = React.useState<number | null>(null);

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex !== null && draggedIndex !== index) {
      onReorderWaypoint(draggedIndex, index);
      setDraggedIndex(index);
    }
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  const canBuildTour = waypoints.length >= 2;

  return (
    <Card
      className={cn(
        'fixed right-4 top-20 bottom-4 w-96 bg-background/95 backdrop-blur-sm shadow-xl z-40 flex flex-col',
        className
      )}
    >
      {/* Header */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Route className="h-5 w-5 text-primary" />
            <h2 className="font-bold text-lg">Build a Tour</h2>
          </div>
          <Button variant="ghost" size="icon" onClick={onCancel} className="h-8 w-8">
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Travel Mode Selector */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-muted-foreground">Travel Mode</label>
          <Select
            value={travelMode}
            onValueChange={(value) => onTravelModeChange(value as TravelMode)}
          >
            <SelectTrigger className="w-full">
              <SelectValue>
                <div className="flex items-center gap-2">
                  {TRAVEL_MODE_ICONS[travelMode]}
                  {TRAVEL_MODE_LABELS[travelMode]}
                </div>
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {(Object.keys(TRAVEL_MODE_LABELS) as TravelMode[]).map((mode) => (
                <SelectItem key={mode} value={mode}>
                  <div className="flex items-center gap-2">
                    {TRAVEL_MODE_ICONS[mode]}
                    {TRAVEL_MODE_LABELS[mode]}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Waypoints List */}
      <ScrollArea className="flex-1">
        {waypoints.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full p-8 text-center">
            <div className="text-6xl mb-4">🗺️</div>
            <h3 className="font-semibold text-lg mb-2">No stops selected</h3>
            <p className="text-sm text-muted-foreground max-w-xs mb-4">
              Click on fact markers on the map to add them to your tour.
            </p>
            <Button onClick={onAddFactClick} variant="outline" size="sm">
              <MapPin className="h-4 w-4 mr-2" />
              Browse facts
            </Button>
          </div>
        ) : (
          <div className="p-4 space-y-2">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">
                {waypoints.length} {waypoints.length === 1 ? 'stop' : 'stops'}
              </span>
              {waypoints.length > 2 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onOptimizeRoute}
                  disabled={isOptimizing}
                  className="h-7 text-xs"
                >
                  <Sparkles className="h-3 w-3 mr-1" />
                  {isOptimizing ? 'Optimizing...' : 'Optimize route'}
                </Button>
              )}
            </div>

            {waypoints.map((waypoint, index) => (
              <Card
                key={waypoint.fact.id}
                draggable
                onDragStart={() => handleDragStart(index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDragEnd={handleDragEnd}
                className={cn(
                  'p-3 cursor-move transition-all hover:shadow-md',
                  draggedIndex === index && 'opacity-50'
                )}
              >
                <div className="flex items-start gap-3">
                  {/* Drag Handle & Order */}
                  <div className="flex flex-col items-center gap-1 shrink-0">
                    <GripVertical className="h-4 w-4 text-muted-foreground" />
                    <Badge variant="secondary" className="h-6 w-6 flex items-center justify-center p-0 text-xs">
                      {index + 1}
                    </Badge>
                  </div>

                  {/* Fact Info */}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-sm truncate">
                      {waypoint.fact.title}
                    </h4>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                      <MapPin className="h-3 w-3" />
                      <span className="truncate">{waypoint.fact.location_name}</span>
                    </div>
                    {waypoint.fact.categories && (
                      <Badge variant="outline" className="mt-2 text-xs">
                        {waypoint.fact.categories.icon}{' '}
                        {waypoint.fact.categories.category_translations?.[0]?.name ||
                          waypoint.fact.categories.slug}
                      </Badge>
                    )}
                  </div>

                  {/* Remove Button */}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onRemoveWaypoint(waypoint.fact.id)}
                    className="h-7 w-7 shrink-0"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>

                {/* Connection Line */}
                {index < waypoints.length - 1 && (
                  <div className="flex items-center gap-2 ml-6 mt-2 text-xs text-muted-foreground">
                    <div className="h-4 w-0.5 bg-border" />
                  </div>
                )}
              </Card>
            ))}
          </div>
        )}
      </ScrollArea>

      {/* Footer Actions */}
      <div className="p-4 border-t space-y-2">
        <Button
          onClick={onBuildTour}
          disabled={!canBuildTour || isBuilding}
          className="w-full"
          size="lg"
        >
          <Navigation className="h-4 w-4 mr-2" />
          {isBuilding ? 'Building tour...' : 'Build Tour'}
        </Button>

        {!canBuildTour && (
          <p className="text-xs text-center text-muted-foreground">
            Add at least 2 stops to build a tour
          </p>
        )}

        <Button onClick={onCancel} variant="outline" className="w-full" size="sm">
          Cancel
        </Button>
      </div>
    </Card>
  );
};
