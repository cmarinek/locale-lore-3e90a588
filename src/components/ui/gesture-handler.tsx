
import React from 'react';
import { motion } from 'framer-motion';
import { useGestures } from '@/hooks/useGestures';

interface GestureHandlerProps {
  children: React.ReactNode;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  onPullToRefresh?: () => Promise<void>;
  className?: string;
  disabled?: boolean;
  dragAxis?: 'x' | 'y' | 'both';
}

export const GestureHandler: React.FC<GestureHandlerProps> = ({
  children,
  onSwipeLeft,
  onSwipeRight,
  onSwipeUp,
  onSwipeDown,
  onPullToRefresh,
  className = "",
  disabled = false,
  dragAxis = 'both'
}) => {
  const { handleDragEnd, handleDrag } = useGestures({
    onSwipeLeft,
    onSwipeRight,
    onSwipeUp,
    onSwipeDown,
    onPullToRefresh
  });

  if (disabled) {
    return <div className={className}>{children}</div>;
  }

  const dragProp = dragAxis === 'both' ? true : dragAxis;

  return (
    <motion.div
      className={className}
      drag={dragProp}
      dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
      dragElastic={0.2}
      onDrag={handleDrag}
      onDragEnd={handleDragEnd}
      whileDrag={{ cursor: 'grabbing' }}
    >
      {children}
    </motion.div>
  );
};
