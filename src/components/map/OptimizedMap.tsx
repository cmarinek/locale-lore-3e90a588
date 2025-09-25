// Optimized Map - Primary map component combining best features
import React, { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { FactMarker } from '@/types/map';
import { geoService, ViewportBounds, GeoCluster } from '@/services/geoService';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import { useMapWorker } from '@/hooks/useMapWorker';

interface OptimizedMapProps {
  onFactClick?: (fact: FactMarker) => void;
  className?: string;
  center?: [number, number];
  zoom?: number;
  enableClustering?: boolean;
}

const OptimizedMap: React.FC<OptimizedMapProps> = ({
  onFactClick,
  className = "w-full h-96",
  center = [0, 0],
  zoom = 2,
  enableClustering = true
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const lastBounds = useRef<string>('');
  const updateTimeout = useRef<NodeJS.Timeout>();

  const [facts, setFacts] = useState<FactMarker[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isDataLoading, setIsDataLoading] = useState(false);

  const { clusterFacts, processGeoJSON, isWorkerAvailable } = useMapWorker();

  // Memoized GeoJSON features for optimal performance
  const geoJsonFeatures = useMemo(() => {
    if (!facts.length) {
      return { type: 'FeatureCollection' as const, features: [] };
    }

    const features = facts.map(fact => ({
      type: 'Feature' as const,
      geometry: {
        type: 'Point' as const,
        coordinates: [fact.longitude, fact.latitude]
      },
      properties: {
        id: fact.id,
        title: fact.title,
        category: fact.category,
        verified: fact.verified,
        voteScore: fact.voteScore
      }
    }));

    return {
      type: 'FeatureCollection' as const,
      features
    };
  }, [facts]);

  // Optimized data fetching with intelligent debouncing
  const fetchFactsForBounds = useCallback(async (bounds: ViewportBounds, zoomLevel: number) => {
    const boundsKey = `${bounds.north},${bounds.south},${bounds.east},${bounds.west},${zoomLevel}`;
    
    if (lastBounds.current === boundsKey) {
      return; // Skip if bounds haven't changed
    }

    lastBounds.current = boundsKey;
    setIsDataLoading(true);

    try {
      let result = await geoService.getFactsForBounds(bounds, zoomLevel);
      
      // Use clustering for performance if enabled and we have many facts
      if (enableClustering && result.length > 100 && isWorkerAvailable) {
        try {
          const clusters = await clusterFacts(result, zoomLevel, bounds) as any;
          // Convert clusters back to individual facts for now (could be enhanced)
          result = clusters.flatMap((cluster: any) => cluster.facts || []);
        } catch (error) {
          console.warn('Clustering failed, using original results:', error);
        }
      }

      setFacts(result);
    } catch (error) {
      console.error('Error fetching facts:', error);
      setFacts([]);
    } finally {
      setIsDataLoading(false);
    }
  }, [enableClustering, clusterFacts, isWorkerAvailable]);

  // Update map data efficiently
  const updateMapData = useCallback(() => {
    if (!map.current || !isLoaded) return;

    const mapSource = map.current.getSource('facts') as mapboxgl.GeoJSONSource;
    if (mapSource) {
      mapSource.setData(geoJsonFeatures as any);
    }
  }, [geoJsonFeatures, isLoaded]);

  // Handle viewport changes with smart debouncing
  const handleViewportChange = useCallback(() => {
    if (!map.current) return;

    if (updateTimeout.current) {
      clearTimeout(updateTimeout.current);
    }

    updateTimeout.current = setTimeout(() => {
      const mapBounds = map.current!.getBounds();
      const bounds: ViewportBounds = {
        north: mapBounds.getNorth(),
        south: mapBounds.getSouth(),
        east: mapBounds.getEast(),
        west: mapBounds.getWest()
      };

      fetchFactsForBounds(bounds, map.current!.getZoom());
    }, 150); // Optimized debounce timing
  }, [fetchFactsForBounds]);

  // Enhanced map initialization
  useEffect(() => {
    if (!mapContainer.current) return;

    try {
      // Get token from environment or show input
      const token = 'pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw';
      
      if (!token) {
        console.error('Mapbox token not found');
        return;
      }

      mapboxgl.accessToken = token;

      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/light-v11',
        center: center,
        zoom: zoom,
        maxZoom: 18,
        minZoom: 1,
        // Performance optimizations
        antialias: false,
        preserveDrawingBuffer: false,
        refreshExpiredTiles: false,
        // Smooth interactions
        pitchWithRotate: false,
        dragRotate: false,
        touchZoomRotate: false
      });

      // Enhanced map setup on load
      map.current.on('load', () => {
        if (!map.current) return;

        // Add optimized GeoJSON source
        map.current.addSource('facts', {
          type: 'geojson',
          data: geoJsonFeatures as any,
          cluster: enableClustering,
          clusterMaxZoom: 14,
          clusterRadius: 50,
          buffer: 0,
          tolerance: 0.375,
          lineMetrics: false
        });

        // Add main facts layer with zoom-based styling
        map.current.addLayer({
          id: 'facts',
          type: 'circle',
          source: 'facts',
          filter: enableClustering ? ['!', ['has', 'point_count']] : undefined,
          paint: {
            'circle-radius': [
              'interpolate',
              ['linear'],
              ['zoom'],
              8, 4,
              16, 8
            ],
            'circle-color': [
              'case',
              ['get', 'verified'], '#10b981',
              '#3b82f6'
            ],
            'circle-opacity': 0.8,
            'circle-stroke-width': 1,
            'circle-stroke-color': '#ffffff'
          }
        });

        // Add cluster layers if clustering is enabled
        if (enableClustering) {
          map.current.addLayer({
            id: 'clusters',
            type: 'circle',
            source: 'facts',
            filter: ['has', 'point_count'],
            paint: {
              'circle-radius': [
                'step',
                ['get', 'point_count'],
                15, 10,
                25, 30,
                35
              ],
              'circle-color': [
                'step',
                ['get', 'point_count'],
                '#3b82f6', 10,
                '#f59e0b', 30,
                '#ef4444'
              ],
              'circle-opacity': 0.8
            }
          });

          map.current.addLayer({
            id: 'cluster-count',
            type: 'symbol',
            source: 'facts',
            filter: ['has', 'point_count'],
            layout: {
              'text-field': '{point_count_abbreviated}',
              'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
              'text-size': 12
            },
            paint: {
              'text-color': '#ffffff'
            }
          });
        }

        // Optimized click handlers
        map.current.on('click', 'facts', (e) => {
          if (e.features?.[0] && onFactClick) {
            const feature = e.features[0];
            const factId = feature.properties?.id;
            const fact = facts.find(f => f.id === factId);
            if (fact) {
              onFactClick(fact);
            }
          }
        });

        // Enhanced hover effects
        map.current.on('mouseenter', 'facts', () => {
          if (map.current) {
            map.current.getCanvas().style.cursor = 'pointer';
          }
        });

        map.current.on('mouseleave', 'facts', () => {
          if (map.current) {
            map.current.getCanvas().style.cursor = '';
          }
        });

        setIsLoaded(true);
        
        // Initial data fetch
        const bounds = map.current.getBounds();
        fetchFactsForBounds({
          north: bounds.getNorth(),
          south: bounds.getSouth(),
          east: bounds.getEast(),
          west: bounds.getWest()
        }, map.current.getZoom());
      });

      // Optimized event listeners
      map.current.on('moveend', handleViewportChange);
      map.current.on('zoomend', handleViewportChange);

    } catch (error) {
      console.error('Map initialization error:', error);
    }

    // Cleanup
    return () => {
      if (updateTimeout.current) {
        clearTimeout(updateTimeout.current);
      }
      map.current?.remove();
    };
  }, [center, zoom, enableClustering, fetchFactsForBounds, handleViewportChange, geoJsonFeatures, facts, onFactClick]);

  // Update map data when facts change
  useEffect(() => {
    if (isLoaded) {
      updateMapData();
    }
  }, [isLoaded, updateMapData]);

  return (
    <ErrorBoundary>
      <div className={className}>
        <div ref={mapContainer} className="w-full h-full rounded-lg" />
        {isDataLoading && (
          <div className="absolute top-4 left-4 bg-background/90 px-3 py-1 rounded-md text-sm">
            Loading facts...
          </div>
        )}
        {isLoaded && (
          <div className="absolute bottom-4 right-4 bg-background/90 px-3 py-1 rounded-md text-xs">
            {facts.length} facts loaded
          </div>
        )}
      </div>
    </ErrorBoundary>
  );
};

export default OptimizedMap;