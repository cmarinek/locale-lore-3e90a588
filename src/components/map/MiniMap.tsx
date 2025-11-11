import React, { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';

interface MiniMapProps {
  mainMapBounds?: mapboxgl.LngLatBounds;
  mapboxToken?: string;
  className?: string;
}

export const MiniMap: React.FC<MiniMapProps> = ({ mainMapBounds, mapboxToken, className = '' }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const miniMapRef = useRef<mapboxgl.Map | null>(null);
  const boundsRectRef = useRef<string | null>(null);

  useEffect(() => {
    if (!containerRef.current || !mapboxToken) return;

    mapboxgl.accessToken = mapboxToken;
    
    const newMap = new mapboxgl.Map({
      container: containerRef.current,
      style: 'mapbox://styles/mapbox/light-v11',
      center: [0, 20],
      zoom: 1,
      interactive: false,
      attributionControl: false,
      logoPosition: 'bottom-right'
    });

    // Wait for style to load before setting the ref
    newMap.on('load', () => {
      miniMapRef.current = newMap;
    });

    return () => {
      newMap.remove();
      miniMapRef.current = null;
    };
  }, [mapboxToken]);

  useEffect(() => {
    if (!miniMapRef.current || !mainMapBounds) return;

    const map = miniMapRef.current;

    // Check if style is loaded
    if (!map.isStyleLoaded()) {
      const handleLoad = () => {
        updateBounds(map, mainMapBounds);
      };
      map.once('load', handleLoad);
      return () => {
        map.off('load', handleLoad);
      };
    }

    updateBounds(map, mainMapBounds);
  }, [mainMapBounds]);

  const updateBounds = (map: mapboxgl.Map, bounds: mapboxgl.LngLatBounds) => {
    try {
      // Remove previous bounds rectangle
      if (boundsRectRef.current && map.getSource('viewport-bounds')) {
        if (map.getLayer('viewport-bounds-line')) map.removeLayer('viewport-bounds-line');
        if (map.getLayer('viewport-bounds-fill')) map.removeLayer('viewport-bounds-fill');
        map.removeSource('viewport-bounds');
      }

      // Create GeoJSON for the bounds rectangle
      const ne = bounds.getNorthEast();
      const sw = bounds.getSouthWest();
      const nw = bounds.getNorthWest();
      const se = bounds.getSouthEast();

      const boundsGeoJSON: GeoJSON.Feature<GeoJSON.Geometry> = {
        type: 'Feature',
        properties: {},
        geometry: {
          type: 'Polygon',
          coordinates: [[
            [sw.lng, sw.lat],
            [se.lng, se.lat],
            [ne.lng, ne.lat],
            [nw.lng, nw.lat],
            [sw.lng, sw.lat]
          ]]
        }
      };

      // Add source
      map.addSource('viewport-bounds', {
        type: 'geojson',
        data: boundsGeoJSON
      });

      // Add fill layer
      map.addLayer({
        id: 'viewport-bounds-fill',
        type: 'fill',
        source: 'viewport-bounds',
        paint: {
          'fill-color': 'hsl(203, 85%, 65%)',
          'fill-opacity': 0.2
        }
      });

      // Add outline layer
      map.addLayer({
        id: 'viewport-bounds-line',
        type: 'line',
        source: 'viewport-bounds',
        paint: {
          'line-color': 'hsl(203, 85%, 65%)',
          'line-width': 2
        }
      });

      boundsRectRef.current = 'active';

      // Center mini-map on bounds
      const center = bounds.getCenter();
      map.setCenter(center);
    } catch (error) {
      console.error('Error updating minimap bounds:', error);
    }
  };

  if (!mapboxToken) return null;

  return (
    <div className={`bg-background/95 backdrop-blur-sm border border-border rounded-lg shadow-lg overflow-hidden ${className}`}>
      <div ref={containerRef} className="w-full h-full" />
    </div>
  );
};
