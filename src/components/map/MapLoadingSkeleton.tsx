import { Skeleton } from '@/components/ui/skeleton';
import { MapPin, Layers, ZoomIn, Compass } from 'lucide-react';

export const MapLoadingSkeleton = () => {
  return (
    <div className="relative w-full h-full bg-muted/20 rounded-lg overflow-hidden">
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-muted via-muted/50 to-muted animate-pulse" />
      
      {/* Fake map grid pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="grid grid-cols-8 grid-rows-8 h-full w-full">
          {Array.from({ length: 64 }).map((_, i) => (
            <div key={i} className="border border-border/20" />
          ))}
        </div>
      </div>

      {/* Loading markers */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/3 transform -translate-x-1/2 -translate-y-1/2">
          <div className="animate-bounce">
            <MapPin className="w-8 h-8 text-primary/30" />
          </div>
        </div>
        <div className="absolute top-2/3 right-1/4 transform -translate-x-1/2 -translate-y-1/2 animation-delay-200">
          <div className="animate-bounce">
            <MapPin className="w-6 h-6 text-primary/20" />
          </div>
        </div>
        <div className="absolute bottom-1/4 left-1/2 transform -translate-x-1/2 -translate-y-1/2 animation-delay-400">
          <div className="animate-bounce">
            <MapPin className="w-7 h-7 text-primary/25" />
          </div>
        </div>
      </div>

      {/* Control buttons skeleton - top right */}
      <div className="absolute top-4 right-4 flex flex-col gap-2">
        <Skeleton className="w-10 h-10 rounded-lg" />
        <Skeleton className="w-10 h-10 rounded-lg" />
        <Skeleton className="w-10 h-10 rounded-lg" />
      </div>

      {/* Style switcher skeleton - top left */}
      <div className="absolute top-4 left-4">
        <Skeleton className="w-32 h-10 rounded-lg" />
      </div>

      {/* Search bar skeleton - top center */}
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 w-full max-w-md px-4">
        <Skeleton className="w-full h-12 rounded-full" />
      </div>

      {/* Loading text with icon */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 bg-background/80 backdrop-blur-sm p-6 rounded-lg shadow-lg">
          <div className="relative">
            <Compass className="w-12 h-12 text-primary animate-spin-slow" />
            <div className="absolute inset-0 animate-ping opacity-20">
              <Compass className="w-12 h-12 text-primary" />
            </div>
          </div>
          <div className="text-center space-y-2">
            <p className="text-sm font-medium text-foreground">Loading map</p>
            <p className="text-xs text-muted-foreground">Preparing your view...</p>
          </div>
          {/* Progress dots */}
          <div className="flex gap-1">
            <div className="w-2 h-2 bg-primary rounded-full animate-bounce" />
            <div className="w-2 h-2 bg-primary rounded-full animate-bounce animation-delay-200" />
            <div className="w-2 h-2 bg-primary rounded-full animate-bounce animation-delay-400" />
          </div>
        </div>
      </div>

      {/* Attribution skeleton - bottom right */}
      <div className="absolute bottom-4 right-4">
        <Skeleton className="w-24 h-6 rounded" />
      </div>
    </div>
  );
};
