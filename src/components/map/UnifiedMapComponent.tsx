import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import * as mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { mapboxService } from '@/services/mapboxService';
import { MapTokenMissing } from './MapTokenMissing';
import { useDiscoveryStore } from '@/stores/discoveryStore';
import { FactMarker } from '@/types/map';
import { EnhancedFact } from '@/types/fact';
import Supercluster from 'supercluster';

interface UnifiedMapProps {
  onFactClick?: (fact: FactMarker) => void;
  className?: string;
  isVisible?: boolean;
  variant?: 'enhanced' | 'scalable' | 'optimized' | 'retina' | 'clustered' | 'experimental';
  enableClustering?: boolean;
  enablePerformanceOptimizations?: boolean;
  enableRetinaBehavior?: boolean;
  style?: string;
  center?: [number, number];
  zoom?: number;
}

export const UnifiedMapComponent: React.FC<UnifiedMapProps> = ({
  onFactClick,
  className = '',
  isVisible = true,
  variant = 'enhanced',
  enableClustering = true,
  enablePerformanceOptimizations = true,
  enableRetinaBehavior = false,
  style = 'mapbox://styles/mapbox/light-v11',
  center = [0, 20],
  zoom = 1.5
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const superclusterRef = useRef<Supercluster | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  
  const [mapboxToken, setMapboxToken] = useState<string | null>(null);
  const [tokenMissing, setTokenMissing] = useState(false);
  const [loadingState, setLoadingState] = useState<'token' | 'map' | 'ready'>('token');
  const [error, setError] = useState<string | null>(null);

  const { facts } = useDiscoveryStore();

  // Token fetching
  useEffect(() => {
    const fetchToken = async () => {
      try {
        setLoadingState('token');
        const token = await mapboxService.getToken();
        
        if (!token) {
          setTokenMissing(true);
          return;
        }
        
        setMapboxToken(token);
        setTokenMissing(false);
      } catch (error) {
        console.error('Failed to fetch Mapbox token:', error);
        setTokenMissing(true);
      }
    };

    fetchToken();
  }, []);

  // Initialize clustering if enabled
  const initializeClustering = useCallback(() => {
    if (!enableClustering) return;
    
    superclusterRef.current = new Supercluster({
      radius: 80,
      maxZoom: 16,
      minZoom: 0,
      extent: 512,
      nodeSize: 64,
      log: false,
      generateId: true
    });
  }, [enableClustering]);

  // Map initialization
  const initializeMap = useCallback(async () => {
    if (!mapContainer.current || !mapboxToken || !isVisible) return;

    try {
      setLoadingState('map');
      (mapboxgl as any).accessToken = mapboxToken;

      // Performance optimizations based on variant
      const mapOptions: mapboxgl.MapboxOptions = {
        container: mapContainer.current,
        style,
        center,
        zoom,
        attributionControl: false,
        logoPosition: 'bottom-right',
        ...(enablePerformanceOptimizations && {
          antialias: variant === 'retina' ? true : false,
          optimizeForTerrain: variant === 'scalable',
          preserveDrawingBuffer: variant === 'experimental',
          fadeDuration: variant === 'optimized' ? 0 : 300
        }),
        ...(enableRetinaBehavior && {
          pixelRatio: window.devicePixelRatio || 1
        })
      };

      map.current = new mapboxgl.Map(mapOptions);

      // Add navigation controls
      if (variant !== 'retina') {
        map.current.addControl(
          new mapboxgl.NavigationControl({
            visualizePitch: true,
          }),
          'top-right'
        );
      }

      // Initialize clustering
      if (enableClustering) {
        initializeClustering();
      }

      // Setup event listeners
      map.current.on('load', () => {
        setLoadingState('ready');
        updateMarkers();
      });

      map.current.on('error', (e) => {
        console.error('Map error:', e);
        setError('Map failed to load properly');
      });

      // Variant-specific behaviors
      if (variant === 'scalable') {
        // Disable some interactions for performance
        map.current.scrollZoom.disable();
        map.current.boxZoom.disable();
      }

      if (variant === 'experimental') {
        // Add experimental features
        map.current.on('style.load', () => {
          map.current?.setFog({
            color: 'rgb(255, 255, 255)',
            'high-color': 'rgb(200, 200, 225)',
            'horizon-blend': 0.2,
          });
        });
      }

    } catch (error) {
      console.error('Map initialization error:', error);
      setError(error instanceof Error ? error.message : 'Failed to initialize map');
    }
  }, [mapboxToken, isVisible, variant, style, center, zoom, enableClustering, enablePerformanceOptimizations, enableRetinaBehavior, initializeClustering]);

  // Convert EnhancedFact to FactMarker for compatibility
  const convertToFactMarker = useCallback((fact: EnhancedFact): FactMarker => ({
    id: fact.id,
    title: fact.title,
    latitude: fact.latitude,
    longitude: fact.longitude,
    category: fact.categories?.category_translations?.[0]?.name || 'Unknown',
    verified: fact.status === 'verified',
    voteScore: (fact.vote_count_up || 0) - (fact.vote_count_down || 0),
    authorName: fact.profiles?.username || 'Anonymous'
  }), []);

  // Update markers based on facts
  const updateMarkers = useCallback(() => {
    if (!map.current || !facts.length) return;

    // Clear existing markers
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    // Convert EnhancedFacts to FactMarkers
    const factMarkers = facts.map(convertToFactMarker);
    if (enableClustering && superclusterRef.current) {
      // Use clustering
      const points = factMarkers.map(fact => ({
        type: 'Feature' as const,
        properties: {
          cluster: false,
          factId: fact.id,
          fact
        },
        geometry: {
          type: 'Point' as const,
          coordinates: [fact.longitude, fact.latitude] as [number, number]
        }
      }));

      superclusterRef.current.load(points);

      const bounds = map.current.getBounds();
      const bbox: [number, number, number, number] = [
        bounds.getWest(),
        bounds.getSouth(),
        bounds.getEast(),
        bounds.getNorth()
      ];

      const zoom = Math.floor(map.current.getZoom());
      const clusters = superclusterRef.current.getClusters(bbox, zoom);

      clusters.forEach((cluster) => {
        const [longitude, latitude] = cluster.geometry.coordinates;
        
        if (cluster.properties?.cluster) {
          // Create cluster marker
          const clusterMarker = new mapboxgl.Marker({
            element: createClusterElement(cluster.properties.point_count)
          })
            .setLngLat([longitude, latitude])
            .addTo(map.current!);
          
          markersRef.current.push(clusterMarker);
        } else {
          // Create individual fact marker
          const fact = cluster.properties?.fact;
          if (fact) {
            const markerElement = createFactMarkerElement(fact);
            const marker = new mapboxgl.Marker({ element: markerElement })
              .setLngLat([longitude, latitude])
              .addTo(map.current!);
            
            markerElement.addEventListener('click', () => {
              onFactClick?.(fact);
            });
            
            markersRef.current.push(marker);
          }
        }
      });
    } else {
      // Simple markers without clustering
      factMarkers.forEach((fact) => {
        const markerElement = createFactMarkerElement(fact);
        const marker = new mapboxgl.Marker({ element: markerElement })
          .setLngLat([fact.longitude, fact.latitude])
          .addTo(map.current!);
        
        markerElement.addEventListener('click', () => {
          onFactClick?.(fact);
        });
        
        markersRef.current.push(marker);
      });
    }
  }, [facts, enableClustering, onFactClick, convertToFactMarker]);

  // Helper functions for marker creation
  const createClusterElement = (count: number) => {
    const el = document.createElement('div');
    el.className = 'cluster-marker';
    el.style.cssText = `
      background-color: #3B82F6;
      color: white;
      border-radius: 50%;
      width: 40px;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: bold;
      font-size: 14px;
      border: 2px solid white;
      box-shadow: 0 2px 4px rgba(0,0,0,0.2);
      cursor: pointer;
    `;
    el.textContent = count.toString();
    return el;
  };

  const createFactMarkerElement = (fact: FactMarker) => {
    const el = document.createElement('div');
    el.className = 'fact-marker';
    el.style.cssText = `
      background-color: ${fact.verified ? '#10B981' : '#F59E0B'};
      width: 20px;
      height: 20px;
      border-radius: 50%;
      border: 2px solid white;
      box-shadow: 0 2px 4px rgba(0,0,0,0.2);
      cursor: pointer;
      transition: all 0.2s ease;
    `;
    
    el.addEventListener('mouseenter', () => {
      el.style.transform = 'scale(1.2)';
    });
    
    el.addEventListener('mouseleave', () => {
      el.style.transform = 'scale(1)';
    });
    
    return el;
  };

  // Initialize map when token is available
  useEffect(() => {
    if (mapboxToken && !tokenMissing) {
      initializeMap();
    }
  }, [mapboxToken, tokenMissing, initializeMap]);

  // Update markers when facts change
  useEffect(() => {
    if (loadingState === 'ready') {
      updateMarkers();
    }
  }, [facts, loadingState, updateMarkers]);

  // Update markers when map moves (for clustering)
  useEffect(() => {
    if (!map.current || !enableClustering) return;

    const handleMoveEnd = () => {
      updateMarkers();
    };

    map.current.on('moveend', handleMoveEnd);
    map.current.on('zoomend', handleMoveEnd);

    return () => {
      map.current?.off('moveend', handleMoveEnd);
      map.current?.off('zoomend', handleMoveEnd);
    };
  }, [enableClustering, updateMarkers]);

  // Cleanup
  useEffect(() => {
    return () => {
      markersRef.current.forEach(marker => marker.remove());
      map.current?.remove();
    };
  }, []);

  if (tokenMissing) {
    return <MapTokenMissing />;
  }

  if (error) {
    return (
      <div className={`flex items-center justify-center bg-muted rounded-lg ${className}`}>
        <div className="text-center p-8">
          <div className="text-red-500 text-2xl mb-2">⚠️</div>
          <p className="text-sm text-muted-foreground">{error}</p>
          <button 
            onClick={() => {
              setError(null);
              initializeMap();
            }}
            className="mt-2 px-3 py-1 text-sm bg-primary text-primary-foreground rounded"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      <div ref={mapContainer} className="w-full h-full rounded-lg" />
      
      {loadingState !== 'ready' && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm rounded-lg">
          <div className="text-center space-y-2">
            <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full mx-auto" />
            <p className="text-sm text-muted-foreground">
              {loadingState === 'token' ? 'Loading token...' : 'Initializing map...'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default UnifiedMapComponent;