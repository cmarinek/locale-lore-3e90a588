/**
 * Unified Map Component - One map to rule them all
 * Combines clustering, scalable loading, advanced features, and optimizations
 */

import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import mapboxgl from 'mapbox-gl';
import Supercluster from 'supercluster';
import { throttle, debounce } from 'lodash';
import 'mapbox-gl/dist/mapbox-gl.css';

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Layers, ZoomIn, AlertTriangle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';

import { EnhancedMapControls } from './EnhancedMapControls';
import { ClusteringControls } from './ClusteringControls';
import { MapLoadingState } from './MapLoadingState';
import { MapLoadingSkeleton } from './MapLoadingSkeleton';
import { TimelineSlider } from './TimelineSlider';
import { CollaborativeMarkers } from './CollaborativeMarkers';
import { DrawingTools } from './DrawingTools';
import { HistoricalAnimation } from './HistoricalAnimation';
import { useFavoriteCities } from '@/hooks/useFavoriteCities';
import { usePerformanceMonitor } from '@/hooks/usePerformanceMonitor';
import { mapboxService } from '@/services/mapboxService';
import { scalableFactService } from '@/services/scalableFactService';
import { useDiscoveryStore } from '@/stores/discoveryStore';
import { useSearchStore } from '@/stores/searchStore';
import { useMapStore } from '@/stores/mapStore';
import { MapTokenMissing } from './MapTokenMissing';

// Types
interface Fact {
  id: string;
  title: string;
  latitude: number;
  longitude: number;
  category?: string;
  status?: string;
  vote_count_up?: number;
  vote_count_down?: number;
  profiles?: { username?: string };
  categories?: { slug?: string };
}

interface UnifiedMapProps {
  // Data source options
  facts?: Fact[];
  useScalableLoading?: boolean;
  
  // Map configuration
  center?: [number, number];
  zoom?: number;
  maxZoom?: number;
  style?: 'light' | 'dark' | 'satellite';
  
  // Clustering options
  enableClustering?: boolean;
  clusterRadius?: number;
  
  // Performance options
  enableViewportLoading?: boolean;
  enablePerformanceMetrics?: boolean;
  
  // Feature options
  showHeatmap?: boolean;
  showBuiltInSearch?: boolean;
  
  // Event handlers
  onFactClick?: (fact: Fact) => void;
  onBoundsChange?: (bounds: mapboxgl.LngLatBounds) => void;
  
  // UI options
  className?: string;
  isVisible?: boolean;
}

export const UnifiedMap: React.FC<UnifiedMapProps> = ({
  facts: externalFacts,
  useScalableLoading = true,
  center = [0, 20],
  zoom = 2,
  maxZoom = 16,
  style = 'light',
  enableClustering = true,
  clusterRadius = 50,
  enableViewportLoading = true,
  enablePerformanceMetrics = true,
  showHeatmap = false,
  showBuiltInSearch = true,
  onFactClick,
  onBoundsChange,
  className,
  isVisible = true
}) => {
  // Refs
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const supercluster = useRef<Supercluster | null>(null);
  const markersRef = useRef<Map<string, mapboxgl.Marker>>(new Map());
  const isInitialized = useRef(false);
  const updateTimeout = useRef<NodeJS.Timeout | null>(null);
  const isUpdating = useRef(false);

  // Hooks
  const { startRenderMeasurement, endRenderMeasurement } = usePerformanceMonitor(enablePerformanceMetrics);
  const { favoriteCities } = useFavoriteCities();
  const { selectedFact, setSelectedFact } = useDiscoveryStore();
  const { filters } = useSearchStore();
  const { selectedMarkerId, setSelectedMarkerId } = useMapStore();

  // State
  const [mapboxToken, setMapboxToken] = useState<string>('');
  const [tokenStatus, setTokenStatus] = useState<'idle' | 'loading' | 'ready' | 'missing' | 'error'>('idle');
  const [tokenError, setTokenError] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [currentZoom, setCurrentZoom] = useState(zoom);
  const [mapStyle, setMapStyle] = useState(style);
  const [facts, setFacts] = useState<Fact[]>([]);
  const [viewportFacts, setViewportFacts] = useState<Fact[]>([]);
  const [loadingViewport, setLoadingViewport] = useState(false);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [clusterRadiusState, setClusterRadiusState] = useState(clusterRadius);
  const [animationSpeed, setAnimationSpeed] = useState(1000);
  const [clusteringEnabled, setClusteringEnabled] = useState(enableClustering);
  const [timelineRange, setTimelineRange] = useState<{ start: Date; end: Date } | null>(null);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [isHistoricalAnimationPlaying, setIsHistoricalAnimationPlaying] = useState(false);

  // Performance metrics
  const [metrics, setMetrics] = useState({
    totalFacts: 0,
    visibleClusters: 0,
    renderTime: 0,
    loadTime: 0
  });

  const isMountedRef = useRef(true);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const fetchMapboxToken = useCallback(async () => {
    console.log('🗺️ Fetching Mapbox token...');
    setTokenStatus('loading');
    setTokenError(null);

    try {
      const token = await mapboxService.getToken();

      if (!isMountedRef.current) {
        console.log('⚠️ Component unmounted, aborting token fetch');
        return;
      }

      console.log('✅ Token received:', token ? `${token.substring(0, 10)}...` : 'null');

      if (token && token.length > 0) {
        setMapboxToken(token);
        setTokenStatus('ready');
        console.log('✅ Mapbox token ready');
      } else {
        setMapboxToken('');
        setTokenStatus('missing');
        setTokenError('A Mapbox public token is required to display the interactive map.');
        console.error('❌ No Mapbox token available');
      }
    } catch (error) {
      console.error('❌ Failed to load Mapbox token:', error);

      if (!isMountedRef.current) {
        return;
      }

      setMapboxToken('');
      setTokenStatus('error');
      setTokenError(error instanceof Error ? error.message : 'Unknown error while fetching Mapbox token.');
    }
  }, []);

  // Load Mapbox token
  useEffect(() => {
    fetchMapboxToken();
  }, [fetchMapboxToken]);

  const handleRetryTokenFetch = useCallback(() => {
    mapboxService.clearToken();
    fetchMapboxToken();
  }, [fetchMapboxToken]);

  // Get map style URL
  const getMapStyleUrl = useCallback((styleType: string) => {
    const styles = {
      light: 'mapbox://styles/mapbox/light-v11',
      dark: 'mapbox://styles/mapbox/dark-v11',
      satellite: 'mapbox://styles/mapbox/satellite-streets-v12'
    };
    return styles[styleType as keyof typeof styles] || styles.light;
  }, []);

  // Process facts data - use external facts or load from viewport
  const processedFacts = useMemo(() => {
    if (externalFacts) {
      return externalFacts;
    }
    return useScalableLoading ? viewportFacts : facts;
  }, [externalFacts, useScalableLoading, viewportFacts, facts]);

  // Initialize supercluster
  const initializeSupercluster = useCallback(() => {
    if (!enableClustering) return null;

    const cluster = new Supercluster({
      radius: clusterRadius,
      maxZoom: maxZoom - 1,
      minZoom: 0,
      map: (props) => ({ sum: props.vote_count_up || 0 }),
      reduce: (accumulated, props) => { accumulated.sum += props.sum; }
    });

    if (processedFacts.length > 0) {
      const geoJsonPoints = processedFacts.map(fact => ({
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
  }, [processedFacts, enableClustering, clusterRadius, maxZoom]);

  // Throttled viewport loading
  const loadViewportFacts = useCallback(
    throttle(async (bounds: mapboxgl.LngLatBounds, zoomLevel: number) => {
      if (!enableViewportLoading || !useScalableLoading) return;
      
      setLoadingViewport(true);
      const startTime = performance.now();

      try {
        const boundsObj = {
          north: bounds.getNorth(),
          south: bounds.getSouth(),
          east: bounds.getEast(),
          west: bounds.getWest()
        };

        const query = {
          bounds: boundsObj,
          zoom: zoomLevel,
          category: filters.category,
          status: 'verified' as const
        };

        const newFacts = await scalableFactService.loadFactsForViewport(query);
        setViewportFacts(newFacts);
        
        const loadTime = performance.now() - startTime;
        setMetrics(prev => ({
          ...prev,
          totalFacts: newFacts.length,
          loadTime: Math.round(loadTime)
        }));

        onBoundsChange?.(bounds);
      } catch (error) {
        console.error('Error loading viewport facts:', error);
      } finally {
        setLoadingViewport(false);
      }
    }, 300),
    [enableViewportLoading, useScalableLoading, filters.category, onBoundsChange]
  );

  // Create marker elements
  const createMarkerElement = useCallback((fact: Fact) => {
    const el = document.createElement('div');
    el.className = 'fact-marker';
    
    const isVerified = fact.status === 'verified';
    const category = fact.categories?.slug || fact.category || 'general';
    
    // Category colors
    const categoryColors = {
      history: 'hsl(var(--primary))',
      culture: 'hsl(var(--accent))',
      nature: 'hsl(var(--success))',
      mystery: 'hsl(var(--destructive))',
      legend: 'hsl(var(--warning))',
      default: 'hsl(var(--muted-foreground))'
    };

    const color = categoryColors[category as keyof typeof categoryColors] || categoryColors.default;
    
    el.style.cssText = `
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: linear-gradient(135deg, ${color} 0%, ${color}/0.8 100%);
      border: 3px solid rgba(255,255,255,0.9);
      cursor: pointer;
      box-shadow: 
        0 8px 32px rgba(0,0,0,0.12),
        0 2px 8px rgba(0,0,0,0.08),
        inset 0 1px 0 rgba(255,255,255,0.3);
      backdrop-filter: blur(8px);
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 10;
    `;
    
    // Category icon
    const categoryIcons = {
      history: '🏛️',
      culture: '🎭',
      nature: '🌿',
      mystery: '🔮',
      legend: '📜',
      default: '📍'
    };
    
    const icon = document.createElement('div');
    icon.textContent = categoryIcons[category as keyof typeof categoryIcons] || categoryIcons.default;
    icon.style.cssText = `
      font-size: 18px;
      filter: drop-shadow(0 1px 2px rgba(0,0,0,0.3));
    `;
    el.appendChild(icon);
    
    // Verified badge
    if (isVerified) {
      const badge = document.createElement('div');
      badge.textContent = '✓';
      badge.style.cssText = `
        position: absolute;
        top: -2px;
        right: -2px;
        width: 16px;
        height: 16px;
        background: hsl(var(--success));
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 10px;
        color: white;
        font-weight: bold;
        box-shadow: 0 2px 4px rgba(0,0,0,0.2);
      `;
      el.appendChild(badge);
    }
    
    // Event handlers
    el.addEventListener('click', () => {
      if (onFactClick) {
        el.style.transform = 'scale(0.95)';
        setTimeout(() => el.style.transform = 'scale(1)', 150);
        onFactClick(fact);
      }
    });
    
    el.addEventListener('mouseenter', () => {
      el.style.transform = 'scale(1.1)';
      el.style.zIndex = '20';
    });
    
    el.addEventListener('mouseleave', () => {
      el.style.transform = 'scale(1)';
      el.style.zIndex = '10';
    });
    
    return el;
  }, [onFactClick]);

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || !mapboxToken || isInitialized.current) {
      console.log('⏭️ Skipping map init:', {
        hasContainer: !!mapContainer.current,
        hasToken: !!mapboxToken,
        isInitialized: isInitialized.current
      });
      return;
    }

    console.log('🗺️ Initializing Mapbox map...');
    mapboxgl.accessToken = mapboxToken;
    isInitialized.current = true;

    try {
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: getMapStyleUrl(mapStyle),
        center: center,
        zoom: zoom,
        projection: { name: 'globe' },
        antialias: true,
        attributionControl: false,
        logoPosition: 'bottom-right'
      });

      map.current.on('load', () => {
        console.log('✅ Map loaded successfully');
        setIsLoaded(true);
        
        if (enableClustering) {
          setupClusteredMap();
        } else {
          setupMarkerMap();
        }

        // Initial viewport load
        if (enableViewportLoading && useScalableLoading) {
          loadViewportFacts(map.current!.getBounds(), zoom);
        }
      });

      map.current.on('error', (e) => {
        console.error('❌ Map error:', e);
      });

      // Event handlers
      const handleMove = debounce(() => {
        if (!map.current) return;
        
        const bounds = map.current.getBounds();
        const currentZoom = map.current.getZoom();
        setCurrentZoom(currentZoom);
        
        if (enableViewportLoading && useScalableLoading) {
          loadViewportFacts(bounds, currentZoom);
        }
      }, 150);

      map.current.on('moveend', handleMove);
      map.current.on('zoomend', handleMove);
    } catch (error) {
      console.error('❌ Failed to initialize map:', error);
      setTokenStatus('error');
      setTokenError(error instanceof Error ? error.message : 'Failed to initialize map');
    }

    return () => {
      console.log('🧹 Cleaning up map');
      map.current?.remove();
      isInitialized.current = false;
    };
  }, [mapboxToken, getMapStyleUrl, mapStyle, center, zoom, enableClustering, enableViewportLoading, useScalableLoading, loadViewportFacts]);

  // Setup clustered map using Mapbox GL native clustering
  const setupClusteredMap = useCallback(() => {
    if (!map.current || !isLoaded) return;

    // Add facts source with clustering
    map.current.addSource('facts', {
      type: 'geojson',
      data: {
        type: 'FeatureCollection',
        features: processedFacts.map(fact => ({
          type: 'Feature',
          properties: {
            id: fact.id,
            title: fact.title,
            category: fact.categories?.slug || fact.category,
            verified: fact.status === 'verified',
            vote_count_up: fact.vote_count_up || 0
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

    // Cluster circles
    map.current.addLayer({
      id: 'clusters',
      type: 'circle',
      source: 'facts',
      filter: ['has', 'point_count'],
      paint: {
        'circle-color': [
          'step',
          ['get', 'point_count'],
          'hsl(var(--primary))',
          50, 'hsl(var(--accent))',
          100, 'hsl(var(--destructive))'
        ],
        'circle-radius': [
          'step',
          ['get', 'point_count'],
          15, 50, 20, 100, 25
        ],
        'circle-stroke-width': 2,
        'circle-stroke-color': '#fff'
      }
    });

    // Cluster count labels
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

    // Individual points
    map.current.addLayer({
      id: 'unclustered-point',
      type: 'circle',
      source: 'facts',
      filter: ['!', ['has', 'point_count']],
      paint: {
        'circle-color': [
          'match',
          ['get', 'category'],
          'history', 'hsl(var(--primary))',
          'nature', 'hsl(var(--success))',
          'culture', 'hsl(var(--accent))',
          'mystery', 'hsl(var(--destructive))',
          'hsl(var(--muted-foreground))'
        ],
        'circle-radius': [
          'interpolate',
          ['linear'],
          ['zoom'],
          8, 4,
          16, 8
        ],
        'circle-stroke-width': [
          'case',
          ['==', ['get', 'id'], selectedMarkerId || ''],
          4, 2
        ],
        'circle-stroke-color': [
          'case',
          ['==', ['get', 'id'], selectedMarkerId || ''],
          '#FFD700', '#fff'
        ]
      }
    });

    // Click handlers
    map.current.on('click', 'clusters', (e) => {
      const features = map.current!.queryRenderedFeatures(e.point, { layers: ['clusters'] });
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

    map.current.on('click', 'unclustered-point', (e) => {
      const feature = e.features?.[0];
      if (feature && feature.properties && onFactClick) {
        const fact = processedFacts.find(f => f.id === feature.properties.id);
        if (fact) onFactClick(fact);
      }
    });
  }, [isLoaded, processedFacts, maxZoom, clusterRadius, selectedMarkerId, onFactClick]);

  // Setup marker-based map
  const setupMarkerMap = useCallback(() => {
    if (!map.current || !isLoaded) return;

    // Clear existing markers
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current.clear();

    // Add markers for each fact
    processedFacts.forEach(fact => {
      const el = createMarkerElement(fact);
      const marker = new mapboxgl.Marker(el)
        .setLngLat([fact.longitude, fact.latitude])
        .addTo(map.current!);
      
      markersRef.current.set(fact.id, marker);
    });
  }, [isLoaded, processedFacts, createMarkerElement]);

  // Update map when facts change
  useEffect(() => {
    if (!map.current || !isLoaded) return;

    if (enableClustering) {
      const source = map.current.getSource('facts') as mapboxgl.GeoJSONSource;
      if (source) {
        source.setData({
          type: 'FeatureCollection',
          features: processedFacts.map(fact => ({
            type: 'Feature',
            properties: {
              id: fact.id,
              title: fact.title,
              category: fact.categories?.slug || fact.category,
              verified: fact.status === 'verified',
              vote_count_up: fact.vote_count_up || 0
            },
            geometry: {
              type: 'Point',
              coordinates: [fact.longitude, fact.latitude]
            }
          }))
        });
      }
    } else {
      setupMarkerMap();
    }

    setMetrics(prev => ({ ...prev, totalFacts: processedFacts.length }));
  }, [processedFacts, isLoaded, enableClustering, setupMarkerMap]);

  // Map control handlers
  const handleZoomIn = useCallback(() => map.current?.zoomIn(), []);
  const handleZoomOut = useCallback(() => map.current?.zoomOut(), []);
  const handleRecenter = useCallback(() => {
    if (map.current) {
      map.current.easeTo({ center, zoom, duration: 1000 });
    }
  }, [center, zoom]);

  const handleMyLocation = useCallback(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userPos: [number, number] = [position.coords.longitude, position.coords.latitude];
          setUserLocation(userPos);
          if (map.current) {
            map.current.easeTo({ center: userPos, zoom: 14, duration: animationSpeed });
            
            // Add a marker for user location
            const el = document.createElement('div');
            el.className = 'user-location-marker';
            el.style.cssText = `
              width: 20px;
              height: 20px;
              border-radius: 50%;
              background: hsl(var(--primary));
              border: 3px solid white;
              box-shadow: 0 0 10px rgba(0,0,0,0.3);
              animation: pulse 2s infinite;
            `;
            
            new mapboxgl.Marker(el)
              .setLngLat(userPos)
              .addTo(map.current);
            
            toast({
              title: "Location found",
              description: "Centered map on your location"
            });
          }
        },
        (error) => {
          console.warn('Location access denied:', error);
          toast({
            title: "Location access denied",
            description: "Please enable location access in your browser settings",
            variant: "destructive"
          });
        }
      );
    } else {
      toast({
        title: "Location not supported",
        description: "Your browser doesn't support geolocation",
        variant: "destructive"
      });
    }
  }, [animationSpeed]);

  const handleStyleChange = useCallback(() => {
    const styles = ['light', 'dark', 'satellite'] as const;
    const currentIndex = styles.indexOf(mapStyle as any);
    const nextIndex = (currentIndex + 1) % styles.length;
    setMapStyle(styles[nextIndex]);
  }, [mapStyle]);

  const handleResetView = useCallback(() => {
    if (map.current) {
      map.current.setBearing(0);
      map.current.setPitch(0);
      map.current.easeTo({ center, zoom, duration: 1000 });
    }
  }, [center, zoom]);

  const handleCityClick = useCallback((city: any) => {
    if (map.current) {
      map.current.easeTo({
        center: [city.longitude, city.latitude],
        zoom: city.zoom || 12,
        duration: 1500
      });
    }
  }, []);

  // Update map style when changed
  useEffect(() => {
    if (map.current && isLoaded) {
      map.current.setStyle(getMapStyleUrl(mapStyle));
      map.current.once('styledata', () => {
        if (enableClustering) {
          setupClusteredMap();
        } else {
          setupMarkerMap();
        }
      });
    }
  }, [mapStyle, isLoaded, getMapStyleUrl, enableClustering, setupClusteredMap, setupMarkerMap]);

  if (!isVisible) return null;

  if (tokenStatus === 'loading' || tokenStatus === 'idle') {
    return (
      <div className={`relative w-full h-full ${className}`}>
        <MapLoadingState message="Preparing interactive map experience..." />
      </div>
    );
  }

  if (tokenStatus === 'missing') {
    return (
      <div className={`relative w-full h-full ${className}`}>
        <MapTokenMissing />
      </div>
    );
  }

  if (tokenStatus === 'error') {
    return (
      <div className={`relative w-full h-full ${className}`}>
        <div className="flex min-h-[320px] w-full items-center justify-center p-6">
          <Card className="max-w-md w-full border-destructive/40 bg-destructive/5">
            <div className="flex flex-col gap-4 p-6 text-destructive">
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-5 w-5" />
                <h3 className="text-lg font-semibold">We couldn't reach Mapbox</h3>
              </div>
              <p className="text-sm text-destructive/80">
                {tokenError || 'The Mapbox API token could not be retrieved. Please check your network connection and try again.'}
              </p>
              <div className="flex flex-wrap gap-2">
                <Button onClick={handleRetryTokenFetch} variant="destructive">
                  Try again
                </Button>
                <Button onClick={() => window.location.reload()} variant="outline">
                  Refresh page
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative w-full h-full ${className}`}>
      <div ref={mapContainer} className="absolute inset-0" />
      
      {/* Performance metrics */}
      {enablePerformanceMetrics && (
        <Card className="absolute top-4 right-4 p-3 bg-background/90 backdrop-blur">
          <div className="text-xs space-y-1">
            <div className="flex items-center gap-2">
              <Layers className="w-3 h-3" />
              <span>{metrics.totalFacts.toLocaleString()} facts</span>
            </div>
            <div className="flex items-center gap-2">
              <ZoomIn className="w-3 h-3" />
              <span>Zoom: {currentZoom.toFixed(1)}</span>
            </div>
            {useScalableLoading && (
              <div className="text-muted-foreground">
                Load: {metrics.loadTime}ms
              </div>
            )}
            {loadingViewport && (
              <Badge variant="secondary" className="text-xs">Loading...</Badge>
            )}
          </div>
        </Card>
      )}

      {/* Enhanced Map Controls */}
      {isLoaded && (
        <EnhancedMapControls
          onZoomIn={handleZoomIn}
          onZoomOut={handleZoomOut}
          onRecenter={handleRecenter}
          onMyLocation={handleMyLocation}
          onStyleChange={handleStyleChange}
          onResetView={handleResetView}
          position="left"
        />
      )}

      {/* Clustering Controls */}
      {isLoaded && enableClustering && (
        <div className="absolute bottom-4 left-4 z-30">
          <ClusteringControls
            clusterRadius={clusterRadiusState}
            onClusterRadiusChange={(value) => {
              setClusterRadiusState(value);
              // Reinitialize supercluster with new radius
              if (map.current && isLoaded) {
                const source = map.current.getSource('facts') as mapboxgl.GeoJSONSource;
                if (source) {
                  map.current.removeLayer('clusters');
                  map.current.removeLayer('cluster-count');
                  map.current.removeLayer('unclustered-point');
                  map.current.removeSource('facts');
                  setTimeout(() => setupClusteredMap(), 100);
                }
              }
            }}
            animationSpeed={animationSpeed}
            onAnimationSpeedChange={setAnimationSpeed}
            enableClustering={clusteringEnabled}
            onClusteringToggle={(enabled) => {
              setClusteringEnabled(enabled);
              if (map.current && isLoaded) {
                if (enabled) {
                  setupClusteredMap();
                } else {
                  // Remove clustering layers
                  if (map.current.getLayer('clusters')) map.current.removeLayer('clusters');
                  if (map.current.getLayer('cluster-count')) map.current.removeLayer('cluster-count');
                  if (map.current.getLayer('unclustered-point')) map.current.removeLayer('unclustered-point');
                  if (map.current.getSource('facts')) map.current.removeSource('facts');
                  setupMarkerMap();
                }
              }
            }}
          />
        </div>
      )}

      {/* Favorite Cities */}
      {isLoaded && favoriteCities.length > 0 && (
        <div className="absolute top-4 left-4 flex flex-col space-y-2 z-20">
          {favoriteCities.slice(0, 3).map((city, index) => (
            <button
              key={index}
              onClick={() => handleCityClick(city)}
              className="px-3 py-2 bg-background/90 backdrop-blur-sm border border-border rounded-lg text-sm font-medium hover:bg-accent transition-all shadow-md"
              title={`Fly to ${city.name}`}
            >
              {city.name}
            </button>
          ))}
        </div>
      )}

      {/* Loading skeleton */}
      {!isLoaded && <MapLoadingSkeleton />}

      {/* Timeline Slider */}
      {isLoaded && (
        <div className="absolute bottom-24 left-4 right-4 z-30">
          <TimelineSlider
            onDateRangeChange={(start, end) => setTimelineRange({ start, end })}
            onCategoriesChange={setSelectedCategories}
            minDate={new Date(2014, 0, 1)}
            maxDate={new Date()}
          />
        </div>
      )}

      {/* Historical Animation */}
      {isLoaded && map.current && (
        <div className="absolute top-24 left-4 z-30 max-w-sm">
          <HistoricalAnimation
            map={map.current}
            isPlaying={isHistoricalAnimationPlaying}
            onPlayStateChange={setIsHistoricalAnimationPlaying}
            mapContainerRef={mapContainer}
          />
        </div>
      )}

      {/* Collaborative Markers */}
      {isLoaded && map.current && (
        <CollaborativeMarkers map={map.current} />
      )}

      {/* Drawing Tools */}
      {isLoaded && map.current && (
        <div className="absolute top-96 right-4 z-30">
          <DrawingTools map={map.current} />
        </div>
      )}
    </div>
  );
};