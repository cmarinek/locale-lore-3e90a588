import { Skeleton } from "@/components/ui/skeleton";

export function MapLoadingSkeleton() {
  return (
    <div className="relative w-full h-full bg-muted/20 rounded-lg overflow-hidden animate-fade-in">
      {/* Map placeholder */}
      <div className="absolute inset-0 bg-gradient-to-br from-muted/40 to-muted/20">
        {/* Pulsing location markers */}
        <div className="absolute top-1/4 left-1/3 w-8 h-8 rounded-full bg-primary/20 animate-pulse" />
        <div className="absolute top-1/2 left-1/2 w-8 h-8 rounded-full bg-primary/30 animate-pulse delay-100" />
        <div className="absolute top-2/3 left-2/3 w-8 h-8 rounded-full bg-primary/20 animate-pulse delay-200" />
      </div>

      {/* Controls skeleton */}
      <div className="absolute top-4 right-4 space-y-2">
        <Skeleton className="h-10 w-10 rounded-md" />
        <Skeleton className="h-10 w-10 rounded-md" />
        <Skeleton className="h-10 w-10 rounded-md" />
      </div>

      {/* Search bar skeleton */}
      <div className="absolute top-4 left-4 right-20">
        <Skeleton className="h-12 w-full max-w-md rounded-lg" />
      </div>

      {/* Loading text */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto" />
          <p className="text-sm text-muted-foreground">Loading map...</p>
        </div>
      </div>
    </div>
  );
}
