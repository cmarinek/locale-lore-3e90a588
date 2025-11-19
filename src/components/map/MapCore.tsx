import React, { useRef, useEffect, useCallback, memo } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { mapboxService } from '@/services/mapboxService';
import { usePerformanceMonitor } from '@/hooks/usePerformanceMonitor';

interface MapCoreProps {
  onFactClick?: (fact: any) => void;
  facts?: any[];
  isLoading?: boolean;
  isVisible?: boolean;
}

const MapCore = memo(({ onFactClick, facts, isLoading, isVisible }: MapCoreProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const { startRenderMeasurement, endRenderMeasurement } = usePerformanceMonitor();
  
  // Initialize map only once
  const initializeMap = useCallback(async () => {
    if (!mapContainer.current || map.current) return;

    try {
      startRenderMeasurement();
      
      const token = await mapboxService.getToken();
      if (!token) return;

      mapboxgl.accessToken = token;

      // Create map with performance optimizations
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/light-v11',
        center: [-74.5, 40],
        zoom: 9,
        // Performance optimizations
        antialias: false,
        maxTileCacheSize: 50,
        // Disable native controls (using custom EnhancedMapControls instead)
        attributionControl: false,
        logoPosition: 'bottom-right',
        transformRequest: (url, resourceType) => {
          // Optimize tile requests
          if (resourceType === 'Tile' && url.includes('mapbox://')) {
            return {
              url,
              credentials: 'same-origin'
            };
          }
        }
      });

      // Performance event listeners
      map.current.on('load', () => {
        endRenderMeasurement();
        console.log('🗺️ Map loaded successfully');
      });

      map.current.on('error', (e) => {
        console.error('Map error:', e);
      });

    } catch (error) {
      console.error('Failed to initialize map:', error);
    }
  }, [startRenderMeasurement, endRenderMeasurement]);

  // Initialize map when component mounts
  useEffect(() => {
    if (isVisible) {
      initializeMap();
    }

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [isVisible, initializeMap]);

  return (
    <div 
      ref={mapContainer} 
      className="absolute inset-0 w-full h-full"
      style={{ minHeight: '100%' }}
    />
  );
});

MapCore.displayName = 'MapCore';

export default MapCore;