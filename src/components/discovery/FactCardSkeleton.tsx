import { Card, CardContent } from '@/components/ui/ios-card';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

interface FactCardSkeletonProps {
  viewMode?: 'grid' | 'list';
  className?: string;
}

export const FactCardSkeleton = ({ viewMode = 'grid', className }: FactCardSkeletonProps) => {
  if (viewMode === 'list') {
    return (
      <Card variant="elevated" className={cn("overflow-hidden w-full", className)}>
        <CardContent className="p-0">
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 p-3">
            {/* Image Skeleton */}
            <Skeleton className="w-full sm:w-24 md:w-32 h-32 sm:h-20 shrink-0 rounded-lg" />

            {/* Content */}
            <div className="flex-1 space-y-3">
              {/* Header */}
              <div className="flex items-start justify-between gap-2">
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-5 w-3/4" />
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-4 w-4 rounded-full" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                </div>
                <Skeleton className="h-8 w-8 rounded-md" />
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-5/6" />
              </div>

              {/* Stats */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-5 w-12" />
                  <Skeleton className="h-5 w-12" />
                </div>
                <Skeleton className="h-5 w-24" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card variant="elevated" className={cn("overflow-hidden w-full max-w-sm mx-auto", className)}>
      <CardContent className="p-0">
        {/* Image Skeleton */}
        <Skeleton className="h-48 w-full rounded-t-lg" />

        {/* Content */}
        <div className="p-3 space-y-3">
          {/* Title & Category */}
          <div className="space-y-2">
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>

          {/* Location */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 flex-1">
              <Skeleton className="h-4 w-4 rounded-full" />
              <Skeleton className="h-4 w-32" />
            </div>
            <Skeleton className="h-8 w-8 rounded-md" />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-4/5" />
          </div>

          {/* Stats */}
          <div className="flex items-center justify-between pt-2 border-t border-border/50">
            <div className="flex items-center gap-3">
              <Skeleton className="h-5 w-12" />
              <Skeleton className="h-5 w-8" />
            </div>
            <div className="flex items-center gap-2">
              <Skeleton className="h-6 w-6 rounded-full" />
              <Skeleton className="h-4 w-16" />
            </div>
          </div>

          {/* Footer */}
          <Skeleton className="h-3 w-24" />
        </div>
      </CardContent>
    </Card>
  );
};
