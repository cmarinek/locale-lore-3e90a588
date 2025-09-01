
import React, { useMemo, useCallback } from 'react';
import { VirtualList } from '@/components/ui/virtual-list';
import { FactCard } from './FactCard';
import { useDiscoveryStore } from '@/stores/discoveryStore';
import { cn } from '@/lib/utils';

interface VirtualizedFactListProps {
  className?: string;
  itemHeight?: number;
  containerHeight?: number;
}

export const VirtualizedFactList: React.FC<VirtualizedFactListProps> = ({
  className,
  itemHeight = 400,
  containerHeight = 600
}) => {
  const { facts, loadMoreFacts, hasMore } = useDiscoveryStore();

  const renderFactCard = useCallback((fact: any, index: number) => (
    <div className="p-3">
      <FactCard
        fact={fact}
        className={cn(
          "animate-fade-in",
          `animation-delay-${(index % 6) * 100}`
        )}
      />
    </div>
  ), []);

  const handleScroll = useCallback((scrollTop: number) => {
    // Load more when near bottom
    const threshold = containerHeight * 2;
    const maxScroll = facts.length * itemHeight - containerHeight;
    
    if (scrollTop > maxScroll - threshold && hasMore) {
      loadMoreFacts();
    }
  }, [facts.length, itemHeight, containerHeight, hasMore, loadMoreFacts]);

  if (facts.length === 0) {
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
      <VirtualList
        items={facts}
        itemHeight={itemHeight}
        containerHeight={containerHeight}
        renderItem={renderFactCard}
        onScroll={handleScroll}
        className="rounded-lg border"
        overscan={3}
      />
    </div>
  );
};
