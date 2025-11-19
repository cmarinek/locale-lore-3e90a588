import { useRef, useCallback, useEffect } from 'react';
import { useAppStore } from '@/stores/appStore';

interface TouchPoint {
  id: number;
  x: number;
  y: number;
}

interface GestureState {
  scale: number;
  rotation: number;
  translation: { x: number; y: number };
  velocity: { x: number; y: number };
}

interface AdvancedGestureHandlers {
  onPinch?: (scale: number, center: { x: number; y: number }) => void;
  onRotate?: (rotation: number, center: { x: number; y: number }) => void;
  onPan?: (translation: { x: number; y: number }, velocity: { x: number; y: number }) => void;
  onSwipe?: (direction: 'up' | 'down' | 'left' | 'right', velocity: number) => void;
  onTap?: (point: { x: number; y: number }) => void;
  onDoubleTap?: (point: { x: number; y: number }) => void;
  onLongPress?: (point: { x: number; y: number }) => void;
  onMomentumEnd?: () => void;
}

export const useAdvancedGestures = (
  elementRef: React.RefObject<HTMLElement>,
  handlers: AdvancedGestureHandlers
) => {
  const { triggerHapticFeedback } = useAppStore();
  
  const touches = useRef<Map<number, TouchPoint>>(new Map());
  const gestureState = useRef<GestureState>({
    scale: 1,
    rotation: 0,
    translation: { x: 0, y: 0 },
    velocity: { x: 0, y: 0 }
  });
  
  const lastGestureTime = useRef(0);
  const tapCount = useRef(0);
  const longPressTimer = useRef<NodeJS.Timeout>();
  const momentumTimer = useRef<NodeJS.Timeout>();
  const lastTouchTime = useRef(0);

  // Calculate distance between two points
  const getDistance = useCallback((p1: TouchPoint, p2: TouchPoint) => {
    return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
  }, []);

  // Calculate angle between two points
  const getAngle = useCallback((p1: TouchPoint, p2: TouchPoint) => {
    return Math.atan2(p2.y - p1.y, p2.x - p1.x) * 180 / Math.PI;
  }, []);

  // Calculate center point of touches
  const getCenter = useCallback((touchArray: TouchPoint[]) => {
    const x = touchArray.reduce((sum, touch) => sum + touch.x, 0) / touchArray.length;
    const y = touchArray.reduce((sum, touch) => sum + touch.y, 0) / touchArray.length;
    return { x, y };
  }, []);

  // Handle touch start
  const handleTouchStart = useCallback((e: TouchEvent) => {
    const now = Date.now();
    lastTouchTime.current = now;

    Array.from(e.changedTouches).forEach(touch => {
      touches.current.set(touch.identifier, {
        id: touch.identifier,
        x: touch.clientX,
        y: touch.clientY
      });
    });

    const touchArray = Array.from(touches.current.values());
    
    // Single touch - potential tap or long press
    if (touchArray.length === 1) {
      const touch = touchArray[0];
      
      // Setup long press detection
      longPressTimer.current = setTimeout(() => {
        handlers.onLongPress?.({ x: touch.x, y: touch.y });
        triggerHapticFeedback('medium');
      }, 500);
      
      // Handle tap counting for double tap
      tapCount.current++;
      if (tapCount.current === 1) {
        setTimeout(() => {
          if (tapCount.current === 1) {
            handlers.onTap?.({ x: touch.x, y: touch.y });
          } else if (tapCount.current === 2) {
            handlers.onDoubleTap?.({ x: touch.x, y: touch.y });
            triggerHapticFeedback('light');
          }
          tapCount.current = 0;
        }, 300);
      }
    }

    // Multi-touch gestures
    if (touchArray.length >= 2) {
      if (longPressTimer.current) {
        clearTimeout(longPressTimer.current);
      }
      
      const distance = getDistance(touchArray[0], touchArray[1]);
      const angle = getAngle(touchArray[0], touchArray[1]);
      
      gestureState.current = {
        scale: 1,
        rotation: angle,
        translation: { x: 0, y: 0 },
        velocity: { x: 0, y: 0 }
      };
    }

    e.preventDefault();
  }, [handlers, triggerHapticFeedback, getDistance, getAngle]);

  // Handle touch move
  const handleTouchMove = useCallback((e: TouchEvent) => {
    const now = Date.now();
    const deltaTime = now - lastGestureTime.current;
    lastGestureTime.current = now;

    // Clear long press if moving
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
    }

    // Update touch positions
    Array.from(e.changedTouches).forEach(touch => {
      if (touches.current.has(touch.identifier)) {
        const prevTouch = touches.current.get(touch.identifier);
        const deltaX = touch.clientX - prevTouch.x;
        const deltaY = touch.clientY - prevTouch.y;
        
        // Calculate velocity
        if (deltaTime > 0) {
          gestureState.current.velocity = {
            x: deltaX / deltaTime * 1000,
            y: deltaY / deltaTime * 1000
          };
        }

        touches.current.set(touch.identifier, {
          id: touch.identifier,
          x: touch.clientX,
          y: touch.clientY
        });
      }
    });

    const touchArray = Array.from(touches.current.values());

    // Single touch - panning
    if (touchArray.length === 1) {
      handlers.onPan?.(
        gestureState.current.translation,
        gestureState.current.velocity
      );
    }

    // Two finger gestures
    if (touchArray.length === 2) {
      const distance = getDistance(touchArray[0], touchArray[1]);
      const angle = getAngle(touchArray[0], touchArray[1]);
      const center = getCenter(touchArray);
      
      // Pinch to zoom
      const scaleChange = distance / getDistance(touchArray[0], touchArray[1]);
      if (Math.abs(scaleChange - 1) > 0.01) {
        handlers.onPinch?.(scaleChange, center);
        triggerHapticFeedback('light');
      }
      
      // Rotation
      const rotationChange = angle - gestureState.current.rotation;
      if (Math.abs(rotationChange) > 5) {
        handlers.onRotate?.(rotationChange, center);
      }
    }

    e.preventDefault();
  }, [handlers, triggerHapticFeedback, getDistance, getAngle, getCenter]);

  // Handle touch end
  const handleTouchEnd = useCallback((e: TouchEvent) => {
    Array.from(e.changedTouches).forEach(touch => {
      touches.current.delete(touch.identifier);
    });

    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
    }

    // Handle swipe detection
    const velocity = gestureState.current.velocity;
    const speed = Math.sqrt(velocity.x * velocity.x + velocity.y * velocity.y);
    
    if (speed > 500) { // Minimum swipe speed
      const angle = Math.atan2(velocity.y, velocity.x) * 180 / Math.PI;
      let direction: 'up' | 'down' | 'left' | 'right';
      
      if (angle >= -45 && angle <= 45) direction = 'right';
      else if (angle >= 45 && angle <= 135) direction = 'down';
      else if (angle >= 135 || angle <= -135) direction = 'left';
      else direction = 'up';
      
      handlers.onSwipe?.(direction, speed);
      triggerHapticFeedback('light');
    }

    // Momentum scrolling
    if (speed > 100 && touches.current.size === 0) {
      const currentVelocity = { ...velocity };
      const friction = 0.95;
      
      const animateMomentum = () => {
        currentVelocity.x *= friction;
        currentVelocity.y *= friction;
        
        const currentSpeed = Math.sqrt(
          currentVelocity.x * currentVelocity.x + 
          currentVelocity.y * currentVelocity.y
        );
        
        if (currentSpeed > 10) {
          handlers.onPan?.(
            {
              x: currentVelocity.x * 0.016,
              y: currentVelocity.y * 0.016
            },
            currentVelocity
          );
          momentumTimer.current = setTimeout(animateMomentum, 16);
        } else {
          handlers.onMomentumEnd?.();
        }
      };
      
      if (momentumTimer.current) {
        clearTimeout(momentumTimer.current);
      }
      momentumTimer.current = setTimeout(animateMomentum, 16);
    }

    e.preventDefault();
  }, [handlers, triggerHapticFeedback]);

  // Setup event listeners
  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    element.addEventListener('touchstart', handleTouchStart, { passive: false });
    element.addEventListener('touchmove', handleTouchMove, { passive: false });
    element.addEventListener('touchend', handleTouchEnd, { passive: false });

    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchmove', handleTouchMove);
      element.removeEventListener('touchend', handleTouchEnd);
      
      if (longPressTimer.current) clearTimeout(longPressTimer.current);
      if (momentumTimer.current) clearTimeout(momentumTimer.current);
    };
  }, [elementRef, handleTouchStart, handleTouchMove, handleTouchEnd]);

  return {
    gestureState: gestureState.current,
    activeToches: touches.current.size
  };
};