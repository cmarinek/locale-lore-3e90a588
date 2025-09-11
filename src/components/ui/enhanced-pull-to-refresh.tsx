import React, { useState, useEffect, useRef, useCallback } from 'react';
import { RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EnhancedPullToRefreshProps {
  children: React.ReactNode;
  onRefresh: () => Promise<void> | void;
  isRefreshing?: boolean;
  threshold?: number;
  className?: string;
  disabled?: boolean;
}

export const EnhancedPullToRefresh: React.FC<EnhancedPullToRefreshProps> = ({
  children,
  onRefresh,
  isRefreshing = false,
  threshold = 80,
  className,
  disabled = false
}) => {
  const [pullDistance, setPullDistance] = useState(0);
  const [isPulling, setIsPulling] = useState(false);
  const [isTriggered, setIsTriggered] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const startY = useRef(0);
  const currentY = useRef(0);

  const handleTouchStart = useCallback((e: TouchEvent) => {
    if (disabled || isRefreshing) return;
    
    const container = containerRef.current;
    if (!container || container.scrollTop > 0) return;

    startY.current = e.touches[0].clientY;
    setIsPulling(true);
  }, [disabled, isRefreshing]);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!isPulling || disabled || isRefreshing) return;

    const container = containerRef.current;
    if (!container || container.scrollTop > 0) {
      setIsPulling(false);
      setPullDistance(0);
      return;
    }

    currentY.current = e.touches[0].clientY;
    const distance = Math.max(0, (currentY.current - startY.current) * 0.5);
    
    if (distance > 0) {
      e.preventDefault(); // Prevent default scroll behavior
      setPullDistance(Math.min(distance, threshold * 1.5));
      setIsTriggered(distance >= threshold);
    }
  }, [isPulling, disabled, isRefreshing, threshold]);

  const handleTouchEnd = useCallback(async () => {
    if (!isPulling || disabled) return;

    setIsPulling(false);

    if (isTriggered && !isRefreshing) {
      try {
        await onRefresh();
      } catch (error) {
        console.error('Pull to refresh error:', error);
      }
    }

    setPullDistance(0);
    setIsTriggered(false);
  }, [isPulling, isTriggered, isRefreshing, disabled, onRefresh]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.addEventListener('touchstart', handleTouchStart, { passive: false });
    container.addEventListener('touchmove', handleTouchMove, { passive: false });
    container.addEventListener('touchend', handleTouchEnd);

    return () => {
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleTouchEnd);
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd]);

  const pullProgress = Math.min(pullDistance / threshold, 1);
  const iconRotation = pullProgress * 180;

  return (
    <div 
      ref={containerRef}
      className={cn("relative overflow-auto", className)}
      style={{
        transform: `translateY(${Math.min(pullDistance, threshold)}px)`,
        transition: isPulling ? 'none' : 'transform 0.3s ease-out'
      }}
    >
      {/* Pull to Refresh Indicator */}
      <div 
        className="absolute top-0 left-0 right-0 z-50 flex items-center justify-center bg-background/95 backdrop-blur-sm border-b border-border/50"
        style={{
          height: `${Math.max(pullDistance, isRefreshing ? 60 : 0)}px`,
          transform: `translateY(-${Math.max(pullDistance, isRefreshing ? 60 : 0)}px)`,
          transition: isPulling || isRefreshing ? 'none' : 'all 0.3s ease-out'
        }}
      >
        <div className="flex flex-col items-center space-y-2 py-3">
          <div className={cn(
            "transition-all duration-200",
            isRefreshing ? "animate-spin" : ""
          )}>
            <RefreshCw 
              className={cn(
                "w-5 h-5 transition-all duration-200",
                isTriggered ? "text-primary" : "text-muted-foreground"
              )}
              style={{
                transform: isRefreshing ? 'none' : `rotate(${iconRotation}deg)`
              }}
            />
          </div>
          <p className="text-xs text-muted-foreground">
            {isRefreshing 
              ? 'Refreshing...'
              : isTriggered 
                ? 'Release to refresh' 
                : 'Pull to refresh'
            }
          </p>
        </div>
      </div>

      {children}
    </div>
  );
};