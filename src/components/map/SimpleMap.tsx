// Ultra-fast SimpleMap component - no complex clustering, just pure performance
import React, { useRef, useEffect, useState, useCallback } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { FactMarker } from '@/types/map';
import { fastGeoService } from '@/services/fastGeoService';
import MapControls from './MapControls';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';

interface SimpleMapProps {
  onFactClick?: (fact: FactMarker) => void;
  className?: string;
  isVisible?: boolean;
  center?: number[];
  zoom?: number;
}

export const SimpleMap: React.FC<SimpleMapProps> = ({
  onFactClick,
  className = "",
  isVisible = true,
  center = [0, 20],
  zoom = 2
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [facts, setFacts] = useState<FactMarker[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const lastBounds = useRef<string>('');

  // Simplified facts fetching
  const fetchFactsForBounds = useCallback(async (bounds: mapboxgl.LngLatBounds, zoom: number) => {
    const boundsObj = {
      north: bounds.getNorth(),
      south: bounds.getSouth(),
      east: bounds.getEast(),
      west: bounds.getWest()
    };

    const boundsKey = `${boundsObj.north.toFixed(3)},${boundsObj.south.toFixed(3)},${boundsObj.east.toFixed(3)},${boundsObj.west.toFixed(3)}`;
    
    // Avoid duplicate requests for same bounds
    if (lastBounds.current === boundsKey) {
      return facts;
    }
    
    lastBounds.current = boundsKey;
    return await fastGeoService.getFactsForBounds(boundsObj, zoom);
  }, [facts]);

  // Update map data
  const updateMapData = useCallback((newFacts: FactMarker[]) => {
    if (!map.current || !isLoaded) return;
    
    const features = newFacts.map(fact => ({
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

    const source = map.current.getSource('facts') as mapboxgl.GeoJSONSource;
    if (source) {
      source.setData({
        type: 'FeatureCollection',
        features
      });
    }
  }, [isLoaded]);

  // Handle viewport changes
  const handleViewportChange = useCallback(async () => {
    if (!map.current || !isLoaded) return;
    
    const bounds = map.current.getBounds();
    const zoom = map.current.getZoom();
    
    try {
      const newFacts = await fetchFactsForBounds(bounds, zoom);
      setFacts(newFacts);
      updateMapData(newFacts);
    } catch (error) {
      console.error('Error updating viewport:', error);
    }
  }, [isLoaded, fetchFactsForBounds, updateMapData]);

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    let mounted = true;

    const initMap = async () => {
      try {
        console.log('🗺️ SimpleMap: Initializing...');
        
        // Set Mapbox token
        mapboxgl.accessToken = 'pk.eyJ1IjoibG92YWJsZSIsImEiOiJjbHdmYzI5azQwM2p2MmxwOXh3cnB1bGJ5In0.TvNwd5pttC67qlhZv8G7_w';

        const mapInstance = new mapboxgl.Map({
          container: mapContainer.current!,
          style: 'mapbox://styles/mapbox/light-v11',
          center: center as [number, number],
          zoom: zoom,
          attributionControl: false,
          logoPosition: 'bottom-right' as const
        });

        map.current = mapInstance;

        mapInstance.on('load', async () => {
          if (!mounted) return;
          
          console.log('🗺️ SimpleMap: Map loaded successfully');
          
          // Load initial facts for current viewport
          const bounds = mapInstance.getBounds();
          const currentZoom = mapInstance.getZoom();
          const initialFacts = await fetchFactsForBounds(bounds, currentZoom);
          setFacts(initialFacts);
          
          // Add data source with initial data
          mapInstance.addSource('facts', {
            type: 'geojson',
            data: {
              type: 'FeatureCollection',
              features: []
            }
          });

          // Add circle layer for facts
          mapInstance.addLayer({
            id: 'facts-points',
            type: 'circle',
            source: 'facts',
            paint: {
              'circle-radius': [
                'interpolate',
                ['linear'],
                ['zoom'],
                1, 3,
                5, 6,
                10, 10,
                15, 15
              ],
              'circle-color': [
                'case',
                ['get', 'verified'],
                '#22c55e', // verified = green
                '#f59e0b'  // unverified = amber
              ],
              'circle-stroke-width': 1,
              'circle-stroke-color': '#ffffff',
              'circle-opacity': 0.8
            }
          });

          // Add click handler for facts
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

          // Change cursor on hover
          mapInstance.on('mouseenter', 'facts-points', () => {
            mapInstance.getCanvas().style.cursor = 'pointer';
          });
          mapInstance.on('mouseleave', 'facts-points', () => {
            mapInstance.getCanvas().style.cursor = '';
          });

          // Update data with initial facts
          updateMapData(initialFacts);
          setIsLoaded(true);
          
          console.log(`✅ SimpleMap: Loaded with ${initialFacts.length} facts`);
        });

        // Handle viewport changes
        mapInstance.on('moveend', handleViewportChange);
        mapInstance.on('zoomend', handleViewportChange);

      } catch (error) {
        console.error('❌ SimpleMap: Initialization failed:', error);
      }
    };

    initMap();

    return () => {
      mounted = false;
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [fetchFactsForBounds, updateMapData, handleViewportChange, onFactClick, facts]);

  // Update facts when they change
  useEffect(() => {
    if (isLoaded && facts.length > 0) {
      updateMapData(facts);
    }
  }, [facts, isLoaded, updateMapData]);

  if (!isVisible) {
    return null;
  }

  return (
    <ErrorBoundary>
      <div className={`relative w-full h-full ${className}`}>
        <div ref={mapContainer} className="absolute inset-0" />
        {map.current && (
          <div className="absolute top-4 right-4 z-10">
            <MapControls />
          </div>
        )}
      </div>
    </ErrorBoundary>
  );
};