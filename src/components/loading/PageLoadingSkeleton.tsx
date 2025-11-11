import { Skeleton, SkeletonCard } from "@/components/ui/skeleton";

export function PageLoadingSkeleton() {
  return (
    <div className="container mx-auto py-8 px-4 space-y-8 animate-fade-in">
      {/* Hero Section Skeleton */}
      <div className="space-y-4">
        <Skeleton className="h-12 w-3/4 mx-auto" />
        <Skeleton className="h-6 w-1/2 mx-auto" />
      </div>

      {/* Content Grid Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </div>
    </div>
  );
}
