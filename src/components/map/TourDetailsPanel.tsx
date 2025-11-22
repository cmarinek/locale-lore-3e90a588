/**
 * Tour Details Panel - Shows completed tour with turn-by-turn directions
 */

import React from 'react';
import {
  Route,
  X,
  MapPin,
  Navigation,
  Clock,
  Share2,
  ChevronRight,
  ChevronDown,
  Edit,
  Car,
  PersonStanding,
  Bike,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { FactTour, RouteSegment, TravelMode } from '@/types/tour';

export interface TourDetailsPanelProps {
  tour: FactTour;
  onClose: () => void;
  onEdit: () => void;
  onShare: () => void;
  onNavigateToWaypoint: (factId: string) => void;
  className?: string;
}

const TRAVEL_MODE_ICONS: Record<TravelMode, React.ReactNode> = {
  walking: <PersonStanding className="h-4 w-4" />,
  driving: <Car className="h-4 w-4" />,
  cycling: <Bike className="h-4 w-4" />,
};

export const TourDetailsPanel: React.FC<TourDetailsPanelProps> = ({
  tour,
  onClose,
  onEdit,
  onShare,
  onNavigateToWaypoint,
  className,
}) => {
  const [expandedSegments, setExpandedSegments] = React.useState<Set<number>>(
    new Set([0]) // First segment expanded by default
  );

  const toggleSegment = (index: number) => {
    const newExpanded = new Set(expandedSegments);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedSegments(newExpanded);
  };

  const formatDistance = (miles: number): string => {
    if (miles < 0.1) {
      return `${Math.round(miles * 5280)} ft`;
    }
    return `${miles.toFixed(1)} mi`;
  };

  const formatDuration = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;

    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

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
            <h2 className="font-bold text-lg">Your Tour</h2>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Tour Summary */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            {TRAVEL_MODE_ICONS[tour.travelMode]}
            <span className="text-sm font-medium capitalize">{tour.travelMode}</span>
            {tour.optimized && (
              <Badge variant="secondary" className="text-xs">
                Optimized
              </Badge>
            )}
          </div>

          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Navigation className="h-4 w-4" />
              <span>{formatDistance(tour.totalDistance)}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>{formatDuration(tour.totalDuration)}</span>
            </div>
            <div className="flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              <span>{tour.waypoints.length} stops</span>
            </div>
          </div>
        </div>
      </div>

      {/* Route Segments */}
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-3">
          {tour.segments.map((segment, index) => (
            <Card key={index} className="overflow-hidden">
              {/* Segment Header */}
              <button
                onClick={() => toggleSegment(index)}
                className="w-full p-3 flex items-start gap-3 hover:bg-accent/50 transition-colors"
              >
                <Badge
                  variant="default"
                  className="h-6 w-6 flex items-center justify-center p-0 text-xs shrink-0"
                >
                  {index + 1}
                </Badge>

                <div className="flex-1 text-left min-w-0">
                  <h4 className="font-semibold text-sm truncate">
                    {segment.from.fact.title}
                  </h4>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                    <Navigation className="h-3 w-3" />
                    <span>{formatDistance(segment.distance / 1609.34)}</span>
                    <span>•</span>
                    <Clock className="h-3 w-3" />
                    <span>{formatDuration(Math.ceil(segment.duration / 60))}</span>
                  </div>
                </div>

                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 shrink-0"
                  onClick={(e) => {
                    e.stopPropagation();
                    onNavigateToWaypoint(segment.from.fact.id);
                  }}
                >
                  <MapPin className="h-3 w-3" />
                </Button>

                {expandedSegments.has(index) ? (
                  <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
                ) : (
                  <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                )}
              </button>

              {/* Turn-by-turn steps */}
              {expandedSegments.has(index) && segment.steps.length > 0 && (
                <div className="border-t">
                  <div className="p-3 space-y-2 bg-muted/20">
                    <p className="text-xs font-medium text-muted-foreground">
                      Directions to next stop
                    </p>
                    {segment.steps.map((step, stepIndex) => (
                      <div key={stepIndex} className="flex gap-2 text-xs">
                        <span className="text-muted-foreground shrink-0">
                          {stepIndex + 1}.
                        </span>
                        <div className="flex-1">
                          <p>{step.instruction}</p>
                          <p className="text-muted-foreground mt-0.5">
                            {formatDistance(step.distance / 1609.34)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </Card>
          ))}

          {/* Final Destination */}
          {tour.waypoints.length > 0 && (
            <Card className="p-3">
              <div className="flex items-start gap-3">
                <Badge
                  variant="default"
                  className="h-6 w-6 flex items-center justify-center p-0 text-xs shrink-0"
                >
                  {tour.waypoints.length}
                </Badge>

                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-sm truncate">
                    {tour.waypoints[tour.waypoints.length - 1].fact.title}
                  </h4>
                  <p className="text-xs text-muted-foreground mt-1">Final destination</p>
                </div>

                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 shrink-0"
                  onClick={() =>
                    onNavigateToWaypoint(tour.waypoints[tour.waypoints.length - 1].fact.id)
                  }
                >
                  <MapPin className="h-3 w-3" />
                </Button>
              </div>
            </Card>
          )}
        </div>
      </ScrollArea>

      {/* Footer Actions */}
      <div className="p-4 border-t space-y-2">
        <Button onClick={onShare} className="w-full" size="lg">
          <Share2 className="h-4 w-4 mr-2" />
          Share Tour
        </Button>

        <div className="flex gap-2">
          <Button onClick={onEdit} variant="outline" className="flex-1" size="sm">
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
          <Button onClick={onClose} variant="outline" className="flex-1" size="sm">
            Close
          </Button>
        </div>
      </div>
    </Card>
  );
};
