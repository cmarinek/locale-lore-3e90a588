import React from 'react';
import { EnhancedSkeleton, SkeletonCard } from './enhanced-skeleton';
import { cn } from '@/lib/utils';

interface LoadingListProps {
  count?: number;
  viewMode?: 'grid' | 'list';
  className?: string;
}

export const LoadingList: React.FC<LoadingListProps> = ({ 
  count = 6, 
  viewMode = 'grid',
  className 
}) => {
  return (
    <div className={cn(
      "gap-6",
      viewMode === 'grid' 
        ? "grid md:grid-cols-2 lg:grid-cols-3" 
        : "flex flex-col space-y-4",
      className
    )}>
      {Array.from({ length: count }).map((_, index) => (
        <SkeletonCard 
          key={index} 
          showAvatar={true}
          showImage={viewMode === 'grid'}
          lines={viewMode === 'grid' ? 3 : 2}
          className={viewMode === 'list' ? "flex gap-4 items-start p-4" : ""}
        />
      ))}
    </div>
  );
};

interface LoadingSearchProps {
  className?: string;
}

export const LoadingSearch: React.FC<LoadingSearchProps> = ({ className }) => {
  return (
    <div className={cn("space-y-4", className)}>
      {Array.from({ length: 5 }).map((_, index) => (
        <div key={index} className="flex gap-4 p-4 border rounded-lg">
          <EnhancedSkeleton variant="image" className="w-20 h-20 shrink-0" />
          <div className="flex-1 space-y-2">
            <EnhancedSkeleton className="h-4 w-3/4" />
            <EnhancedSkeleton className="h-3 w-full" />
            <EnhancedSkeleton className="h-3 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
};

interface LoadingMapProps {
  className?: string;
}

export const LoadingMap: React.FC<LoadingMapProps> = ({ className }) => {
  return (
    <div className={cn("relative", className)}>
      <EnhancedSkeleton className="w-full h-96 rounded-lg" />
      <div className="absolute top-4 left-4 space-y-2">
        <EnhancedSkeleton className="w-32 h-8 rounded-full" />
        <EnhancedSkeleton className="w-24 h-6 rounded-full" />
      </div>
      <div className="absolute bottom-4 right-4">
        <EnhancedSkeleton className="w-12 h-12 rounded-full" />
      </div>
    </div>
  );
};

interface LoadingStoryProps {
  className?: string;
}

export const LoadingStory: React.FC<LoadingStoryProps> = ({ className }) => {
  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-center space-x-4">
        <EnhancedSkeleton variant="avatar" />
        <div className="space-y-2 flex-1">
          <EnhancedSkeleton className="h-4 w-1/3" />
          <EnhancedSkeleton className="h-3 w-1/2" />
        </div>
      </div>
      <EnhancedSkeleton variant="image" className="h-64" />
      <EnhancedSkeleton variant="text" lines={3} />
    </div>
  );
};