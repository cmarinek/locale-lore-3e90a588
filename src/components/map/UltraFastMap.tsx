// Ultra-fast 2025 Map - World-class performance
import React, { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { FactMarker } from '@/types/map';
import { ultraFastGeoService } from '@/services/ultraFastGeoService';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';

interface UltraFastMapProps {
  onFactClick?: (fact: FactMarker) => void;
  className?: string;
  center?: [number, number];
  zoom?: number;
}

export const UltraFastMap: React.FC<UltraFastMapProps> = ({
  onFactClick,
  className = "",
  center = [0, 20],
  zoom = 2
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [facts, setFacts] = useState<FactMarker[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isDataLoading, setIsDataLoading] = useState(false);
  const lastBounds = useRef<string>('');
  const updateTimeout = useRef<NodeJS.Timeout>();

  // Memoized features for performance
  const geoJsonFeatures = useMemo(() => {
    return facts.map(fact => ({
      type: 'Feature' as const,
      properties: {
        id: fact.id,
        title: fact.title,
        category: fact.category,
        verified: fact.verified,
        voteScore: fact.voteScore
      },
      geometry: {
        type: 'Point' as const,
        coordinates: [fact.longitude, fact.latitude]
      }
    }));
  }, [facts]);

  // Ultra-fast data fetching with intelligent debouncing
  const fetchFactsForBounds = useCallback(async (bounds: mapboxgl.LngLatBounds, currentZoom: number) => {
    const boundsObj = {
      north: bounds.getNorth(),
      south: bounds.getSouth(),
      east: bounds.getEast(),
      west: bounds.getWest()
    };

    const boundsKey = `${boundsObj.north.toFixed(3)}_${boundsObj.south.toFixed(3)}_${boundsObj.east.toFixed(3)}_${boundsObj.west.toFixed(3)}_${Math.floor(currentZoom)}`;
    
    if (lastBounds.current === boundsKey) return;
    lastBounds.current = boundsKey;

    setIsDataLoading(true);
    
    try {
      const newFacts = await ultraFastGeoService.getFactsForBounds(boundsObj, currentZoom);
      setFacts(newFacts);
    } catch (error) {
      console.error('Error fetching facts:', error);
    } finally {
      setIsDataLoading(false);
    }
  }, []);

  // Optimized map data updates
  const updateMapData = useCallback(() => {
    if (!map.current || !isLoaded) return;
    
    const source = map.current.getSource('facts') as mapboxgl.GeoJSONSource;
    if (source) {
      source.setData({
        type: 'FeatureCollection',
        features: geoJsonFeatures
      });
    }
  }, [isLoaded, geoJsonFeatures]);

  // Intelligent viewport change handler with debouncing
  const handleViewportChange = useCallback(() => {
    if (!map.current || !isLoaded) return;
    
    // Clear previous timeout
    if (updateTimeout.current) {
      clearTimeout(updateTimeout.current);
    }
    
    // Debounce updates for smooth interaction
    updateTimeout.current = setTimeout(async () => {
      const bounds = map.current!.getBounds();
      const currentZoom = map.current!.getZoom();
      await fetchFactsForBounds(bounds, currentZoom);
    }, 150); // Optimized debounce timing
  }, [isLoaded, fetchFactsForBounds]);

  // Map initialization - lightning fast
  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    let mounted = true;

    const initMap = async () => {
      try {
        console.log('🚀 UltraFastMap: Initializing...');
        
        // Set Mapbox token
        mapboxgl.accessToken = 'pk.eyJ1IjoibG92YWJsZSIsImEiOiJjbHdmYzI5azQwM2p2MmxwOXh3cnB1bGJ5In0.TvNwd5pttC67qlhZv8G7_w';

        const mapInstance = new mapboxgl.Map({
          container: mapContainer.current!,
          style: 'mapbox://styles/mapbox/light-v11',
          center: center,
          zoom: zoom,
          attributionControl: false,
          logoPosition: 'bottom-right' as const,
          // Performance optimizations
          pitchWithRotate: false,
          touchZoomRotate: true,
          doubleClickZoom: true,
          scrollZoom: true,
          boxZoom: true,
          dragRotate: false,
          dragPan: true,
          keyboard: true,
          touchPitch: false
        });

        map.current = mapInstance;

        mapInstance.on('load', async () => {
          if (!mounted) return;
          
          console.log('⚡ UltraFastMap: Map loaded');
          
          // Add optimized data source
          mapInstance.addSource('facts', {
            type: 'geojson',
            data: {
              type: 'FeatureCollection',
              features: []
            },
            cluster: false, // Disable clustering for max performance
            lineMetrics: false,
            tolerance: 0.375 // Optimized tolerance
          });

          // Add high-performance circle layer
          mapInstance.addLayer({
            id: 'facts-points',
            type: 'circle',
            source: 'facts',
            paint: {
              'circle-radius': [
                'interpolate',
                ['linear'],
                ['zoom'],
                1, 2,
                5, 4,
                10, 8,
                15, 12
              ],
              'circle-color': [
                'case',
                ['get', 'verified'],
                'hsl(142, 76%, 36%)', // verified green
                'hsl(43, 96%, 56%)'   // unverified amber
              ],
              'circle-stroke-width': [
                'interpolate',
                ['linear'],
                ['zoom'],
                1, 0.5,
                10, 1,
                15, 1.5
              ],
              'circle-stroke-color': 'hsl(0, 0%, 100%)',
              'circle-opacity': 0.9,
              'circle-stroke-opacity': 1
            }
          });

          // Optimized click handler
          mapInstance.on('click', 'facts-points', (e) => {
            if (e.features && e.features[0] && onFactClick) {
              const feature = e.features[0];
              const factId = feature.properties?.id;
              const fact = facts.find(f => f.id === factId);
              if (fact) {
                onFactClick(fact);
              }
            }
          });

          // Performance-optimized hover effects
          let hoveredFeatureId: string | number | null = null;
          
          mapInstance.on('mouseenter', 'facts-points', (e) => {
            mapInstance.getCanvas().style.cursor = 'pointer';
            if (e.features && e.features[0]) {
              if (hoveredFeatureId !== null) {
                mapInstance.setFeatureState(
                  { source: 'facts', id: hoveredFeatureId },
                  { hover: false }
                );
              }
              hoveredFeatureId = e.features[0].id || null;
              if (hoveredFeatureId !== null) {
                mapInstance.setFeatureState(
                  { source: 'facts', id: hoveredFeatureId },
                  { hover: true }
                );
              }
            }
          });
          
          mapInstance.on('mouseleave', 'facts-points', () => {
            mapInstance.getCanvas().style.cursor = '';
            if (hoveredFeatureId !== null) {
              mapInstance.setFeatureState(
                { source: 'facts', id: hoveredFeatureId },
                { hover: false }
              );
            }
            hoveredFeatureId = null;
          });

          setIsLoaded(true);
          
          // Load initial data
          const bounds = mapInstance.getBounds();
          const currentZoom = mapInstance.getZoom();
          await fetchFactsForBounds(bounds, currentZoom);
          
          console.log('✅ UltraFastMap: Ready for blazing performance');
        });

        // Optimized event listeners
        mapInstance.on('moveend', handleViewportChange);
        mapInstance.on('zoomend', handleViewportChange);

      } catch (error) {
        console.error('❌ UltraFastMap: Initialization failed:', error);
      }
    };

    initMap();

    return () => {
      mounted = false;
      if (updateTimeout.current) {
        clearTimeout(updateTimeout.current);
      }
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [center, zoom, fetchFactsForBounds, handleViewportChange, onFactClick]);

  // Ultra-fast data updates
  useEffect(() => {
    if (isLoaded) {
      updateMapData();
    }
  }, [isLoaded, updateMapData]);

  return (
    <ErrorBoundary>
      <div className={`relative w-full h-full ${className}`}>
        <div ref={mapContainer} className="absolute inset-0" />
        
        {/* Performance indicator */}
        {isDataLoading && (
          <div className="absolute top-4 left-4 z-10">
            <div className="bg-background/90 backdrop-blur-sm border rounded-lg px-3 py-2 text-sm">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 bg-primary rounded-full animate-pulse" />
                Loading facts...
              </div>
            </div>
          </div>
        )}
        
        {/* Facts counter */}
        {facts.length > 0 && (
          <div className="absolute bottom-4 left-4 z-10">
            <div className="bg-background/90 backdrop-blur-sm border rounded-lg px-3 py-2 text-sm font-medium">
              {facts.length} facts loaded
            </div>
          </div>
        )}
      </div>
    </ErrorBoundary>
  );
};