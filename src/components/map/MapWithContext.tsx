import React from 'react';
import { MapProvider } from '@/contexts/MapContext';
import { UnifiedMapComponent } from './UnifiedMapComponent';
import { FactMarker } from '@/types/map';

interface MapWithContextProps {
  onFactClick?: (fact: FactMarker) => void;
  className?: string;
  isVisible?: boolean;
}

/**
 * Map component that provides the MapContext and renders the unified map
 * Use this component for better architecture and error handling
 */
export function MapWithContext(props: MapWithContextProps) {
  return (
    <MapProvider>
      <UnifiedMapComponent 
        variant="clustered"
        enableClustering={true}
        enablePerformanceOptimizations={true}
        {...props} 
      />
    </MapProvider>
  );
}

export default MapWithContext;