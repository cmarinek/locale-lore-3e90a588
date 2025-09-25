import React from 'react';
import { SimpleMap } from './SimpleMap';
import { FactMarker } from '@/types/map';

interface MapWithContextProps {
  onFactClick?: (fact: FactMarker) => void;
  className?: string;
  isVisible?: boolean;
}

/**
 * Simplified map component with native Mapbox clustering
 * Much faster and more reliable than custom clustering implementations
 */
export function MapWithContext(props: MapWithContextProps) {
  return (
    <SimpleMap 
      onFactClick={props.onFactClick}
      className={props.className}
    />
  );
}

export default MapWithContext;