
import React, { useState, useRef } from 'react';
import { motion, useMotionValue, useTransform, PanInfo } from 'framer-motion';
import { RefreshCw, ArrowDown } from 'lucide-react';
import { useAppStore } from '@/stores/appStore';
import { useAnimations } from '@/hooks/useAnimations';

interface EnhancedPullToRefreshProps {
  children: React.ReactNode;
  onRefresh: () => Promise<void>;
  threshold?: number;
  maxPull?: number;
  disabled?: boolean;
  className?: string;
}

export const EnhancedPullToRefresh: React.FC<EnhancedPullToRefreshProps> = ({
  children,
  onRefresh,
  threshold = 80,
  maxPull = 120,
  disabled = false,
  className = ""
}) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isPulling, setIsPulling] = useState(false);
  const { triggerHapticFeedback } = useAppStore();
  const { shouldReduceMotion } = useAnimations();
  
  const y = useMotionValue(0);
  const pullProgress = useTransform(y, [0, threshold], [0, 1]);
  const iconRotation = useTransform(y, [0, threshold], [0, 180]);
  const iconScale = useTransform(y, [0, threshold/2, threshold], [0.8, 1.2, 1]);
  
  const containerRef = useRef<HTMLDivElement>(null);

  const handleDragStart = () => {
    if (disabled || isRefreshing) return;
    const container = containerRef.current;
    if (container && container.scrollTop <= 0) {
      setIsPulling(true);
    }
  };

  const handleDrag = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (disabled || isRefreshing || !isPulling) return;
    
    const dragY = Math.max(0, Math.min(info.point.y, maxPull));
    y.set(dragY);

    // Haptic feedback at threshold
    if (dragY >= threshold && y.getPrevious() < threshold) {
      triggerHapticFeedback('medium');
    }
  };

  const handleDragEnd = async (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (disabled || isRefreshing || !isPulling) return;
    
    setIsPulling(false);
    const dragY = y.get();

    if (dragY >= threshold) {
      setIsRefreshing(true);
      triggerHapticFeedback('heavy');
      
      try {
        await onRefresh();
      } finally {
        setIsRefreshing(false);
      }
    }

    // Animate back to original position
    y.set(0);
  };

  const refreshIndicatorOpacity = useTransform(y, [0, threshold/2], [0, 1]);
  const pullDistance = useTransform(y, (value) => Math.min(value * 0.5, maxPull * 0.5));

  if (shouldReduceMotion) {
    return (
      <div className={className} ref={containerRef}>
        {children}
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden ${className}`} ref={containerRef}>
      {/* Pull indicator */}
      <motion.div
        className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-full flex items-center justify-center w-16 h-16 bg-background/90 backdrop-blur-md rounded-full border border-border shadow-lg z-10"
        style={{
          opacity: refreshIndicatorOpacity,
          y: pullDistance
        }}
      >
        {isRefreshing ? (
          <motion.div
            animate={{ rotate: 360 }}
            transition={{
              duration: 1,
              repeat: Infinity,
              ease: "linear"
            }}
          >
            <RefreshCw className="w-6 h-6 text-primary" />
          </motion.div>
        ) : (
          <motion.div
            style={{
              rotate: iconRotation,
              scale: iconScale
            }}
          >
            <ArrowDown className="w-6 h-6 text-primary" />
          </motion.div>
        )}
      </motion.div>

      {/* Content container */}
      <motion.div
        drag="y"
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={0.3}
        onDragStart={handleDragStart}
        onDrag={handleDrag}
        onDragEnd={handleDragEnd}
        style={{ y: pullDistance }}
        className="h-full"
      >
        {children}
      </motion.div>
    </div>
  );
};
