
import React, { useEffect, useRef, useCallback } from 'react';
import { Loader2 } from 'lucide-react';
import { FactCard } from './FactCard';
import { LoadingList } from '@/components/ui/enhanced-loading-states';
import { EmptyFactsList } from '@/components/ui/enhanced-empty-states';
import { useDiscoveryStore } from '@/stores/discoveryStore';
import { cn } from '@/lib/utils';

interface InfiniteFactListProps {
  className?: string;
  viewMode?: 'grid' | 'list';
}

export const InfiniteFactList: React.FC<InfiniteFactListProps> = ({ className, viewMode = 'grid' }) => {
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
        <LoadingList viewMode={viewMode} />
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
        {facts.map((fact, index) => (
          <FactCard
            key={fact.id}
            fact={fact as any}
            viewMode={viewMode}
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
