
import React, { useEffect, useRef, useCallback } from 'react';
import { Loader2 } from 'lucide-react';
import { FactCard } from './FactCard';
import { VirtualizedFactList } from './VirtualizedFactList';
import { Skeleton } from '@/components/ui/skeleton';
import { useDiscoveryStore } from '@/stores/discoveryStore';
import { usePerformanceStore } from '@/stores/performanceStore';
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';
import { cn } from '@/lib/utils';

interface OptimizedInfiniteFactListProps {
  className?: string;
}

export const OptimizedInfiniteFactList: React.FC<OptimizedInfiniteFactListProps> = ({ className }) => {
  const observerRef = useRef<HTMLDivElement>(null);
  
  const { 
    facts, 
    isLoading, 
    hasMore, 
    loadMoreFacts 
  } = useDiscoveryStore();

  const { enableVirtualization } = usePerformanceStore();

  // Use intersection observer for better performance
  const { elementRef: intersectionRef, entry } = useIntersectionObserver({
    threshold: 0.1,
    rootMargin: '100px'
  });

  const handleObserver = useCallback(() => {
    if (entry?.isIntersecting && hasMore && !isLoading) {
      loadMoreFacts();
    }
  }, [entry?.isIntersecting, hasMore, isLoading, loadMoreFacts]);

  useEffect(() => {
    handleObserver();
  }, [handleObserver]);

  const LoadingSkeleton = React.memo(() => (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, index) => (
        <div key={index} className="space-y-3">
          <Skeleton className="h-48 w-full rounded-lg" />
          <div className="space-y-2 p-4">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-2/3" />
          </div>
        </div>
      ))}
    </div>
  ));

  if (isLoading && facts.length === 0) {
    return (
      <div className={cn("space-y-6", className)}>
        <LoadingSkeleton />
      </div>
    );
  }

  if (facts.length === 0 && !isLoading) {
    return (
      <div className={cn("text-center py-12", className)}>
        <div className="space-y-3">
          <div className="text-6xl">🔍</div>
          <h3 className="text-lg font-semibold">No facts found</h3>
          <p className="text-muted-foreground max-w-md mx-auto">
            Try adjusting your search terms or filters to discover more interesting facts.
          </p>
        </div>
      </div>
    );
  }

  // Use virtualization for large lists
  if (enableVirtualization && facts.length > 50) {
    return (
      <div className={cn("space-y-6", className)}>
        <VirtualizedFactList 
          containerHeight={600}
          itemHeight={400}
        />
      </div>
    );
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Facts Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {facts.map((fact, index) => (
          <FactCard
            key={fact.id}
            fact={fact}
            className={cn(
              "animate-fade-in",
              // Stagger animation
              `animation-delay-${(index % 6) * 100}`
            )}
          />
        ))}
      </div>

      {/* Loading More Indicator */}
      {isLoading && facts.length > 0 && (
        <div className="flex justify-center py-8">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="text-sm">Loading more facts...</span>
          </div>
        </div>
      )}

      {/* Intersection Observer Target */}
      <div
        ref={intersectionRef}
        className="h-10 flex items-center justify-center"
      >
        {!hasMore && facts.length > 0 && (
          <p className="text-sm text-muted-foreground">
            You've reached the end of the facts!
          </p>
        )}
      </div>
    </div>
  );
};
