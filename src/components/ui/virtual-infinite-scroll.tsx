import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { FixedSizeList as List } from 'react-window';
import InfiniteLoader from 'react-window-infinite-loader';
import { cn } from '@/lib/utils';
import { LoadingList } from './enhanced-loading-states';
import { EmptyState } from './enhanced-empty-states';

interface VirtualInfiniteScrollProps<T> {
  items: T[];
  hasNextPage: boolean;
  isNextPageLoading: boolean;
  loadNextPage: () => Promise<void>;
  renderItem: (props: { index: number; style: React.CSSProperties; data: T[] }) => React.ReactNode;
  itemHeight: number;
  containerHeight?: number;
  className?: string;
  emptyState?: React.ReactNode;
  loadingState?: React.ReactNode;
  overscanCount?: number;
  threshold?: number;
}

export const VirtualInfiniteScroll = <T,>({
  items,
  hasNextPage,
  isNextPageLoading,
  loadNextPage,
  renderItem,
  itemHeight,
  containerHeight = 600,
  className,
  emptyState,
  loadingState,
  overscanCount = 5,
  threshold = 15
}: VirtualInfiniteScrollProps<T>) => {
  const loaderRef = useRef<InfiniteLoader>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Calculate total item count including loading placeholders
  const itemCount = hasNextPage ? items.length + 1 : items.length;

  // Determine if an item is loaded
  const isItemLoaded = useCallback((index: number) => {
    return !!items[index];
  }, [items]);

  // Handle loading more items
  const handleLoadMoreItems = useCallback(async (startIndex: number, stopIndex: number) => {
    if (isLoading || !hasNextPage) return;
    
    setIsLoading(true);
    try {
      await loadNextPage();
    } catch (error) {
      console.error('Failed to load more items:', error);
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, hasNextPage, loadNextPage]);

  // Enhanced item renderer with loading states
  const itemRenderer = useCallback(({ index, style }: any) => {
    const isLoaded = isItemLoaded(index);
    
    if (!isLoaded) {
      // Show loading skeleton for unloaded items
      return (
        <div style={style} className="px-4">
          <div className="animate-pulse">
            <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
            <div className="h-3 bg-muted rounded w-1/2"></div>
          </div>
        </div>
      );
    }

    return renderItem({ index, style, data: items });
  }, [items, renderItem, isItemLoaded]);

  // Memoize the infinite loader configuration
  const infiniteLoaderProps = useMemo(() => ({
    isItemLoaded,
    itemCount,
    loadMoreItems: handleLoadMoreItems,
    threshold,
    minimumBatchSize: 10
  }), [isItemLoaded, itemCount, handleLoadMoreItems, threshold]);

  // Reset loader when items change significantly
  useEffect(() => {
    if (loaderRef.current) {
      loaderRef.current.resetloadMoreItemsCache();
    }
  }, [items.length]);

  // Show loading state for initial load
  if (items.length === 0 && isNextPageLoading) {
    return loadingState || <LoadingList count={6} />;
  }

  // Show empty state when no items
  if (items.length === 0 && !isNextPageLoading) {
    return emptyState || (
      <EmptyState
        title="No items found"
        description="There are no items to display at the moment."
      />
    );
  }

  return (
    <div className={cn("w-full", className)}>
      <InfiniteLoader
        ref={loaderRef}
        {...infiniteLoaderProps}
      >
        {({ onItemsRendered, ref }) => (
          <List
            ref={ref}
            height={containerHeight}
            width="100%"
            itemCount={itemCount}
            itemSize={itemHeight}
            onItemsRendered={onItemsRendered}
            overscanCount={overscanCount}
            itemData={items}
          >
            {itemRenderer}
          </List>
        )}
      </InfiniteLoader>
      
      {/* Loading indicator at bottom */}
      {isNextPageLoading && items.length > 0 && (
        <div className="flex justify-center py-4">
          <div className="flex items-center gap-2 text-muted-foreground">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
            <span className="text-sm">Loading more...</span>
          </div>
        </div>
      )}
    </div>
  );
};

// Optimized grid version for card layouts
interface VirtualInfiniteGridProps<T> extends Omit<VirtualInfiniteScrollProps<T>, 'itemHeight' | 'renderItem'> {
  renderItem: (props: { index: number; style: React.CSSProperties; data: T[] }) => React.ReactNode;
  itemHeight: number;
  itemsPerRow?: number;
  gap?: number;
}

export const VirtualInfiniteGrid = <T,>({
  items,
  hasNextPage,
  isNextPageLoading,
  loadNextPage,
  renderItem,
  itemHeight,
  itemsPerRow = 3,
  gap = 16,
  containerHeight = 600,
  className,
  emptyState,
  loadingState,
  overscanCount = 5,
  threshold = 15
}: VirtualInfiniteGridProps<T>) => {
  // Calculate row count and items per row
  const rowCount = Math.ceil(items.length / itemsPerRow);
  const totalRowCount = hasNextPage ? rowCount + 1 : rowCount;

  const rowRenderer = useCallback(({ index, style }: any) => {
    const startIndex = index * itemsPerRow;
    const endIndex = Math.min(startIndex + itemsPerRow, items.length);
    const rowItems = items.slice(startIndex, endIndex);

    // Show loading row
    if (startIndex >= items.length) {
      return (
        <div style={style} className="flex gap-4 px-4">
          {Array.from({ length: itemsPerRow }).map((_, i) => (
            <div key={i} className="flex-1 animate-pulse">
              <div className="h-32 bg-muted rounded-lg mb-2"></div>
              <div className="h-4 bg-muted rounded w-3/4"></div>
            </div>
          ))}
        </div>
      );
    }

    return (
      <div style={style} className="flex gap-4 px-4">
        {rowItems.map((_, itemIndex) => {
          const globalIndex = startIndex + itemIndex;
          return renderItem({ 
            index: globalIndex, 
            style: { flex: '1', height: itemHeight }, 
            data: items 
          });
        })}
        {/* Fill remaining space in row */}
        {rowItems.length < itemsPerRow && (
          <div style={{ flex: itemsPerRow - rowItems.length }} />
        )}
      </div>
    );
  }, [items, itemsPerRow, itemHeight, renderItem]);

  return (
    <VirtualInfiniteScroll
      items={Array.from({ length: totalRowCount }).map((_, i) => i)}
      hasNextPage={hasNextPage}
      isNextPageLoading={isNextPageLoading}
      loadNextPage={loadNextPage}
      renderItem={rowRenderer}
      itemHeight={itemHeight + gap}
      containerHeight={containerHeight}
      className={className}
      emptyState={emptyState}
      loadingState={loadingState}
      overscanCount={overscanCount}
      threshold={threshold}
    />
  );
};