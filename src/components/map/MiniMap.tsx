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
    
    miniMapRef.current = new mapboxgl.Map({
      container: containerRef.current,
      style: 'mapbox://styles/mapbox/light-v11',
      center: [0, 20],
      zoom: 1,
      interactive: false,
      attributionControl: false,
      logoPosition: 'bottom-right'
    });

    return () => {
      miniMapRef.current?.remove();
      miniMapRef.current = null;
    };
  }, [mapboxToken]);

  useEffect(() => {
    if (!miniMapRef.current || !mainMapBounds) return;

    const map = miniMapRef.current;

    // Remove previous bounds rectangle
    if (boundsRectRef.current && map.getSource('viewport-bounds')) {
      map.removeLayer('viewport-bounds-line');
      map.removeLayer('viewport-bounds-fill');
      map.removeSource('viewport-bounds');
    }

    // Create GeoJSON for the bounds rectangle
    const ne = mainMapBounds.getNorthEast();
    const sw = mainMapBounds.getSouthWest();
    const nw = mainMapBounds.getNorthWest();
    const se = mainMapBounds.getSouthEast();

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
    const center = mainMapBounds.getCenter();
    map.setCenter(center);
  }, [mainMapBounds]);

  if (!mapboxToken) return null;

  return (
    <div className={`bg-background/95 backdrop-blur-sm border border-border rounded-lg shadow-lg overflow-hidden ${className}`}>
      <div className="p-2 border-b border-border bg-muted/30">
        <p className="text-[10px] font-semibold text-muted-foreground">Overview</p>
      </div>
      <div ref={containerRef} className="w-full h-full" />
    </div>
  );
};
