import React, { useCallback, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface GestureNavigationProps {
  children: React.ReactNode;
  className?: string;
  enableSwipeNavigation?: boolean;
  enableLongPressActions?: boolean;
}

interface TouchState {
  startX: number;
  startY: number;
  startTime: number;
  currentX: number;
  currentY: number;
}

export const GestureNavigation: React.FC<GestureNavigationProps> = ({
  children,
  className,
  enableSwipeNavigation = true,
  enableLongPressActions = true
}) => {
  const navigate = useNavigate();
  const touchState = useRef<TouchState | null>(null);
  const longPressTimer = useRef<NodeJS.Timeout | null>(null);
  const [isLongPressing, setIsLongPressing] = useState(false);
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | null>(null);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0];
    touchState.current = {
      startX: touch.clientX,
      startY: touch.clientY,
      startTime: Date.now(),
      currentX: touch.clientX,
      currentY: touch.clientY
    };

    // Start long press timer
    if (enableLongPressActions) {
      longPressTimer.current = setTimeout(() => {
        setIsLongPressing(true);
        // Haptic feedback if available
        if ('vibrate' in navigator) {
          navigator.vibrate(50);
        }
      }, 500);
    }
  }, [enableLongPressActions]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!touchState.current) return;

    const touch = e.touches[0];
    touchState.current.currentX = touch.clientX;
    touchState.current.currentY = touch.clientY;

    const deltaX = touch.clientX - touchState.current.startX;
    const deltaY = touch.clientY - touchState.current.startY;

    // Cancel long press if moved too much
    if (Math.abs(deltaX) > 10 || Math.abs(deltaY) > 10) {
      if (longPressTimer.current) {
        clearTimeout(longPressTimer.current);
        longPressTimer.current = null;
      }
      setIsLongPressing(false);
    }

    // Show swipe direction indicator
    if (enableSwipeNavigation && Math.abs(deltaX) > 50) {
      setSwipeDirection(deltaX > 0 ? 'right' : 'left');
    } else {
      setSwipeDirection(null);
    }
  }, [enableSwipeNavigation]);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (!touchState.current) return;

    const deltaX = touchState.current.currentX - touchState.current.startX;
    const deltaY = touchState.current.currentY - touchState.current.startY;
    const deltaTime = Date.now() - touchState.current.startTime;

    // Clear long press timer
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }

    // Handle swipe navigation
    if (enableSwipeNavigation && Math.abs(deltaX) > 100 && Math.abs(deltaY) < 50 && deltaTime < 300) {
      if (deltaX > 0) {
        // Swipe right - go back
        navigate(-1);
      } else {
        // Swipe left - go forward (if possible)
        navigate(1);
      }
    }

    // Reset states
    setIsLongPressing(false);
    setSwipeDirection(null);
    touchState.current = null;
  }, [enableSwipeNavigation, navigate]);

  return (
    <div
      className={cn('relative', className)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {children}

      {/* Swipe direction indicator */}
      {swipeDirection && (
        <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 pointer-events-none">
          <div className="bg-primary/20 backdrop-blur-sm rounded-full p-4 animate-pulse">
            <div className="text-2xl">
              {swipeDirection === 'left' ? '←' : '→'}
            </div>
          </div>
        </div>
      )}

      {/* Long press indicator */}
      {isLongPressing && (
        <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 pointer-events-none">
          <div className="bg-secondary/20 backdrop-blur-sm rounded-full p-4 animate-pulse">
            <div className="w-8 h-8 border-2 border-secondary rounded-full animate-spin" />
          </div>
        </div>
      )}
    </div>
  );
};