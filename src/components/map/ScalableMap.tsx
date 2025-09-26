/**
 * Scalable map implementation for millions of facts
 * Uses clustering, viewport-based loading, and WebGL rendering
 */

import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import mapboxgl from 'mapbox-gl';
import Supercluster from 'supercluster';
import { throttle, debounce } from 'lodash';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin, Layers, ZoomIn } from 'lucide-react';

// Types for scalable facts
interface ScalableFact {
  id: string;
  title: string;
  latitude: number;
  longitude: number;
  category: string;
  vote_count_up: number;
  properties?: Record<string, any>;
}

interface ClusterFeature {
  id: number;
  type: 'Feature';
  properties: {
    cluster: boolean;
    cluster_id?: number;
    point_count?: number;
    point_count_abbreviated?: string;
    fact?: ScalableFact;
  };
  geometry: {
    type: 'Point';
    coordinates: [number, number];
  };
}

interface ScalableMapProps {
  facts: ScalableFact[];
  center?: [number, number];
  zoom?: number;
  maxZoom?: number;
  clusterRadius?: number;
  onFactClick?: (fact: ScalableFact) => void;
  onBoundsChange?: (bounds: mapboxgl.LngLatBounds) => void;
  style?: 'light' | 'dark' | 'satellite';
}

export const ScalableMap: React.FC<ScalableMapProps> = ({
  facts,
  center = [0, 0],
  zoom = 2,
  maxZoom = 16,
  clusterRadius = 50,
  onFactClick,
  onBoundsChange,
  style = 'light'
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapboxToken, setMapboxToken] = useState<string>('');
  const [isLoaded, setIsLoaded] = useState(false);
  const [currentZoom, setCurrentZoom] = useState(zoom);
  const [viewportFacts, setViewportFacts] = useState<ScalableFact[]>([]);
  const [loadingViewport, setLoadingViewport] = useState(false);

  // Performance tracking
  const [renderMetrics, setRenderMetrics] = useState({
    totalFacts: 0,
    visibleClusters: 0,
    renderTime: 0
  });

  // Initialize supercluster for efficient clustering
  const supercluster = useMemo(() => {
    const cluster = new Supercluster({
      radius: clusterRadius,
      maxZoom: maxZoom - 1,
      minZoom: 0,
      map: (props) => ({ sum: props.vote_count_up || 0 }),
      reduce: (accumulated, props) => { accumulated.sum += props.sum; }
    });

    if (facts.length > 0) {
      const geoJsonPoints = facts.map(fact => ({
        type: 'Feature' as const,
        properties: { fact },
        geometry: {
          type: 'Point' as const,
          coordinates: [fact.longitude, fact.latitude] as [number, number]
        }
      }));
      
      cluster.load(geoJsonPoints);
    }

    return cluster;
  }, [facts, clusterRadius, maxZoom]);

  // Load Mapbox token
  useEffect(() => {
    fetch('/functions/v1/get-mapbox-token', { method: 'POST' })
      .then(res => res.json())
      .then(data => setMapboxToken(data.token))
      .catch(console.error);
  }, []);

  // Get map style URL
  const getMapStyleUrl = useCallback((styleType: string) => {
    const styles = {
      light: 'mapbox://styles/mapbox/light-v11',
      dark: 'mapbox://styles/mapbox/dark-v11',
      satellite: 'mapbox://styles/mapbox/satellite-streets-v12'
    };
    return styles[styleType as keyof typeof styles] || styles.light;
  }, []);

  // Throttled viewport loading function
  const loadViewportFacts = useCallback(
    throttle(async (bounds: mapboxgl.LngLatBounds, zoom: number) => {
      if (!map.current) return;
      
      setLoadingViewport(true);
      const startTime = performance.now();

      try {
        // Get clusters for current viewport
        const clusters = supercluster.getClusters(
          [bounds.getWest(), bounds.getSouth(), bounds.getEast(), bounds.getNorth()],
          Math.floor(zoom)
        ) as ClusterFeature[];

        // Extract facts from clusters for current viewport
        const newViewportFacts: ScalableFact[] = [];
        clusters.forEach(cluster => {
          if (cluster.properties.cluster) {
            // For clusters, get children if zoom is high enough
            if (zoom > 10 && cluster.properties.cluster_id) {
              const children = supercluster.getChildren(cluster.properties.cluster_id);
              children.forEach(child => {
                if (child.properties && (child.properties as any).fact) {
                  newViewportFacts.push((child.properties as any).fact);
                }
              });
            }
          } else if (cluster.properties && (cluster.properties as any).fact) {
            newViewportFacts.push((cluster.properties as any).fact);
          }
        });

        setViewportFacts(newViewportFacts);
        
        const renderTime = performance.now() - startTime;
        setRenderMetrics({
          totalFacts: facts.length,
          visibleClusters: clusters.length,
          renderTime: Math.round(renderTime)
        });

        onBoundsChange?.(bounds);
      } catch (error) {
        console.error('Error loading viewport facts:', error);
      } finally {
        setLoadingViewport(false);
      }
    }, 300),
    [supercluster, facts.length, onBoundsChange]
  );

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || !mapboxToken) return;

    mapboxgl.accessToken = mapboxToken;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: getMapStyleUrl(style),
      center: center,
      zoom: zoom,
      antialias: true,
      attributionControl: false,
      logoPosition: 'bottom-right',
      // Performance optimizations
      preserveDrawingBuffer: false,
      refreshExpiredTiles: false
    });

    map.current.on('load', () => {
      setIsLoaded(true);
      
      // Add cluster layer using Mapbox GL native clustering for maximum performance
      map.current!.addSource('facts', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: facts.map(fact => ({
            type: 'Feature',
            properties: {
              id: fact.id,
              title: fact.title,
              category: fact.category,
              vote_count_up: fact.vote_count_up
            },
            geometry: {
              type: 'Point',
              coordinates: [fact.longitude, fact.latitude]
            }
          }))
        },
        cluster: true,
        clusterMaxZoom: maxZoom - 1,
        clusterRadius: clusterRadius,
        clusterProperties: {
          sum_votes: ['+', ['get', 'vote_count_up']]
        }
      });

      // Add cluster circles layer
      map.current!.addLayer({
        id: 'clusters',
        type: 'circle',
        source: 'facts',
        filter: ['has', 'point_count'],
        paint: {
          'circle-color': [
            'step',
            ['get', 'point_count'],
            '#51bbd3',  // Small clusters
            50, '#f1f075',  // Medium clusters  
            100, '#f28cb1'  // Large clusters
          ],
          'circle-radius': [
            'step',
            ['get', 'point_count'],
            15,   // Small clusters
            50, 20,   // Medium clusters
            100, 25   // Large clusters
          ],
          'circle-stroke-width': 2,
          'circle-stroke-color': '#fff'
        }
      });

      // Add cluster count labels
      map.current!.addLayer({
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

      // Add individual points layer
      map.current!.addLayer({
        id: 'unclustered-point',
        type: 'circle',
        source: 'facts',
        filter: ['!', ['has', 'point_count']],
        paint: {
          'circle-color': [
            'match',
            ['get', 'category'],
            'history', '#3b82f6',
            'nature', '#10b981', 
            'culture', '#8b5cf6',
            'mystery', '#f59e0b',
            '#6b7280'  // default
          ],
          'circle-radius': [
            'interpolate',
            ['linear'],
            ['zoom'],
            8, 4,
            16, 8
          ],
          'circle-stroke-width': 1,
          'circle-stroke-color': '#fff'
        }
      });

      // Click handlers for native performance
      map.current!.on('click', 'clusters', (e) => {
        const features = map.current!.queryRenderedFeatures(e.point, {
          layers: ['clusters']
        });
        
        if (features[0]) {
          const clusterId = features[0].properties.cluster_id;
          (map.current!.getSource('facts') as mapboxgl.GeoJSONSource).getClusterExpansionZoom(
            clusterId,
            (err, zoom) => {
              if (err) return;
              
              map.current!.easeTo({
                center: (features[0].geometry as any).coordinates,
                zoom: zoom
              });
            }
          );
        }
      });

      map.current!.on('click', 'unclustered-point', (e) => {
        const feature = e.features?.[0];
        if (feature && feature.properties) {
          const fact = facts.find(f => f.id === feature.properties.id);
          if (fact && onFactClick) {
            onFactClick(fact);
          }
        }
      });

      // Performance-optimized move handler
      const handleMove = debounce(() => {
        if (!map.current) return;
        
        const bounds = map.current.getBounds();
        const zoom = map.current.getZoom();
        setCurrentZoom(zoom);
        loadViewportFacts(bounds, zoom);
      }, 150);

      map.current.on('moveend', handleMove);
      map.current.on('zoomend', handleMove);

      // Initial viewport load
      loadViewportFacts(map.current.getBounds(), zoom);
    });

    return () => {
      map.current?.remove();
    };
  }, [mapboxToken, getMapStyleUrl, style, facts, loadViewportFacts]);

  // Update fact source when facts change
  useEffect(() => {
    if (!map.current || !isLoaded) return;

    const source = map.current.getSource('facts') as mapboxgl.GeoJSONSource;
    if (source) {
      source.setData({
        type: 'FeatureCollection',
        features: facts.map(fact => ({
          type: 'Feature',
          properties: {
            id: fact.id,
            title: fact.title,
            category: fact.category,
            vote_count_up: fact.vote_count_up
          },
          geometry: {
            type: 'Point',
            coordinates: [fact.longitude, fact.latitude]
          }
        }))
      });
    }
  }, [facts, isLoaded]);

  return (
    <div className="relative w-full h-full">
      <div ref={mapContainer} className="absolute inset-0" />
      
      {/* Mobile-optimized controls - hide performance metrics on mobile */}
      <div className="absolute bottom-4 left-4 hidden md:block">
        <Card className="p-2 bg-background/90 backdrop-blur">
          <div className="text-xs space-y-1">
            <div className="flex items-center gap-2">
              <Layers className="w-3 h-3" />
              <span>{renderMetrics.totalFacts.toLocaleString()} facts</span>
            </div>
            <div className="flex items-center gap-2">
              <ZoomIn className="w-3 h-3" />
              <span>Zoom: {currentZoom.toFixed(1)}</span>
            </div>
            {loadingViewport && (
              <div className="text-xs text-primary">Loading...</div>
            )}
          </div>
        </Card>
      </div>

      {/* Mobile loading indicator */}
      {loadingViewport && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 md:hidden">
          <div className="bg-background/90 backdrop-blur rounded-full p-3">
            <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full" />
          </div>
        </div>
      )}
    </div>
  );
};