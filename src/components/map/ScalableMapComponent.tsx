// Scalable map component designed for millions of users
import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { mapboxService } from '@/services/mapboxService';
import { geoService } from '@/services/geoService';
import { FactMarker } from '@/types/map';
import { cn } from '@/lib/utils';

// Map styles for style controls
const mapStyles = {
  light: 'mapbox://styles/mapbox/light-v11',
  dark: 'mapbox://styles/mapbox/dark-v11',
  satellite: 'mapbox://styles/mapbox/satellite-streets-v12',
  terrain: 'mapbox://styles/mapbox/outdoors-v12'
};

interface ScalableMapProps {
  className?: string;
  initialCenter?: [number, number];
  initialZoom?: number;
  onFactClick?: (fact: FactMarker) => void;
  isVisible?: boolean;
}

interface ViewportBounds {
  north: number;
  south: number;
  east: number;
  west: number;
}

const ZOOM_THRESHOLDS = {
  CLUSTER_ONLY: 10,
  INDIVIDUAL_FACTS: 14,
  DETAILED_VIEW: 16
};

export const ScalableMapComponent: React.FC<ScalableMapProps> = ({
  className = '',
  initialCenter = [0, 20],
  initialZoom = 2,
  onFactClick,
  isVisible = true
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const hasInitializedRef = useRef(false);
  const updateTimeoutRef = useRef<NodeJS.Timeout>();
  
  const [loadingState, setLoadingState] = useState<'token' | 'map' | 'ready' | 'error'>('token');
  const [errorState, setErrorState] = useState<string | null>(null);
  const [currentBounds, setCurrentBounds] = useState<ViewportBounds | null>(null);
  const [currentZoom, setCurrentZoom] = useState(initialZoom);
  const [mapStyle, setMapStyle] = useState<keyof typeof mapStyles>('light');
  const [tokenMissing, setTokenMissing] = useState(false);

  // Enhanced initialization with preloaded token
  const initializeMap = useCallback(async () => {
    if (hasInitializedRef.current || !mapContainer.current || !isVisible) return;

    try {
      setLoadingState('token');
      setErrorState(null);
      
      const token = await mapboxService.getToken();
      if (!token || token.length < 10) {
        throw new Error('Invalid or missing Mapbox token. Please check your Supabase Edge Function configuration.');
      }
      
      console.log('🗺️ Mapbox token obtained, initializing map...');
      setLoadingState('map');
      mapboxgl.accessToken = token;

      // Initialize with default style to avoid circular dependency
      const mapInstance = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/light-v11', // Fixed default style
        center: initialCenter,
        zoom: initialZoom,
        preserveDrawingBuffer: true,
        attributionControl: false,
        logoPosition: 'bottom-right',
        antialias: true,
        maxZoom: 18,
        renderWorldCopies: false,
        trackResize: true
      });

      // Add minimal controls for performance
      mapInstance.addControl(
        new mapboxgl.NavigationControl({ visualizePitch: false }), 
        'top-right'
      );
      
      const geolocate = new mapboxgl.GeolocateControl({
        positionOptions: { enableHighAccuracy: false, timeout: 10000 },
        trackUserLocation: false,
        showUserHeading: false
      });
      mapInstance.addControl(geolocate, 'top-right');

      map.current = mapInstance;
      hasInitializedRef.current = true;

      // Setup efficient event listeners
      mapInstance.on('load', () => {
        console.log('🗺️ Scalable map loaded successfully');
        setLoadingState('ready');
        setErrorState(null);
        
        // Apply the correct style after successful load
        if (mapStyle !== 'light') {
          mapInstance.setStyle(mapStyles[mapStyle]);
        }
        
        updateViewportData();
      });

      // Throttled viewport updates for performance
      const handleViewportChange = () => {
        if (updateTimeoutRef.current) {
          clearTimeout(updateTimeoutRef.current);
        }
        
        updateTimeoutRef.current = setTimeout(() => {
          updateViewportData();
        }, 300); // 300ms debounce
      };

      mapInstance.on('moveend', handleViewportChange);
      mapInstance.on('zoomend', handleViewportChange);

      mapInstance.on('error', (e) => {
        console.error('Map error:', e);
        setErrorState('Map rendering error occurred');
      });

    } catch (error) {
      console.error('❌ Error initializing Scalable map:', error);
      setLoadingState('error');
      const errorMessage = error instanceof Error ? error.message : 'Failed to initialize map';
      setErrorState(errorMessage);
      setTokenMissing(errorMessage.toLowerCase().includes('token'));
      hasInitializedRef.current = false;
    }
  }, [initialCenter, initialZoom, isVisible]); // Removed mapStyle and updateViewportData dependencies

  // Efficient viewport data updates
  const updateViewportData = useCallback(async () => {
    if (!map.current) return;

    try {
      const bounds = map.current.getBounds();
      const zoom = map.current.getZoom();
      
      const viewportBounds: ViewportBounds = {
        north: bounds.getNorth(),
        south: bounds.getSouth(),
        east: bounds.getEast(),
        west: bounds.getWest()
      };

      setCurrentBounds(viewportBounds);
      setCurrentZoom(zoom);

      console.log(`🗺️ Loading data for zoom ${zoom.toFixed(1)}`);
      
      const { facts, clusters } = await geoService.getFactsInViewport(
        viewportBounds,
        zoom
      );

      // Update map visualization based on zoom level
      if (zoom >= ZOOM_THRESHOLDS.INDIVIDUAL_FACTS) {
        renderIndividualFacts(facts);
      } else {
        renderClusters(clusters);
      }

    } catch (error) {
      console.error('Error updating viewport data:', error);
    }
  }, []);

  // Render individual facts for high zoom levels
  const renderIndividualFacts = useCallback((facts: FactMarker[]) => {
    if (!map.current) return;

    // Clear existing cluster layers first
    ['clusters', 'cluster-count'].forEach(layerId => {
      if (map.current!.getLayer(layerId)) {
        map.current!.removeLayer(layerId);
      }
    });

    // Remove existing sources to prevent conflicts
    ['facts', 'clusters'].forEach(sourceId => {
      if (map.current!.getSource(sourceId)) {
        // Remove layers using this source first
        const style = map.current!.getStyle();
        if (style.layers) {
          style.layers.forEach(layer => {
            if (layer.source === sourceId && map.current!.getLayer(layer.id)) {
              map.current!.removeLayer(layer.id);
            }
          });
        }
        map.current!.removeSource(sourceId);
      }
    });

    if (facts.length === 0) return;

    // Add facts as individual points
    map.current.addSource('facts', {
      type: 'geojson',
      data: {
        type: 'FeatureCollection',
        features: facts.map(fact => ({
          type: 'Feature',
          properties: {
            id: fact.id,
            title: fact.title,
            category: fact.category,
            verified: fact.verified,
            voteScore: fact.voteScore || 0
          },
          geometry: {
            type: 'Point',
            coordinates: [fact.longitude, fact.latitude]
          }
        }))
      }
    });

    // Style individual points
    map.current.addLayer({
      id: 'individual-facts',
      type: 'circle',
      source: 'facts',
      paint: {
        'circle-radius': [
          'case',
          ['get', 'verified'], 8, 6
        ],
        'circle-color': [
          'case',
          ['get', 'verified'], '#10B981', '#3B82F6'
        ],
        'circle-stroke-width': 2,
        'circle-stroke-color': '#ffffff',
        'circle-opacity': 0.8
      }
    });

    // Add click handlers
    map.current.on('click', 'individual-facts', (e) => {
      if (e.features && e.features[0]) {
        const feature = e.features[0];
        const fact = facts.find(f => f.id === feature.properties?.id);
        if (fact && onFactClick) {
          onFactClick(fact);
        }
      }
    });

    map.current.on('mouseenter', 'individual-facts', () => {
      map.current!.getCanvas().style.cursor = 'pointer';
    });

    map.current.on('mouseleave', 'individual-facts', () => {
      map.current!.getCanvas().style.cursor = '';
    });

  }, [onFactClick]);

  // Render clusters for low zoom levels
  const renderClusters = useCallback((clusters: any[]) => {
    if (!map.current) return;

    // Clear individual fact layers first
    if (map.current.getLayer('individual-facts')) {
      map.current.removeLayer('individual-facts');
    }

    // Remove existing sources to prevent conflicts
    ['clusters', 'facts'].forEach(sourceId => {
      if (map.current!.getSource(sourceId)) {
        // Remove layers using this source first
        const style = map.current!.getStyle();
        if (style.layers) {
          style.layers.forEach(layer => {
            if (layer.source === sourceId && map.current!.getLayer(layer.id)) {
              map.current!.removeLayer(layer.id);
            }
          });
        }
        map.current!.removeSource(sourceId);
      }
    });

    if (clusters.length === 0) return;

    // Add clusters as source
    map.current.addSource('clusters', {
      type: 'geojson',
      data: {
        type: 'FeatureCollection',
        features: clusters.map(cluster => ({
          type: 'Feature',
          properties: {
            id: cluster.id,
            count: cluster.count,
            verified_count: cluster.verified_count,
            total_votes: cluster.total_votes
          },
          geometry: {
            type: 'Point',
            coordinates: cluster.center
          }
        }))
      }
    });

    // Style clusters
    map.current.addLayer({
      id: 'clusters',
      type: 'circle',
      source: 'clusters',
      paint: {
        'circle-radius': [
          'step',
          ['get', 'count'],
          15,
          10, 20,
          50, 25,
          100, 30
        ],
        'circle-color': [
          'case',
          ['>', ['get', 'verified_count'], ['/', ['get', 'count'], 2]],
          '#10B981',
          '#3B82F6'
        ],
        'circle-stroke-width': 2,
        'circle-stroke-color': '#ffffff',
        'circle-opacity': 0.8
      }
    });

    // Add cluster labels
    map.current.addLayer({
      id: 'cluster-count',
      type: 'symbol',
      source: 'clusters',
      layout: {
        'text-field': ['get', 'count'],
        'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
        'text-size': 12
      },
      paint: {
        'text-color': '#ffffff'
      }
    });

    // Add click handlers for clusters
    map.current.on('click', 'clusters', (e) => {
      if (e.features && e.features[0] && map.current) {
        const feature = e.features[0];
        const coordinates = (feature.geometry as any).coordinates.slice();
        
        // Zoom into cluster
        map.current.flyTo({
          center: coordinates,
          zoom: Math.min(map.current.getZoom() + 2, ZOOM_THRESHOLDS.INDIVIDUAL_FACTS)
        });
      }
    });

  }, []);

  // Initialize map when component mounts or becomes visible
  useEffect(() => {
    if (isVisible && !hasInitializedRef.current) {
      // Preload token for faster initialization
      mapboxService.preloadToken().then(() => {
        initializeMap();
      });
    }
  }, [isVisible, initializeMap]);

  // Re-initialize when becoming visible if not already initialized
  useEffect(() => {
    if (isVisible && hasInitializedRef.current && map.current) {
      // Trigger resize to ensure map renders correctly
      setTimeout(() => {
        if (map.current) {
          map.current.resize();
          updateViewportData();
        }
      }, 100);
    }
  }, [isVisible, initializeMap]);

  // Handle map style changes (separate from initialization)
  useEffect(() => {
    if (map.current && loadingState === 'ready') {
      console.log(`🎨 Changing map style to: ${mapStyle}`);
      try {
        map.current.setStyle(mapStyles[mapStyle]);
      } catch (error) {
        console.warn('Failed to change map style:', error);
      }
    }
  }, [mapStyle]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
      }
      if (map.current) {
        map.current.remove();
      }
    };
  }, []);

  const showLoadingOverlay = loadingState !== 'ready';

  return (
    <div className={cn("relative w-full h-full", className)}>
      <div ref={mapContainer} className="absolute inset-0 rounded-lg" />
      
      {showLoadingOverlay && (
        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm rounded-lg flex items-center justify-center z-10">
          <div className="text-center space-y-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto" />
            <div className="text-sm text-muted-foreground">
              {loadingState === 'token' && 'Connecting to map service...'}
              {loadingState === 'map' && 'Loading map...'}
            </div>
          </div>
        </div>
      )}

      {errorState && (
        <div className="absolute top-4 left-4 right-4 bg-destructive/90 backdrop-blur-sm text-destructive-foreground p-3 rounded-lg z-20">
          <div className="text-sm font-medium">{errorState}</div>
        </div>
      )}

      {/* Map Style Controls */}
      {loadingState === 'ready' && (
        <div className="absolute top-4 left-4 flex flex-col space-y-2 z-30">
          {Object.entries(mapStyles).map(([style, _]) => (
            <button
              key={style}
              onClick={() => setMapStyle(style as keyof typeof mapStyles)}
              className={cn(
                'w-11 h-11 rounded-xl border-2 flex items-center justify-center text-base font-medium transition-all shadow-lg backdrop-blur-sm',
                mapStyle === style 
                  ? 'bg-primary text-primary-foreground border-primary shadow-primary/20' 
                  : 'bg-background/80 text-foreground border-border hover:bg-accent hover:border-accent-foreground hover:shadow-lg'
              )}
              title={`Switch to ${style} style`}
              aria-label={`Switch to ${style} map style`}
            >
              {style === 'light' && '☀️'}
              {style === 'dark' && '🌙'}
              {style === 'satellite' && '🛰️'}
              {style === 'terrain' && '🏔️'}
            </button>
          ))}
        </div>
      )}

      {/* Performance indicators for development */}
      {process.env.NODE_ENV === 'development' && currentBounds && (
        <div className="absolute bottom-4 left-4 bg-black/70 text-white text-xs p-2 rounded font-mono">
          Zoom: {currentZoom.toFixed(1)} | 
          Mode: {currentZoom >= ZOOM_THRESHOLDS.INDIVIDUAL_FACTS ? 'Facts' : 'Clusters'}
        </div>
      )}
    </div>
  );
};