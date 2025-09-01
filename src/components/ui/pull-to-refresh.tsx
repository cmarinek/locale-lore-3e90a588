import React, { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { ChevronDown, RotateCcw } from 'lucide-react';
import { useAppStore } from '@/stores/appStore';

interface PullToRefreshProps {
  children: React.ReactNode;
  onRefresh: () => Promise<void>;
  threshold?: number;
  refreshDistance?: number;
  disabled?: boolean;
  className?: string;
}

export const PullToRefresh: React.FC<PullToRefreshProps> = ({
  children,
  onRefresh,
  threshold = 60,
  refreshDistance = 100,
  disabled = false,
  className,
}) => {
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [canPull, setCanPull] = useState(false);
  const touchStartRef = useRef<number>(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const { triggerHapticFeedback, mobile } = useAppStore();

  const isAtTop = () => {
    const container = containerRef.current;
    return container ? container.scrollTop <= 0 : false;
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (disabled || !isAtTop()) return;
    touchStartRef.current = e.touches[0].clientY;
    setCanPull(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (disabled || !canPull || isRefreshing) return;

    const currentY = e.touches[0].clientY;
    const diff = currentY - touchStartRef.current;

    if (diff > 0 && isAtTop()) {
      e.preventDefault();
      const distance = Math.min(diff * 0.5, refreshDistance);
      setPullDistance(distance);

      // Trigger haptic feedback at threshold
      if (distance >= threshold && pullDistance < threshold) {
        triggerHapticFeedback('medium');
      }
    }
  };

  const handleTouchEnd = async () => {
    if (disabled || !canPull) return;

    setCanPull(false);

    if (pullDistance >= threshold && !isRefreshing) {
      setIsRefreshing(true);
      triggerHapticFeedback('heavy');
      
      try {
        await onRefresh();
      } finally {
        setIsRefreshing(false);
      }
    }

    setPullDistance(0);
  };

  const refreshIndicatorOpacity = Math.min(pullDistance / threshold, 1);
  const refreshIndicatorScale = Math.min(0.5 + (pullDistance / threshold) * 0.5, 1);
  const refreshIndicatorRotation = (pullDistance / threshold) * 180;

  return (
    <div
      ref={containerRef}
      className={cn("relative overflow-auto", className)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      style={{ 
        transform: `translateY(${pullDistance > 0 ? pullDistance * 0.3 : 0}px)`,
        transition: pullDistance === 0 ? 'transform 0.3s ease-out' : 'none',
      }}
    >
      {/* Pull to refresh indicator */}
      <div
        className={cn(
          "absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-full",
          "flex items-center justify-center w-12 h-12 rounded-full",
          "bg-primary/10 backdrop-blur-md border border-primary/20",
          "transition-all duration-200 z-50"
        )}
        style={{
          opacity: refreshIndicatorOpacity,
          transform: `translateX(-50%) translateY(-100%) scale(${refreshIndicatorScale})`,
        }}
      >
        {isRefreshing ? (
          <RotateCcw 
            className={cn(
              "w-6 h-6 text-primary",
              !mobile.reduceAnimations && "animate-spin"
            )} 
          />
        ) : (
          <ChevronDown
            className="w-6 h-6 text-primary"
            style={{
              transform: `rotate(${refreshIndicatorRotation}deg)`,
            }}
          />
        )}
      </div>

      {children}
    </div>
  );
};