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
  LARGE_CLUSTERS: 8,    // Large regional clusters
  MEDIUM_CLUSTERS: 10,  // Medium city clusters  
  SMALL_CLUSTERS: 12,   // Small neighborhood clusters
  MIXED_MODE: 14,       // Mix of small clusters and individual facts
  INDIVIDUAL_ONLY: 16   // Individual facts only
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
  const isUpdatingRef = useRef(false);
  
  const [loadingState, setLoadingState] = useState<'token' | 'map' | 'ready' | 'error'>('token');
  const [errorState, setErrorState] = useState<string | null>(null);
  const [currentBounds, setCurrentBounds] = useState<ViewportBounds | null>(null);
  const [currentZoom, setCurrentZoom] = useState(initialZoom);
  const [mapStyle, setMapStyle] = useState<keyof typeof mapStyles>('light');
  const [tokenMissing, setTokenMissing] = useState(false);
  const [debugInfo, setDebugInfo] = useState({ clusters: 0, facts: 0, lastUpdate: '' });

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

      // Try to get user's location first, fallback to global view
      let startCenter: [number, number] = [0, 20]; // Global view default
      let startZoom = 1.5; // Global zoom level

      // Override with provided initial values if any
      if (initialCenter && initialZoom) {
        startCenter = initialCenter;
        startZoom = initialZoom;
      }

      console.log('🗺️ Initializing map at center:', startCenter, 'zoom:', startZoom);

      // Initialize with default style to avoid circular dependency
      const mapInstance = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/light-v11', // Fixed default style
        center: startCenter,
        zoom: startZoom,
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
        console.log('✅ Map loaded successfully at zoom:', mapInstance.getZoom());
        setLoadingState('ready');
        setErrorState(null);
        
        // Apply the correct style after successful load
        if (mapStyle !== 'light') {
          mapInstance.setStyle(mapStyles[mapStyle]);
        }
        
        // Clear cache to ensure fresh data
        geoService.clearCache();
        
        // Try to get user's location and center map there
        if (!initialCenter) {
          navigator.geolocation?.getCurrentPosition(
            (position) => {
              const userLocation: [number, number] = [
                position.coords.longitude,
                position.coords.latitude
              ];
              console.log('📍 Got user location, centering map:', userLocation);
              mapInstance.setCenter(userLocation);
              mapInstance.setZoom(10); // City level zoom when we have user location
              // Trigger data update for user's location
              setTimeout(() => updateViewportDataWithDeps(), 200);
            },
            (error) => {
              console.log('📍 Geolocation failed:', error.message);
              // Stay with global view and load global data
              setTimeout(() => updateViewportDataWithDeps(), 100);
            },
            { timeout: 5000, enableHighAccuracy: false }
          );
        } else {
          // Initial data load with delay to ensure map is ready
          console.log('📊 Triggering initial data update after map load');
          setTimeout(() => {
            updateViewportDataWithDeps();
          }, 100);
        }
      });

      // Throttled viewport updates for performance with better debouncing
      const handleViewportChange = () => {
        if (updateTimeoutRef.current) {
          clearTimeout(updateTimeoutRef.current);
        }
        
        updateTimeoutRef.current = setTimeout(() => {
          console.log('🚀 Map moveend/zoomend event triggered');
          updateViewportDataWithDeps();
          updateTimeoutRef.current = undefined;
        }, 300);
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

  // Efficient viewport data updates with loading state protection
  const updateViewportData = useCallback(async () => {
    if (!map.current || loadingState !== 'ready') {
      console.log('⚠️ Cannot update viewport: map not ready or loading');
      return;
    }

    // Prevent concurrent updates using a flag instead of timeout check
    if (isUpdatingRef.current) {
      console.log('⚠️ Update already in progress, skipping');
      return;
    }
    isUpdatingRef.current = true;

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

      console.log(`📊 Retrieved ${facts.length} facts and ${clusters.length} clusters for zoom ${zoom}`);

      // Progressive rendering based on zoom level and data
      if (facts.length > 0) {
        console.log(`📍 Rendering ${facts.length} individual facts at zoom ${zoom.toFixed(1)}`);
        renderIndividualFacts(facts);
      }
      
      if (clusters.length > 0) {
        console.log(`🎯 Rendering ${clusters.length} clusters at zoom ${zoom.toFixed(1)}`);
        renderClusters(clusters);
      }

    } catch (error) {
      console.error('Error updating viewport data:', error);
    } finally {
      isUpdatingRef.current = false;
    }
  }, [loadingState]); // Keep simple dependencies for now

  // Render individual facts for high zoom levels
  const renderIndividualFacts = useCallback((facts: FactMarker[]) => {
    if (!map.current) return;

    console.log(`🔍 renderIndividualFacts called with ${facts.length} facts`);

    // Clear existing cluster layers first
    ['clusters', 'cluster-count'].forEach(layerId => {
      try {
        if (map.current!.getLayer(layerId)) {
          map.current!.removeLayer(layerId);
          console.log(`✅ Removed layer: ${layerId}`);
        }
      } catch (error) {
        console.warn(`Failed to remove layer ${layerId}:`, error);
      }
    });

    // Remove sources with better error handling
    try {
      if (map.current.getSource('clusters')) {
        map.current.removeSource('clusters');
        console.log('✅ Removed clusters source');
      }
    } catch (error) {
      console.warn('Failed to remove clusters source:', error);
    }

    if (facts.length === 0) {
      console.log('⚠️ No facts to render');
      return;
    }

    // Remove existing facts source/layer if it exists
    try {
      if (map.current.getLayer('individual-facts')) {
        map.current.removeLayer('individual-facts');
        console.log('✅ Removed individual-facts layer');
      }
      if (map.current.getSource('facts')) {
        map.current.removeSource('facts');
        console.log('✅ Removed facts source');
      }
    } catch (error) {
      console.warn('Failed to remove facts source/layer:', error);
    }

    // Add facts as individual points
    console.log(`📍 Adding ${facts.length} individual facts to map`);
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

    console.log(`🎯 renderClusters called with ${clusters.length} clusters:`, clusters);

    // Clear individual fact layers first
    if (map.current.getLayer('individual-facts')) {
      map.current.removeLayer('individual-facts');
    }

    // Remove existing sources to prevent conflicts - with proper error handling
    ['clusters', 'facts'].forEach(sourceId => {
      try {
        if (map.current!.getSource(sourceId)) {
          // Remove layers using this source first
          const style = map.current!.getStyle();
          if (style && style.layers) {
            style.layers.forEach(layer => {
              if (layer.source === sourceId && map.current!.getLayer(layer.id)) {
                map.current!.removeLayer(layer.id);
              }
            });
          }
          map.current!.removeSource(sourceId);
        }
      } catch (error) {
        console.warn(`Failed to remove source ${sourceId}:`, error);
      }
    });

    if (clusters.length === 0) {
      console.log('⚠️ No clusters to render, exiting early');
      return;
    }

    // Add clusters as source
    const geoJsonData = {
      type: 'FeatureCollection' as const,
      features: clusters.map(cluster => ({
        type: 'Feature' as const,
        properties: {
          id: cluster.id,
          count: cluster.count,
          verified_count: cluster.verified_count,
          total_votes: cluster.total_votes
        },
        geometry: {
          type: 'Point' as const,
          coordinates: cluster.center
        }
      }))
    };

    console.log('📍 Creating cluster GeoJSON:', geoJsonData);

    map.current.addSource('clusters', {
      type: 'geojson',
      data: geoJsonData
    });

    // Style clusters with simpler, more visible styling
    map.current.addLayer({
      id: 'clusters',
      type: 'circle',
      source: 'clusters',
      paint: {
        'circle-radius': [
          'interpolate',
          ['linear'],
          ['get', 'count'],
          1, 20,
          5, 30,
          10, 40,
          25, 50
        ],
        'circle-color': '#3b82f6',
        'circle-stroke-width': 3,
        'circle-stroke-color': '#ffffff',
        'circle-opacity': 0.9
      }
    });

    // Add cluster labels with fallback fonts
    map.current.addLayer({
      id: 'cluster-count',
      type: 'symbol',
      source: 'clusters',
      layout: {
        'text-field': ['get', 'count'],
        'text-font': ['Open Sans Semibold', 'Arial Unicode MS Bold'],
        'text-size': 16,
        'text-allow-overlap': true,
        'text-ignore-placement': true
      },
      paint: {
        'text-color': '#ffffff',
        'text-halo-color': '#000000',
        'text-halo-width': 2
      }
    });
    
    console.log(`✅ Successfully added ${clusters.length} cluster(s) to map`);
    
    // Debug: Log cluster positions for troubleshooting
    clusters.forEach(cluster => {
      console.log(`📍 Cluster at [${cluster.center[0]}, ${cluster.center[1]}] with ${cluster.count} facts`);
    });

    // Add click handlers for clusters
    map.current.on('click', 'clusters', (e) => {
      if (e.features && e.features[0] && map.current) {
        const feature = e.features[0];
        const coordinates = (feature.geometry as any).coordinates.slice();
        
        // Zoom into cluster
        map.current.flyTo({
          center: coordinates,
          zoom: Math.min(map.current.getZoom() + 2, ZOOM_THRESHOLDS.INDIVIDUAL_ONLY)
        });
      }
    });

  }, []);

  // Re-create updateViewportData with proper dependencies after render functions are defined
  const updateViewportDataWithDeps = useCallback(async () => {
    if (!map.current || loadingState !== 'ready') {
      console.log('⚠️ Cannot update viewport: map not ready or loading');
      return;
    }

    if (isUpdatingRef.current) {
      console.log('⚠️ Update already in progress, skipping');
      return;
    }
    isUpdatingRef.current = true;

    try {
      const bounds = map.current.getBounds();
      const zoom = map.current.getZoom();
      
      const viewportBounds: ViewportBounds = {
        north: bounds.getNorth(),
        south: bounds.getSouth(),
        east: bounds.getEast(),
        west: bounds.getWest()
      };

      console.log(`🗺️ Map: Updating viewport data at zoom ${zoom}`, {
        bounds: {
          north: viewportBounds.north.toFixed(4),
          south: viewportBounds.south.toFixed(4),
          east: viewportBounds.east.toFixed(4),
          west: viewportBounds.west.toFixed(4)
        },
        center: [
          ((viewportBounds.east + viewportBounds.west) / 2).toFixed(4),
          ((viewportBounds.north + viewportBounds.south) / 2).toFixed(4)
        ]
      });

      setCurrentBounds(viewportBounds);
      setCurrentZoom(zoom);

      const { facts, clusters } = await geoService.getFactsInViewport(
        viewportBounds, 
        zoom
      );

      console.log(`📊 Map: Received ${facts.length} facts and ${clusters.length} clusters`);
      
      setDebugInfo({
        clusters: clusters.length,
        facts: facts.length,
        lastUpdate: new Date().toLocaleTimeString()
      });

      // Progressive rendering based on zoom level and data  
      const isInMixedMode = zoom >= ZOOM_THRESHOLDS.MIXED_MODE && zoom < ZOOM_THRESHOLDS.INDIVIDUAL_ONLY;
      const renderMode = zoom >= ZOOM_THRESHOLDS.INDIVIDUAL_ONLY ? 'individual' : 
                        isInMixedMode ? 'mixed' : 'clusters';
      
      console.log(`🗺️ Rendering mode: ${renderMode} at zoom ${zoom.toFixed(1)}`);
      
      // Progressive rendering
      if (facts.length > 0) {
        console.log(`👤 Rendering ${facts.length} individual facts`);
        renderIndividualFacts(facts);
      } else {
        console.log(`🔵 Rendering ${clusters.length} clusters`);
        renderClusters(clusters);
      }

      if (facts.length === 0 && clusters.length === 0) {
        console.log('⚠️ No data to render - no facts or clusters available');
      }

    } catch (error) {
      console.error('Error updating viewport data:', error);
    } finally {
      isUpdatingRef.current = false;
    }
  }, [loadingState, renderIndividualFacts, renderClusters]);

  // Initialize map when component mounts or becomes visible
  useEffect(() => {
    if (isVisible && !hasInitializedRef.current) {
      // Clear cache to ensure fresh clustering data with improved function
      geoService.clearCache();
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
            updateViewportDataWithDeps();
          }
        }, 100);
    }
  }, [isVisible, initializeMap, updateViewportDataWithDeps]);

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
        updateTimeoutRef.current = undefined;
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
          
          {/* Share Location Button */}
          <button
            onClick={shareLocation}
            className="w-11 h-11 rounded-xl border-2 flex items-center justify-center text-base font-medium transition-all shadow-lg backdrop-blur-sm bg-background/80 text-foreground border-border hover:bg-accent hover:border-accent-foreground hover:shadow-lg"
            title="Share my location"
            aria-label="Share my current location"
          >
            📍
          </button>
        </div>
      )}

      {/* Development info */}
      {process.env.NODE_ENV === 'development' && currentZoom && (
        <div className="absolute top-4 left-4 bg-black/80 text-white px-3 py-2 rounded text-sm font-mono space-y-1 z-10">
          <div>Zoom: {currentZoom.toFixed(1)} | Mode: {currentZoom >= ZOOM_THRESHOLDS.INDIVIDUAL_ONLY ? 'Individual' : 'Clustered'}</div>
          <div>Facts: {debugInfo.facts} | Clusters: {debugInfo.clusters}</div>
          <div>Updated: {debugInfo.lastUpdate}</div>
        </div>
      )}
    </div>
  );

  // Share location function
  function shareLocation() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          const locationUrl = `https://maps.google.com/maps?q=${latitude},${longitude}`;
          const shareData = {
            title: 'My Location',
            text: `Check out where I am: ${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
            url: locationUrl,
          };

          try {
            if (navigator.share) {
              await navigator.share(shareData);
            } else {
              await navigator.clipboard.writeText(locationUrl);
              console.log('Location copied to clipboard');
            }
          } catch (error) {
            console.error('Error sharing location:', error);
            try {
              await navigator.clipboard.writeText(locationUrl);
              console.log('Location copied to clipboard');
            } catch (clipboardError) {
              console.error('Failed to copy location');
            }
          }
        },
        (error) => {
          console.error('Geolocation error:', error);
          alert('Please enable location access to share your location.');
        }
      );
    } else {
      alert('Your browser doesn\'t support location sharing.');
    }
  }
};