import React, { memo, useCallback, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Layers, Navigation, ZoomIn, ZoomOut } from 'lucide-react';

interface MapControlsProps {
  onFactClick?: (fact: any) => void;
  facts?: any[];
  isLoading?: boolean;
  isVisible?: boolean;
}

const MapControls = memo(({ isVisible }: MapControlsProps) => {
  const [mapStyle, setMapStyle] = useState('light');

  const handleStyleChange = useCallback((style: string) => {
    setMapStyle(style);
    // This would trigger a map style change in a real implementation
    console.log('Changing map style to:', style);
  }, []);

  const handleZoomIn = useCallback(() => {
    // Find map instance and zoom in
    const mapContainer = document.querySelector('.mapboxgl-map');
    if (mapContainer?._map) {
      mapContainer._map.zoomIn();
    }
  }, []);

  const handleZoomOut = useCallback(() => {
    // Find map instance and zoom out
    const mapContainer = document.querySelector('.mapboxgl-map');
    if (mapContainer?._map) {
      mapContainer._map.zoomOut();
    }
  }, []);

  const handleResetView = useCallback(() => {
    // Reset map to default view
    const mapContainer = document.querySelector('.mapboxgl-map');
    if (mapContainer?._map) {
      mapContainer._map.flyTo({
        center: [-74.5, 40],
        zoom: 9,
        duration: 1000
      });
    }
  }, []);

  if (!isVisible) return null;

  return (
    <div className="absolute bottom-4 left-4 z-20 flex flex-col gap-2">
      {/* Zoom Controls */}
      <div className="flex flex-col bg-background/90 backdrop-blur-sm rounded-lg border shadow-lg overflow-hidden">
        <Button
          variant="ghost"
          size="icon"
          onClick={handleZoomIn}
          className="rounded-none border-0"
        >
          <ZoomIn className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleZoomOut}
          className="rounded-none border-0 border-t"
        >
          <ZoomOut className="h-4 w-4" />
        </Button>
      </div>

      {/* Style Controls */}
      <div className="flex flex-col bg-background/90 backdrop-blur-sm rounded-lg border shadow-lg overflow-hidden">
        <Button
          variant={mapStyle === 'light' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => handleStyleChange('light')}
          className="rounded-none text-xs"
        >
          Light
        </Button>
        <Button
          variant={mapStyle === 'dark' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => handleStyleChange('dark')}
          className="rounded-none border-t text-xs"
        >
          Dark
        </Button>
        <Button
          variant={mapStyle === 'satellite' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => handleStyleChange('satellite')}
          className="rounded-none border-t text-xs"
        >
          Satellite
        </Button>
      </div>

      {/* Reset View */}
      <Button
        variant="outline"
        size="icon"
        onClick={handleResetView}
        className="bg-background/90 backdrop-blur-sm"
      >
        <Navigation className="h-4 w-4" />
      </Button>
    </div>
  );
});

MapControls.displayName = 'MapControls';

export default MapControls;