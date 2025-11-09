
import React, { useEffect, useRef, useCallback } from 'react';
import { Loader2 } from 'lucide-react';
import { FactCard } from './FactCard';
import { FactCardProgressive } from './FactCardProgressive';
import { FactCardSkeleton } from './FactCardSkeleton';
import { EmptyFactsList } from '@/components/ui/enhanced-empty-states';
import { useDiscoveryStore } from '@/stores/discoveryStore';
import { cn } from '@/lib/utils';

interface InfiniteFactListProps {
  className?: string;
  viewMode?: 'grid' | 'list';
  useProgressiveLoading?: boolean;
}

export const InfiniteFactList: React.FC<InfiniteFactListProps> = ({ 
  className, 
  viewMode = 'grid',
  useProgressiveLoading = true 
}) => {
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


  if (isLoading && facts.length === 0) {
    return (
      <div className={cn("space-y-6", className)}>
        <div className={cn(
          "gap-6",
          viewMode === 'grid' 
            ? "grid md:grid-cols-2 lg:grid-cols-3" 
            : "flex flex-col space-y-4"
        )}>
          {Array.from({ length: 6 }).map((_, index) => (
            <FactCardSkeleton key={index} viewMode={viewMode} />
          ))}
        </div>
      </div>
    );
  }

  if (facts.length === 0 && !isLoading) {
    return (
      <div className={cn("space-y-6", className)}>
        <EmptyFactsList onRefresh={() => loadMoreFacts()} />
      </div>
    );
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Facts Grid/List */}
      <div className={cn(
        "gap-6",
        viewMode === 'grid' 
          ? "grid md:grid-cols-2 lg:grid-cols-3" 
          : "flex flex-col space-y-4"
      )}>
        {facts.map((fact, index) => {
          const FactComponent = useProgressiveLoading ? FactCardProgressive : FactCard;
          return (
            <FactComponent
              key={fact.id}
              fact={fact as any}
              viewMode={viewMode}
              className={cn(
                !useProgressiveLoading && "animate-fade-in",
                // Stagger animation
                `animation-delay-${(index % 6) * 100}`
              )}
            />
          );
        })}
      </div>

      {/* Loading More Indicator with Skeletons */}
      {isLoading && facts.length > 0 && (
        <div className={cn(
          "gap-6",
          viewMode === 'grid' 
            ? "grid md:grid-cols-2 lg:grid-cols-3" 
            : "flex flex-col space-y-4"
        )}>
          {Array.from({ length: 3 }).map((_, index) => (
            <FactCardSkeleton key={`loading-${index}`} viewMode={viewMode} />
          ))}
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
