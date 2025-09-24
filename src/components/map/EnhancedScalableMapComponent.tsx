import React, { useRef, useState, useEffect, useCallback, useMemo } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Satellite, Navigation, Share, AlertCircle, Key } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { geoService, GeoCluster } from '@/services/geoService';
import { FactMarker } from '@/types/map';
import { useDiscoveryStore } from '@/stores/discoveryStore';
import { toast } from '@/hooks/use-toast';
import { usePerformanceMonitor } from '@/hooks/usePerformanceMonitor';
import { useAdvancedGestures } from '@/hooks/useAdvancedGestures';
import { PerformanceMonitor } from '@/components/ui/performance-monitor';
import { supabase } from '@/integrations/supabase/client';

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

// Performance thresholds for different zoom levels
const ZOOM_THRESHOLDS = {
  INDIVIDUAL_FACTS: 12,    // Show individual facts above this zoom
  LARGE_CLUSTERS: 8,       // Show detailed clusters above this zoom
  MEDIUM_CLUSTERS: 5,      // Show medium clusters above this zoom
  GLOBAL_CLUSTERS: 0       // Show global clusters at this zoom and below
} as const;

export const EnhancedScalableMapComponent: React.FC<ScalableMapProps> = ({
  className = "",
  initialCenter = [-74.006, 40.7128], // NYC
  initialZoom = 10,
  onFactClick,
  isVisible = true
}) => {
  // Core refs and state
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const isInitialized = useRef(false);
  
  // Performance monitoring
  const { startRenderMeasurement, endRenderMeasurement, metrics } = usePerformanceMonitor(true);
  
  // State management
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentBounds, setCurrentBounds] = useState<ViewportBounds | null>(null);
  const [currentZoom, setCurrentZoom] = useState(initialZoom);
  const [mapStyle, setMapStyle] = useState<'light' | 'dark' | 'satellite'>('light');
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [tokenMissing, setTokenMissing] = useState(false);
  const [manualToken, setManualToken] = useState('');

  // Advanced touch gestures
  useAdvancedGestures(mapContainer, {
    onPinch: (scale, center) => {
      if (map.current) {
        const currentZoom = map.current.getZoom();
        const newZoom = currentZoom + Math.log2(scale);
        map.current.easeTo({
          zoom: Math.max(0, Math.min(22, newZoom)),
          center: map.current.unproject([center.x, center.y]),
          duration: 200
        });
      }
    },
    onPan: (translation, velocity) => {
      if (map.current && Math.abs(velocity.x) > 50 || Math.abs(velocity.y) > 50) {
        const center = map.current.getCenter();
        const pixelDelta = [translation.x, translation.y];
        const newCenter = map.current.unproject([
          map.current.project(center).x - pixelDelta[0],
          map.current.project(center).y - pixelDelta[1]
        ]);
        map.current.panTo(newCenter, { duration: 100 });
      }
    },
    onDoubleTap: (point) => {
      if (map.current) {
        const currentZoom = map.current.getZoom();
        map.current.easeTo({
          zoom: currentZoom + 1,
          center: map.current.unproject([point.x, point.y]),
          duration: 300
        });
      }
    }
  });

  // Utility functions
  const getMapStyle = useCallback((style: 'light' | 'dark' | 'satellite') => {
    const styles = {
      light: 'mapbox://styles/mapbox/light-v11',
      dark: 'mapbox://styles/mapbox/dark-v11',
      satellite: 'mapbox://styles/mapbox/satellite-streets-v12'
    };
    return styles[style];
  }, []);

  // Initialize Mapbox map with performance monitoring
  const initializeMap = useCallback(async () => {
    if (!mapContainer.current || isInitialized.current) return;

    try {
      console.log('🗺️ Initializing Enhanced Map...');
      setLoading(true);
      setError(null);
      startRenderMeasurement();

      // Get Mapbox token
      const { data: { mapbox_public_token } } = await supabase.functions.invoke('get-mapbox-token');
      
      if (!mapbox_public_token) {
        console.error('❌ No Mapbox token available');
        setError('Mapbox token not configured');
        setTokenMissing(true);
        setLoading(false);
        endRenderMeasurement();
        return;
      }

      mapboxgl.accessToken = mapbox_public_token;

      // Create map with performance optimizations
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: getMapStyle(mapStyle),
        center: initialCenter,
        zoom: initialZoom,
        attributionControl: false,
        logoPosition: 'bottom-right',
        // Performance optimizations
        maxTileCacheSize: 100,
        renderWorldCopies: false,
        preserveDrawingBuffer: false,
        antialias: false // Disable for better performance on mobile
      });

      // Add controls with optimized positioning
      map.current.addControl(
        new mapboxgl.NavigationControl({
          visualizePitch: true,
          showZoom: true,
          showCompass: true
        }),
        'top-right'
      );

      map.current.addControl(
        new mapboxgl.GeolocateControl({
          positionOptions: {
            enableHighAccuracy: true
          },
          trackUserLocation: false,
          showUserHeading: true
        }),
        'bottom-right'
      );

      // Performance-optimized event handlers
      map.current.on('load', () => {
        console.log('🎯 Enhanced Map loaded successfully');
        setLoading(false);
        endRenderMeasurement();
        updateViewportData();
      });

      // Debounced move handlers for better performance
      let moveTimeout: NodeJS.Timeout;
      map.current.on('moveend', () => {
        clearTimeout(moveTimeout);
        moveTimeout = setTimeout(updateViewportData, 150);
      });

      map.current.on('zoomend', () => {
        clearTimeout(moveTimeout);
        moveTimeout = setTimeout(updateViewportData, 100);
      });

      map.current.on('error', (e) => {
        console.error('❌ Map error:', e);
        setError(`Map error: ${e.error?.message || 'Unknown error'}`);
        endRenderMeasurement();
      });

      isInitialized.current = true;

    } catch (error) {
      console.error('❌ Enhanced Map initialization failed:', error);
      setError(`Failed to initialize map: ${error}`);
      setLoading(false);
      endRenderMeasurement();
    }
  }, [getMapStyle, mapStyle, initialCenter, initialZoom, startRenderMeasurement, endRenderMeasurement]);

  // Optimized data fetching with performance monitoring
  const updateViewportData = useCallback(async () => {
    if (!map.current) return;

    startRenderMeasurement();
    const bounds = map.current.getBounds();
    const zoom = map.current.getZoom();
    
    setCurrentBounds({
      north: bounds.getNorth(),
      south: bounds.getSouth(),
      east: bounds.getEast(),
      west: bounds.getWest()
    });
    setCurrentZoom(zoom);

    try {
      // Fetching data silently

      const viewportBounds: ViewportBounds = {
        north: bounds.getNorth(),
        south: bounds.getSouth(),
        east: bounds.getEast(),
        west: bounds.getWest()
      };

      const data = await geoService.getFactsInViewport(viewportBounds, zoom, {
        includeCount: true
      });

      console.log(`📊 Received: ${data.facts?.length || 0} facts, ${data.clusters?.length || 0} clusters`);

      if (process.env.NODE_ENV === 'development') {
        setDebugInfo({
          zoom: zoom.toFixed(1),
          factsCount: data.facts?.length || 0,
          clustersCount: data.clusters?.length || 0,
          totalCount: data.totalCount,
          fps: metrics.fps.toFixed(0),
          renderTime: metrics.renderTime.toFixed(1)
        });
      }

      // Adaptive rendering based on performance
      const shouldUseClusters = zoom < ZOOM_THRESHOLDS.INDIVIDUAL_FACTS || metrics.fps < 45;
      
      if (shouldUseClusters && data.clusters && data.clusters.length > 0) {
        renderClusters(data.clusters);
      } else if (data.facts && data.facts.length > 0) {
        const maxFacts = metrics.fps < 30 ? 100 : metrics.fps < 45 ? 200 : 500;
        const factsToRender = data.facts.slice(0, maxFacts);
        renderIndividualFacts(factsToRender);
      }

      endRenderMeasurement();
    } catch (error) {
      console.error('❌ Error updating viewport data:', error);
      setError(`Failed to load data: ${error}`);
      endRenderMeasurement();
    }
  }, [startRenderMeasurement, endRenderMeasurement, metrics.fps, metrics.renderTime]);

  // Optimized fact rendering
  const renderIndividualFacts = useCallback((facts: FactMarker[]) => {
    if (!map.current || !facts.length) return;

    // Clear existing sources
    ['clusters', 'facts'].forEach(sourceId => {
      try {
        if (map.current!.getSource(sourceId)) {
          const style = map.current!.getStyle();
          if (style?.layers) {
            style.layers.forEach(layer => {
              if (layer.source === sourceId && map.current!.getLayer(layer.id)) {
                map.current!.removeLayer(layer.id);
              }
            });
          }
          map.current!.removeSource(sourceId);
        }
      } catch (e) {
        console.warn(`Warning removing source ${sourceId}:`, e);
      }
    });

    // Add optimized fact source
    const geojsonData: GeoJSON.FeatureCollection = {
      type: 'FeatureCollection',
      features: facts.map(fact => ({
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [fact.longitude, fact.latitude]
        },
        properties: {
          id: fact.id,
          title: fact.title,
          category: fact.category,
          verified: fact.verified,
          voteScore: fact.voteScore
        }
      }))
    };

    map.current.addSource('facts', {
      type: 'geojson',
      data: geojsonData,
      cluster: false
    });

    // Optimized styling
    map.current.addLayer({
      id: 'individual-facts',
      type: 'circle',
      source: 'facts',
      paint: {
        'circle-radius': [
          'interpolate', ['linear'], ['zoom'],
          10, ['case', ['get', 'verified'], 4, 3],
          15, ['case', ['get', 'verified'], 8, 6],
          20, ['case', ['get', 'verified'], 12, 9]
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

    // Optimized click handlers
    map.current.on('click', 'individual-facts', (e) => {
      if (e.features?.[0]) {
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

  // Optimized cluster rendering
  const renderClusters = useCallback((clusters: GeoCluster[]) => {
    if (!map.current || !clusters.length) return;

    // Clear existing sources efficiently
    ['clusters', 'facts', 'individual-facts'].forEach(sourceId => {
      try {
        if (map.current!.getSource(sourceId)) {
          const style = map.current!.getStyle();
          if (style?.layers) {
            style.layers.forEach(layer => {
              if ((layer.source === sourceId || layer.id === sourceId) && map.current!.getLayer(layer.id)) {
                map.current!.removeLayer(layer.id);
              }
            });
          }
          map.current!.removeSource(sourceId);
        }
      } catch (e) {
        console.warn(`Warning removing source ${sourceId}:`, e);
      }
    });

    // Add cluster source
    const clusterData: GeoJSON.FeatureCollection = {
      type: 'FeatureCollection',
      features: clusters.map(cluster => ({
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: cluster.center
        },
        properties: {
          count: cluster.count,
          bounds: cluster.bounds
        }
      }))
    };

    map.current.addSource('clusters', {
      type: 'geojson',
      data: clusterData
    });

    // Performance-optimized cluster styling
    map.current.addLayer({
      id: 'clusters',
      type: 'circle',
      source: 'clusters',
      paint: {
        'circle-color': [
          'step', ['get', 'count'],
          '#3B82F6', 10,
          '#8B5CF6', 25,
          '#EF4444', 50,
          '#DC2626'
        ],
        'circle-radius': [
          'step', ['get', 'count'],
          15, 10,
          20, 25,
          25, 50,
          30
        ],
        'circle-opacity': 0.8,
        'circle-stroke-width': 2,
        'circle-stroke-color': '#ffffff'
      }
    });

    // Cluster labels
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

    // Optimized cluster click handler
    map.current.on('click', 'clusters', (e) => {
      if (e.features?.[0] && map.current) {
        const bounds = e.features[0].properties?.bounds;
        if (bounds) {
          map.current.fitBounds([
            [bounds.west, bounds.south],
            [bounds.east, bounds.north]
          ], { padding: 50 });
        }
      }
    });

    map.current.on('mouseenter', 'clusters', () => {
      map.current!.getCanvas().style.cursor = 'pointer';
    });

    map.current.on('mouseleave', 'clusters', () => {
      map.current!.getCanvas().style.cursor = '';
    });

  }, []);

  // Handle manual token input
  const handleManualToken = useCallback(() => {
    if (manualToken.trim()) {
      mapboxgl.accessToken = manualToken.trim();
      setTokenMissing(false);
      setManualToken('');
      initializeMap();
    }
  }, [manualToken, initializeMap]);

  // Share location function
  const shareLocation = useCallback(async () => {
    if (!map.current) return;

    const center = map.current.getCenter();
    const zoom = map.current.getZoom();
    const url = `${window.location.origin}/map?lat=${center.lat.toFixed(6)}&lng=${center.lng.toFixed(6)}&zoom=${zoom.toFixed(1)}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Check out this location',
          url: url
        });
      } catch (error) {
        console.log('Share cancelled or failed');
      }
    } else {
      await navigator.clipboard.writeText(url);
      toast({
        title: "Location shared",
        description: "Location URL copied to clipboard",
      });
    }
  }, []);

  // Effects
  useEffect(() => {
    if (isVisible && !isInitialized.current) {
      initializeMap();
    }
  }, [isVisible, initializeMap]);

  // Style change handler
  useEffect(() => {
    if (map.current && isInitialized.current) {
      map.current.setStyle(getMapStyle(mapStyle));
    }
  }, [mapStyle, getMapStyle]);

  // Loading messages
  const loadingMessage = useMemo(() => {
    const messages = [
      "Initializing map...",
      "Loading geographic data...",
      "Optimizing performance...",
      "Almost ready..."
    ];
    return messages[Math.floor(Date.now() / 2000) % messages.length];
  }, [loading]);

  return (
    <div className={`h-full w-full relative ${className}`}>
      <div ref={mapContainer} className="h-full w-full" />
      
      {/* Performance Monitor */}
      <PerformanceMonitor 
        enabled={process.env.NODE_ENV === 'development'} 
        showDetailed={false}
      />
      
      {/* Loading Overlay */}
      {loading && (
        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-10">
          <Card className="p-6 max-w-sm">
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="animate-spin rounded-full h-6 w-6 border-2 border-primary border-t-transparent" />
                <span className="font-medium">Loading Enhanced Map</span>
              </div>
              <div className="text-sm text-muted-foreground">
                {loadingMessage}
              </div>
              {metrics.fps > 0 && (
                <div className="text-xs text-muted-foreground">
                  Performance: {metrics.fps.toFixed(0)} FPS
                </div>
              )}
            </div>
          </Card>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-10">
          <Card className="p-6 max-w-md">
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <AlertCircle className="h-6 w-6 text-destructive" />
                <span className="font-medium">Map Error</span>
              </div>
              <p className="text-sm text-muted-foreground">{error}</p>
              <Button onClick={() => window.location.reload()} variant="outline" size="sm">
                Reload Page
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Token Input Fallback */}
      {tokenMissing && !loading && (
        <div className="absolute inset-0 bg-background/90 backdrop-blur-sm flex items-center justify-center z-20">
          <Card className="p-6 max-w-md">
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <Key className="h-6 w-6 text-warning" />
                <span className="font-medium">Mapbox Token Required</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Please enter your Mapbox public token to continue.
              </p>
              <div className="space-y-2">
                <Input
                  type="password"
                  placeholder="Mapbox Public Token"
                  value={manualToken}
                  onChange={(e) => setManualToken(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleManualToken()}
                />
                <Button onClick={handleManualToken} disabled={!manualToken.trim()}>
                  Continue
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Map Style Controls */}
      {!loading && !error && !tokenMissing && (
        <div className="absolute top-4 right-4 z-10">
          <div className="flex space-x-2">
            {(['light', 'dark', 'satellite'] as const).map((style) => (
              <Button
                key={style}
                variant={mapStyle === style ? "default" : "outline"}
                size="sm"
                onClick={() => setMapStyle(style)}
                className="capitalize"
              >
                {style === 'satellite' ? <Satellite className="h-4 w-4" /> : style}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Share Button */}
      {!loading && !error && !tokenMissing && (
        <div className="absolute bottom-4 right-4 z-10">
          <Button onClick={shareLocation} variant="outline" size="sm">
            <Share className="h-4 w-4 mr-2" />
            Share
          </Button>
        </div>
      )}

      {/* Debug Info (Development) */}
      {process.env.NODE_ENV === 'development' && debugInfo && !loading && (
        <div className="absolute bottom-4 left-4 z-10">
          <Card className="p-3">
            <div className="space-y-1 text-xs">
              <div>Zoom: {debugInfo.zoom}</div>
              <div>Facts: {debugInfo.factsCount}</div>
              <div>Clusters: {debugInfo.clustersCount}</div>
              <div>Total: {debugInfo.totalCount}</div>
              <div>FPS: {debugInfo.fps}</div>
              <div>Render: {debugInfo.renderTime}ms</div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};