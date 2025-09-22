import React from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface TouchControlsProps {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onRecenter: () => void;
  onLocation?: () => void;
  position?: 'right' | 'left';
  className?: string;
}

export const TouchControls: React.FC<TouchControlsProps> = ({
  onZoomIn,
  onZoomOut,
  onRecenter,
  onLocation,
  position = 'right',
  className
}) => {
  const positionClasses = position === 'right' 
    ? 'right-4 sm:right-6' 
    : 'left-4 sm:left-6';

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className={cn(
        "fixed bottom-24 z-40 flex flex-col gap-2",
        positionClasses,
        className
      )}
    >
      {/* Zoom Controls */}
      <div className="flex flex-col bg-background/90 backdrop-blur-md rounded-xl border border-border/50 shadow-lg overflow-hidden">
        <Button
          variant="ghost"
          size="icon"
          onClick={onZoomIn}
          className="h-12 w-12 sm:h-14 sm:w-14 rounded-none border-b border-border/50 hover:bg-primary/10 active:bg-primary/20 touch-manipulation"
          aria-label="Zoom in"
        >
          <span className="text-lg sm:text-xl font-medium">+</span>
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={onZoomOut}
          className="h-12 w-12 sm:h-14 sm:w-14 rounded-none hover:bg-primary/10 active:bg-primary/20 touch-manipulation"
          aria-label="Zoom out"
        >
          <span className="text-lg sm:text-xl font-medium">−</span>
        </Button>
      </div>

      {/* Additional Controls */}
      <div className="flex flex-col gap-2">
        <Button
          variant="outline"
          size="icon"
          onClick={onRecenter}
          className="h-12 w-12 sm:h-14 sm:w-14 rounded-full bg-background/90 backdrop-blur-md border-border/50 hover:bg-primary/10 active:bg-primary/20 touch-manipulation"
          aria-label="Recenter map"
        >
          <svg className="h-5 w-5 sm:h-6 sm:w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
        </Button>

        {onLocation && (
          <Button
            variant="outline"
            size="icon"
            onClick={onLocation}
            className="h-12 w-12 sm:h-14 sm:w-14 rounded-full bg-background/90 backdrop-blur-md border-border/50 hover:bg-primary/10 active:bg-primary/20 touch-manipulation"
            aria-label="Find my location"
          >
            <svg className="h-5 w-5 sm:h-6 sm:w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </Button>
        )}
      </div>
    </motion.div>
  );
};

interface AccessibleMapControlsProps {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onRecenter: () => void;
  onLocation?: () => void;
  currentZoom: number;
  maxZoom: number;
  minZoom: number;
}

export const AccessibleMapControls: React.FC<AccessibleMapControlsProps> = ({
  onZoomIn,
  onZoomOut,
  onRecenter,
  onLocation,
  currentZoom,
  maxZoom,
  minZoom
}) => {
  const zoomPercentage = ((currentZoom - minZoom) / (maxZoom - minZoom)) * 100;

  return (
    <div 
      className="sr-only"
      role="region"
      aria-label="Map navigation controls"
    >
      <div className="flex flex-col gap-2">
        <div role="group" aria-label="Zoom controls">
          <label htmlFor="zoom-slider" className="block text-sm font-medium mb-1">
            Zoom Level: {currentZoom.toFixed(1)}
          </label>
          <input
            id="zoom-slider"
            type="range"
            min={minZoom}
            max={maxZoom}
            step={0.1}
            value={currentZoom}
            onChange={(e) => {
              const newZoom = parseFloat(e.target.value);
              if (newZoom > currentZoom) {
                onZoomIn();
              } else {
                onZoomOut();
              }
            }}
            className="w-full"
            aria-describedby="zoom-description"
          />
          <div id="zoom-description" className="text-xs text-muted-foreground mt-1">
            Current zoom: {zoomPercentage.toFixed(0)}%
          </div>
        </div>

        <div className="flex gap-2 mt-2">
          <button
            onClick={onRecenter}
            className="px-3 py-1 text-sm bg-primary text-primary-foreground rounded"
          >
            Recenter Map
          </button>
          {onLocation && (
            <button
              onClick={onLocation}
              className="px-3 py-1 text-sm bg-secondary text-secondary-foreground rounded"
            >
              Find My Location
            </button>
          )}
        </div>
      </div>
    </div>
  );
};