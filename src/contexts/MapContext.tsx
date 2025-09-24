import React, { createContext, useContext, useRef, useState, useCallback, useEffect } from 'react';
import mapboxgl from 'mapbox-gl';
import { mapboxService } from '@/services/mapboxService';
import { Coordinate, isValidCoordinate, DEFAULT_COORDINATE } from '@/utils/coordinates';

interface MapContextValue {
  map: mapboxgl.Map | null;
  mapContainer: React.RefObject<HTMLDivElement>;
  isMapReady: boolean;
  mapError: string | null;
  initializeMap: (options?: Partial<mapboxgl.MapboxOptions>) => Promise<void>;
  centerMap: (coordinate: Coordinate, zoom?: number) => void;
  addMarker: (coordinate: Coordinate, options?: mapboxgl.MarkerOptions) => mapboxgl.Marker | null;
  clearMarkers: () => void;
  setMapStyle: (style: string) => void;
  getViewport: () => { bounds: mapboxgl.LngLatBounds; zoom: number } | null;
}

const MapContext = createContext<MapContextValue | null>(null);

export function useMapContext() {
  const context = useContext(MapContext);
  if (!context) {
    throw new Error('useMapContext must be used within a MapProvider');
  }
  return context;
}

interface MapProviderProps {
  children: React.ReactNode;
}

export function MapProvider({ children }: MapProviderProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markers = useRef<mapboxgl.Marker[]>([]);
  
  const [isMapReady, setIsMapReady] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);

  const initializeMap = useCallback(async (options: Partial<mapboxgl.MapboxOptions> = {}) => {
    if (!mapContainer.current || map.current) return;

    try {
      setMapError(null);
      
      const token = await mapboxService.getToken();
      if (!token) {
        throw new Error('Unable to get Mapbox access token');
      }

      mapboxgl.accessToken = token;

      const defaultOptions: mapboxgl.MapboxOptions = {
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/light-v11',
        center: DEFAULT_COORDINATE,
        zoom: 2,
        antialias: false,
        maxTileCacheSize: 50,
        preserveDrawingBuffer: true,
        ...options
      };

      map.current = new mapboxgl.Map(defaultOptions);

      // Add controls
      map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');
      map.current.addControl(new mapboxgl.ScaleControl(), 'bottom-left');

      // Wait for map to load
      map.current.on('load', () => {
        setIsMapReady(true);
        console.log('🗺️ Map loaded successfully');
      });

      map.current.on('error', (e) => {
        console.error('Map error:', e);
        setMapError('Map failed to load');
      });

      // Handle token expiration
      map.current.on('sourcedata', (e) => {
        if (e.isSourceLoaded && e.source.type === 'raster' && e.source.url) {
          // Check for 401 errors indicating token issues
          const source = e.source as any;
          if (source._tileSize === 0) {
            console.warn('Possible token expiration, clearing cached token');
            mapboxService.clearToken();
          }
        }
      });

    } catch (error) {
      console.error('Failed to initialize map:', error);
      setMapError(error instanceof Error ? error.message : 'Map initialization failed');
    }
  }, []);

  const centerMap = useCallback((coordinate: Coordinate, zoom = 14) => {
    if (!map.current || !isValidCoordinate(coordinate[0], coordinate[1])) return;
    
    map.current.flyTo({
      center: coordinate,
      zoom,
      duration: 1000
    });
  }, []);

  const addMarker = useCallback((coordinate: Coordinate, options: mapboxgl.MarkerOptions = {}): mapboxgl.Marker | null => {
    if (!map.current || !isValidCoordinate(coordinate[0], coordinate[1])) return null;

    const marker = new mapboxgl.Marker(options)
      .setLngLat(coordinate)
      .addTo(map.current);

    markers.current.push(marker);
    return marker;
  }, []);

  const clearMarkers = useCallback(() => {
    markers.current.forEach(marker => marker.remove());
    markers.current = [];
  }, []);

  const setMapStyle = useCallback((style: string) => {
    if (!map.current) return;
    map.current.setStyle(style);
  }, []);

  const getViewport = useCallback(() => {
    if (!map.current) return null;
    
    return {
      bounds: map.current.getBounds(),
      zoom: map.current.getZoom()
    };
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearMarkers();
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [clearMarkers]);

  const value: MapContextValue = {
    map: map.current,
    mapContainer,
    isMapReady,
    mapError,
    initializeMap,
    centerMap,
    addMarker,
    clearMarkers,
    setMapStyle,
    getViewport
  };

  return (
    <MapContext.Provider value={value}>
      {children}
    </MapContext.Provider>
  );
}