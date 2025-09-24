import React from 'react';
import { MapProvider } from '@/contexts/MapContext';
import { ImprovedClusteredMap } from './ImprovedClusteredMap';
import { FactMarker } from '@/types/map';

interface MapWithContextProps {
  onFactClick?: (fact: FactMarker) => void;
  className?: string;
  isVisible?: boolean;
}

/**
 * Map component that provides the MapContext and renders the improved clustered map
 * Use this component instead of ClusteredMap for better architecture and error handling
 */
export function MapWithContext(props: MapWithContextProps) {
  return (
    <MapProvider>
      <ImprovedClusteredMap {...props} />
    </MapProvider>
  );
}

export default MapWithContext;