
import React from 'react';
import { motion } from 'framer-motion';
import { useAnimations } from '@/hooks/useAnimations';
import { cn } from '@/lib/utils';

interface EnhancedSkeletonProps {
  className?: string;
  variant?: 'text' | 'avatar' | 'card' | 'image' | 'button';
  lines?: number;
  showShimmer?: boolean;
}

export const EnhancedSkeleton: React.FC<EnhancedSkeletonProps> = ({
  className,
  variant = 'text',
  lines = 1,
  showShimmer = true
}) => {
  const { shimmerVariants, shouldReduceMotion } = useAnimations();

  const getVariantClasses = () => {
    switch (variant) {
      case 'avatar':
        return 'w-10 h-10 rounded-full';
      case 'card':
        return 'w-full h-32 rounded-lg';
      case 'image':
        return 'w-full h-48 rounded-lg';
      case 'button':
        return 'w-24 h-10 rounded-lg';
      default:
        return 'h-4 rounded';
    }
  };

  const baseClasses = cn(
    "bg-muted relative overflow-hidden",
    getVariantClasses(),
    className
  );

  const SkeletonBase = ({ children }: { children?: React.ReactNode }) => (
    <div className={baseClasses}>
      {showShimmer && !shouldReduceMotion && (
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-background/60 to-transparent"
          variants={shimmerVariants}
          animate="shimmer"
        />
      )}
      {children}
    </div>
  );

  if (variant === 'text' && lines > 1) {
    return (
      <div className="space-y-2">
        {Array.from({ length: lines }).map((_, i) => (
          <SkeletonBase key={i} />
        ))}
      </div>
    );
  }

  return <SkeletonBase />;
};

interface SkeletonCardProps {
  showAvatar?: boolean;
  showImage?: boolean;
  lines?: number;
  className?: string;
}

export const SkeletonCard: React.FC<SkeletonCardProps> = ({
  showAvatar = true,
  showImage = false,
  lines = 3,
  className
}) => {
  return (
    <div className={cn("p-6 space-y-4", className)}>
      <div className="flex items-center space-x-4">
        {showAvatar && <EnhancedSkeleton variant="avatar" />}
        <div className="space-y-2 flex-1">
          <EnhancedSkeleton className="h-4 w-1/3" />
          <EnhancedSkeleton className="h-3 w-1/2" />
        </div>
      </div>
      
      {showImage && <EnhancedSkeleton variant="image" />}
      
      <div className="space-y-2">
        {Array.from({ length: lines }).map((_, i) => (
          <EnhancedSkeleton 
            key={i} 
            className={i === lines - 1 ? "h-4 w-3/4" : "h-4 w-full"} 
          />
        ))}
      </div>
    </div>
  );
};
