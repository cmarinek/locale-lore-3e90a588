import React from 'react';

export const MapSkeleton: React.FC = () => {
  return (
    <div className="absolute inset-0 bg-muted/50 backdrop-blur-sm flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-border rounded-full mx-auto" />
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin absolute inset-0 mx-auto" />
        </div>
        <div className="space-y-2">
          <p className="text-sm font-medium text-foreground">Loading map...</p>
          <p className="text-xs text-muted-foreground">Please wait a moment</p>
        </div>
      </div>
    </div>
  );
};
