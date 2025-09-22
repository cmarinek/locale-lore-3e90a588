import React from 'react';
import { cn } from '@/lib/utils';

interface SkeletonProps {
  className?: string;
  variant?: 'default' | 'card' | 'map' | 'list' | 'text';
  count?: number;
  animated?: boolean;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className,
  variant = 'default',
  count = 1,
  animated = true
}) => {
  const baseClasses = cn(
    'bg-muted',
    animated && 'animate-pulse',
    className
  );

  const variants = {
    default: 'h-4 w-full rounded',
    card: 'h-32 w-full rounded-lg',
    map: 'h-96 w-full rounded-lg',
    list: 'h-16 w-full rounded-md',
    text: 'h-4 w-3/4 rounded'
  };

  const variantClasses = variants[variant];

  if (count === 1) {
    return <div className={cn(baseClasses, variantClasses)} />;
  }

  return (
    <div className="space-y-2">
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className={cn(baseClasses, variantClasses)} />
      ))}
    </div>
  );
};

// Specific skeleton components for common use cases
export const MapSkeleton: React.FC<{ className?: string }> = ({ className }) => (
  <div className={cn('relative bg-muted animate-pulse rounded-lg', className)}>
    <div className="absolute inset-0 bg-gradient-to-br from-muted to-muted/50 rounded-lg" />
    <div className="absolute top-4 left-4 bg-background/20 h-8 w-32 rounded" />
    <div className="absolute top-4 right-4 bg-background/20 h-8 w-24 rounded" />
    <div className="absolute bottom-4 left-4 space-y-2">
      <div className="bg-background/20 h-4 w-16 rounded" />
      <div className="bg-background/20 h-3 w-12 rounded" />
    </div>
  </div>
);

export const FactCardSkeleton: React.FC<{ className?: string }> = ({ className }) => (
  <div className={cn('p-4 bg-muted animate-pulse rounded-lg space-y-3', className)}>
    <div className="flex items-start space-x-3">
      <div className="bg-background/20 h-10 w-10 rounded-full" />
      <div className="flex-1 space-y-2">
        <div className="bg-background/20 h-4 w-3/4 rounded" />
        <div className="bg-background/20 h-3 w-1/2 rounded" />
      </div>
    </div>
    <div className="bg-background/20 h-20 w-full rounded" />
    <div className="flex justify-between">
      <div className="bg-background/20 h-3 w-16 rounded" />
      <div className="bg-background/20 h-3 w-12 rounded" />
    </div>
  </div>
);

export const ListSkeleton: React.FC<{ 
  items?: number; 
  className?: string; 
  itemHeight?: string;
}> = ({ 
  items = 5, 
  className,
  itemHeight = 'h-16'
}) => (
  <div className={cn('space-y-2', className)}>
    {Array.from({ length: items }, (_, i) => (
      <div key={i} className={cn('bg-muted animate-pulse rounded-md', itemHeight)} />
    ))}
  </div>
);