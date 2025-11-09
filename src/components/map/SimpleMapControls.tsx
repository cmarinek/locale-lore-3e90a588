import React from 'react';
import { Button } from '@/components/ui/button';
import { ZoomIn, ZoomOut, Navigation2, Layers2 } from 'lucide-react';

interface SimpleMapControlsProps {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onRecenter: () => void;
  onStyleChange?: () => void;
  currentStyle?: string;
  className?: string;
}

export const SimpleMapControls: React.FC<SimpleMapControlsProps> = ({
  onZoomIn,
  onZoomOut,
  onRecenter,
  onStyleChange,
  currentStyle = 'light',
  className = ''
}) => {
  return (
    <div className={`fixed right-4 top-1/2 -translate-y-1/2 z-10 flex flex-col gap-2 ${className}`}>
      {/* Zoom Controls */}
      <div className="bg-background/95 backdrop-blur-sm border border-border rounded-lg shadow-lg overflow-hidden">
        <Button
          variant="ghost"
          size="icon"
          onClick={onZoomIn}
          className="h-10 w-10 rounded-none hover:bg-accent"
          aria-label="Zoom in"
        >
          <ZoomIn className="h-4 w-4" />
        </Button>
        <div className="h-px bg-border" />
        <Button
          variant="ghost"
          size="icon"
          onClick={onZoomOut}
          className="h-10 w-10 rounded-none hover:bg-accent"
          aria-label="Zoom out"
        >
          <ZoomOut className="h-4 w-4" />
        </Button>
      </div>

      {/* Recenter */}
      <Button
        variant="outline"
        size="icon"
        onClick={onRecenter}
        className="h-10 w-10 bg-background/95 backdrop-blur-sm hover:bg-accent shadow-lg"
        aria-label="Recenter map"
      >
        <Navigation2 className="h-4 w-4" />
      </Button>

      {/* Style Toggle */}
      {onStyleChange && (
        <Button
          variant="outline"
          size="icon"
          onClick={onStyleChange}
          className="h-10 w-10 bg-background/95 backdrop-blur-sm hover:bg-accent shadow-lg"
          aria-label="Change map style"
        >
          <Layers2 className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
};
