import React, { useEffect, useRef, useCallback } from 'react';
import { Loader2 } from 'lucide-react';
import { FactCard } from './FactCard';
import { Skeleton } from '@/components/ui/skeleton';
import { useDiscoveryStore } from '@/stores/discoveryStore';
import { cn } from '@/lib/utils';

interface InfiniteFactListProps {
  className?: string;
}

export const InfiniteFactList: React.FC<InfiniteFactListProps> = ({ className }) => {
  const observerRef = useRef<HTMLDivElement>(null);
  
  const { 
    facts, 
    isLoading, 
    hasMore, 
    loadMoreFacts 
  } = useDiscoveryStore();

  const handleObserver = useCallback((entries: IntersectionObserverEntry[]) => {
    const [target] = entries;
    if (target.isIntersecting && hasMore && !isLoading) {
      loadMoreFacts();
    }
  }, [hasMore, isLoading, loadMoreFacts]);

  useEffect(() => {
    const element = observerRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(handleObserver, {
      threshold: 0.1,
      rootMargin: '100px'
    });

    observer.observe(element);

    return () => {
      if (element) observer.unobserve(element);
    };
  }, [handleObserver]);

  const LoadingSkeleton = () => (
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
  );

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
        ref={observerRef}
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