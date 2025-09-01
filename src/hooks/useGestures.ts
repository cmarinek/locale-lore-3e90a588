
import { useRef, useCallback } from 'react';
import { PanInfo } from 'framer-motion';
import { useAppStore } from '@/stores/appStore';

interface GestureHandlers {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  onPinch?: (scale: number) => void;
  onPullToRefresh?: () => Promise<void>;
}

export const useGestures = (handlers: GestureHandlers) => {
  const { triggerHapticFeedback, handleTouchInteraction } = useAppStore();
  const pullThreshold = useRef(80);
  const swipeThreshold = useRef(50);
  const velocityThreshold = useRef(500);

  const handleDragEnd = useCallback((event: any, info: PanInfo) => {
    const { offset, velocity } = info;
    const absOffsetX = Math.abs(offset.x);
    const absOffsetY = Math.abs(offset.y);
    const absVelocityX = Math.abs(velocity.x);
    const absVelocityY = Math.abs(velocity.y);

    // Determine if it's a swipe based on distance or velocity
    const isSwipe = absOffsetX > swipeThreshold.current || 
                   absOffsetY > swipeThreshold.current ||
                   absVelocityX > velocityThreshold.current ||
                   absVelocityY > velocityThreshold.current;

    if (!isSwipe) return;

    // Determine direction
    if (absOffsetX > absOffsetY) {
      // Horizontal swipe
      if (offset.x > 0) {
        handlers.onSwipeRight?.();
        triggerHapticFeedback('light');
        handleTouchInteraction('swipe');
      } else {
        handlers.onSwipeLeft?.();
        triggerHapticFeedback('light');
        handleTouchInteraction('swipe');
      }
    } else {
      // Vertical swipe
      if (offset.y > 0) {
        // Pull to refresh check
        if (offset.y > pullThreshold.current && handlers.onPullToRefresh) {
          triggerHapticFeedback('medium');
          handlers.onPullToRefresh();
        } else {
          handlers.onSwipeDown?.();
          triggerHapticFeedback('light');
        }
        handleTouchInteraction('swipe');
      } else {
        handlers.onSwipeUp?.();
        triggerHapticFeedback('light');
        handleTouchInteraction('swipe');
      }
    }
  }, [handlers, triggerHapticFeedback, handleTouchInteraction]);

  const handleDrag = useCallback((event: any, info: PanInfo) => {
    // Provide real-time feedback during drag
    const { offset } = info;
    
    if (Math.abs(offset.y) > 20 && offset.y > 0 && handlers.onPullToRefresh) {
      // Pull to refresh feedback
      const progress = Math.min(offset.y / pullThreshold.current, 1);
      if (progress > 0.5) {
        triggerHapticFeedback('light');
      }
    }
  }, [handlers, triggerHapticFeedback]);

  return {
    handleDragEnd,
    handleDrag,
    swipeThreshold: swipeThreshold.current,
    pullThreshold: pullThreshold.current
  };
};
