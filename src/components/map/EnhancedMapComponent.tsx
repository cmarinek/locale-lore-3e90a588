import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { supabase } from '@/integrations/supabase/client';
import { mapboxService } from '@/services/mapboxService';
import { useDiscoveryStore } from '@/stores/discoveryStore';
import { FactMarker } from '@/types/map';
import { useRealtime } from '@/hooks/useRealtime';
import { cn } from '@/lib/utils';

interface EnhancedMapProps {
  className?: string;
  initialCenter?: [number, number];
  initialZoom?: number;
  onFactClick?: (fact: FactMarker) => void;
  showHeatmap?: boolean;
  showBuiltInSearch?: boolean;
  isVisible?: boolean;
}

const mapStyles = {
  light: 'mapbox://styles/mapbox/light-v11',
  dark: 'mapbox://styles/mapbox/dark-v11',
  satellite: 'mapbox://styles/mapbox/satellite-streets-v12',
  terrain: 'mapbox://styles/mapbox/outdoors-v12'
} as const;

// Enhanced visual hierarchy for categories and verification
const categoryConfig = {
  history: { color: '#8B5CF6', priority: 3, icon: '🏛️' },
  culture: { color: '#06B6D4', priority: 3, icon: '🎭' },
  nature: { color: '#10B981', priority: 2, icon: '🌿' },
  architecture: { color: '#F59E0B', priority: 3, icon: '🏗️' },
  science: { color: '#EF4444', priority: 4, icon: '🔬' },
  mystery: { color: '#EC4899', priority: 5, icon: '❓' },
  default: { color: '#6B7280', priority: 1, icon: '📍' }
} as const;

// Coordinate validation utilities
const validateCoordinates = (lat: number, lng: number): boolean => {
  return lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
};

const sanitizeCoordinates = (lat: number, lng: number): [number, number] => {
  const sanitizedLat = Math.max(-90, Math.min(90, lat));
  const sanitizedLng = Math.max(-180, Math.min(180, lng));
  return [sanitizedLng, sanitizedLat];
};

export const EnhancedMapComponent: React.FC<EnhancedMapProps> = ({
  className = '',
  initialCenter = [0, 20],
  initialZoom = 2,
  onFactClick,
  showHeatmap = false,
  showBuiltInSearch = true,
  isVisible = true
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<{ [key: string]: mapboxgl.Marker }>({});
  const hasInitializedRef = useRef(false);
  const realtimeChannel = useRef<any>(null);
  
  const { mapCenter, setMapCenter, syncSelectedFact } = useDiscoveryStore();
  
  const [mapStyle, setMapStyle] = useState<keyof typeof mapStyles>('light');
  const [loadingState, setLoadingState] = useState<'token' | 'map' | 'facts' | 'ready'>('token');
  const [facts, setFacts] = useState<FactMarker[]>([]);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [errorState, setErrorState] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  
  // Enhanced loading management
  const [overlayMinTimerDone, setOverlayMinTimerDone] = useState(false);
  const MIN_OVERLAY_MS = 1200;

  useEffect(() => {
    const timer = setTimeout(() => setOverlayMinTimerDone(true), MIN_OVERLAY_MS);
    return () => clearTimeout(timer);
  }, []);

  // Real-time data subscription with enhanced error handling
  const { subscribe, unsubscribe } = useRealtime({
    onError: (error) => {
      console.error('Real-time subscription error:', error);
      setErrorState('Failed to sync real-time updates');
    }
  });

  // Enhanced facts fetching with coordinate validation
  const fetchFacts = useCallback(async () => {
    try {
      setLoadingState('facts');
      setErrorState(null);
      
      const { data: factData, error } = await supabase
        .from('facts')
        .select(`
          id,
          title,
          description,
          latitude,
          longitude,
          category_id,
          status,
          vote_count_up,
          vote_count_down,
          categories!facts_category_id_fkey(
            slug,
            icon,
            color
          ),
          profiles!facts_author_id_fkey(
            username,
            avatar_url
          )
        `)
        .not('latitude', 'is', null)
        .not('longitude', 'is', null)
        .in('status', ['verified', 'pending']);

      if (error) throw error;
      
      // Enhanced data transformation with validation
      const transformedFacts: FactMarker[] = (factData || [])
        .filter(fact => {
          // Strict coordinate validation
          const lat = typeof fact.latitude === 'string' ? parseFloat(fact.latitude) : fact.latitude;
          const lng = typeof fact.longitude === 'string' ? parseFloat(fact.longitude) : fact.longitude;
          return validateCoordinates(lat, lng);
        })
        .map(fact => {
          const lat = typeof fact.latitude === 'string' ? parseFloat(fact.latitude) : fact.latitude;
          const lng = typeof fact.longitude === 'string' ? parseFloat(fact.longitude) : fact.longitude;
          const [sanitizedLng, sanitizedLat] = sanitizeCoordinates(lat, lng);
          
          return {
            id: fact.id,
            title: fact.title,
            latitude: sanitizedLat,
            longitude: sanitizedLng,
            category: fact.categories?.slug || 'default',
            verified: fact.status === 'verified',
            voteScore: (fact.vote_count_up || 0) - (fact.vote_count_down || 0),
            authorName: fact.profiles?.username
          };
        });
      
      console.log(`✅ Loaded ${transformedFacts.length} validated facts`);
      setFacts(transformedFacts);
      
    } catch (error) {
      console.error('Error fetching facts:', error);
      setErrorState('Failed to load location data');
      setFacts([]);
    }
  }, []);

  // Setup real-time subscription
  const setupRealtimeSubscription = useCallback(() => {
    if (realtimeChannel.current) {
      unsubscribe('facts-updates');
    }

    realtimeChannel.current = subscribe('facts-updates', {
      event: '*',
      schema: 'public',
      table: 'facts'
    }, (payload) => {
      console.log('📡 Real-time fact update:', payload);
      fetchFacts();
    });
  }, [subscribe, unsubscribe, fetchFacts]);

  // Enhanced marker creation with visual hierarchy
  const createEnhancedMarkerElement = useCallback((fact: FactMarker): HTMLElement => {
    const el = document.createElement('div');
    const category = fact.category as keyof typeof categoryConfig;
    const config = categoryConfig[category] || categoryConfig.default;
    
    // Calculate marker size based on verification and vote score
    const baseSize = 12;
    const verificationBonus = fact.verified ? 6 : 0;
    const popularityBonus = Math.min(Math.max(fact.voteScore || 0, 0) * 2, 8);
    const priorityBonus = config.priority * 2;
    const finalSize = baseSize + verificationBonus + popularityBonus + priorityBonus;
    
    // Enhanced styling with better visual hierarchy
    el.className = 'marker-enhanced';
    el.style.cssText = `
      width: ${finalSize}px;
      height: ${finalSize}px;
      border-radius: 50%;
      cursor: pointer;
      border: ${fact.verified ? '3px' : '2px'} solid ${fact.verified ? '#10B981' : 'white'};
      box-shadow: 0 4px 12px rgba(0,0,0,0.3), ${fact.verified ? '0 0 0 2px rgba(16, 185, 129, 0.3)' : ''};
      background: linear-gradient(145deg, ${config.color}, ${config.color}dd);
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      transform-origin: center;
      z-index: ${config.priority};
    `;

    // Add category icon
    const iconEl = document.createElement('div');
    iconEl.innerHTML = config.icon;
    iconEl.style.cssText = `
      font-size: ${Math.max(8, finalSize * 0.4)}px;
      filter: drop-shadow(0 1px 2px rgba(0,0,0,0.5));
    `;
    el.appendChild(iconEl);

    // Enhanced verification badge
    if (fact.verified) {
      const badge = document.createElement('div');
      badge.innerHTML = '✓';
      badge.style.cssText = `
        position: absolute;
        top: -6px;
        right: -6px;
        width: 16px;
        height: 16px;
        background: linear-gradient(145deg, #10B981, #059669);
        color: white;
        border-radius: 50%;
        font-size: 10px;
        font-weight: bold;
        display: flex;
        align-items: center;
        justify-content: center;
        border: 2px solid white;
        box-shadow: 0 2px 6px rgba(16, 185, 129, 0.4);
      `;
      el.appendChild(badge);
    }

    // Popularity indicator for high-voted facts
    if ((fact.voteScore || 0) > 10) {
      const popularityRing = document.createElement('div');
      popularityRing.style.cssText = `
        position: absolute;
        top: -3px;
        left: -3px;
        right: -3px;
        bottom: -3px;
        border: 2px solid ${config.color};
        border-radius: 50%;
        opacity: 0.6;
        animation: pulse 2s infinite;
      `;
      el.appendChild(popularityRing);
    }

    // Enhanced hover effects
    el.addEventListener('mouseenter', () => {
      el.style.transform = 'scale(1.3)';
      el.style.zIndex = '1000';
      el.style.boxShadow = `0 8px 25px rgba(0,0,0,0.4), 0 0 0 4px ${config.color}33`;
    });

    el.addEventListener('mouseleave', () => {
      el.style.transform = 'scale(1)';
      el.style.zIndex = config.priority.toString();
      el.style.boxShadow = `0 4px 12px rgba(0,0,0,0.3), ${fact.verified ? '0 0 0 2px rgba(16, 185, 129, 0.3)' : ''}`;
    });

    // Add click ripple effect
    el.addEventListener('click', (e) => {
      const ripple = document.createElement('div');
      ripple.style.cssText = `
        position: absolute;
        top: 50%;
        left: 50%;
        width: 4px;
        height: 4px;
        background: white;
        border-radius: 50%;
        transform: translate(-50%, -50%);
        animation: ripple 0.6s ease-out;
        pointer-events: none;
      `;
      el.appendChild(ripple);
      
      setTimeout(() => ripple.remove(), 600);
      
      // Trigger fact click with enhanced feedback
      onFactClick?.(fact);
    });

    return el;
  }, [onFactClick]);

  // Enhanced map initialization
  const initializeMap = useCallback(async () => {
    if (hasInitializedRef.current || !mapContainer.current) return;

    try {
      setLoadingState('token');
      setErrorState(null);
      
      const token = await mapboxService.getToken();
      if (!token) {
        throw new Error('Failed to obtain Mapbox token');
      }
      
      setLoadingState('map');
      mapboxgl.accessToken = token;

      const mapInstance = new mapboxgl.Map({
        container: mapContainer.current,
        style: mapStyles[mapStyle],
        center: (mapCenter as [number, number]) || initialCenter,
        zoom: initialZoom,
        preserveDrawingBuffer: true,
        attributionControl: false,
        logoPosition: 'bottom-right',
        antialias: true
      });

      // Enhanced controls with better positioning
      const nav = new mapboxgl.NavigationControl({ 
        visualizePitch: true, 
        showZoom: true, 
        showCompass: true 
      });
      mapInstance.addControl(nav, 'top-right');
      
      const geolocate = new mapboxgl.GeolocateControl({
        positionOptions: { enableHighAccuracy: true },
        trackUserLocation: true,
        showUserHeading: true
      });
      mapInstance.addControl(geolocate, 'top-right');
      
      mapInstance.addControl(new mapboxgl.ScaleControl(), 'bottom-left');

      map.current = mapInstance;
      hasInitializedRef.current = true;

      // Enhanced event listeners
      mapInstance.on('load', () => {
        console.log('🗺️ Map loaded successfully');
        fetchFacts();
        setupRealtimeSubscription();
      });

      mapInstance.on('error', (e) => {
        console.error('Map error:', e);
        setErrorState('Map rendering error occurred');
      });

      // User location tracking
      geolocate.on('geolocate', (e: any) => {
        setUserLocation([e.coords.longitude, e.coords.latitude]);
      });

      // Movement tracking with throttling
      let moveTimeout: NodeJS.Timeout;
      mapInstance.on('moveend', () => {
        clearTimeout(moveTimeout);
        moveTimeout = setTimeout(() => {
          const center = mapInstance.getCenter();
          setMapCenter([center.lng, center.lat]);
        }, 300);
      });

    } catch (error) {
      console.error('Map initialization error:', error);
      setErrorState('Failed to initialize map');
      if (retryCount < 3) {
        setRetryCount(prev => prev + 1);
        setTimeout(initializeMap, 2000 * (retryCount + 1));
      }
    }
  }, [mapStyle, mapCenter, initialCenter, initialZoom, fetchFacts, setupRealtimeSubscription, retryCount]);

  // Enhanced clustering with Mapbox native implementation
  const addFactsToMap = useCallback(() => {
    if (!map.current || !map.current.isStyleLoaded() || facts.length === 0) return;

    console.log(`🗺️ Adding ${facts.length} facts to map with enhanced clustering`);

    // Clear existing sources and layers
    ['unclustered-point', 'cluster-count', 'clusters'].forEach(layerId => {
      if (map.current!.getLayer(layerId)) {
        map.current!.removeLayer(layerId);
      }
    });
    
    if (map.current.getSource('facts')) {
      map.current.removeSource('facts');
    }

    // Enhanced GeoJSON source with better clustering
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
            voteScore: fact.voteScore || 0,
            priority: categoryConfig[fact.category as keyof typeof categoryConfig]?.priority || 1
          },
          geometry: {
            type: 'Point',
            coordinates: [fact.longitude, fact.latitude]
          }
        }))
      },
      cluster: true,
      clusterMaxZoom: 16,
      clusterRadius: 60,
      clusterProperties: {
        'verified_count': ['+', ['case', ['get', 'verified'], 1, 0]],
        'total_votes': ['+', ['get', 'voteScore']]
      }
    });

    // Enhanced cluster styling with verification indicators
    map.current.addLayer({
      id: 'clusters',
      type: 'circle',
      source: 'facts',
      filter: ['has', 'point_count'],
      paint: {
        'circle-color': [
          'case',
          ['>', ['get', 'verified_count'], ['/', ['get', 'point_count'], 2]],
          '#10B981', // Green for mostly verified
          [
            'step',
            ['get', 'point_count'],
            '#3B82F6',
            50, '#8B5CF6',
            100, '#F59E0B'
          ]
        ],
        'circle-radius': [
          'step',
          ['get', 'point_count'],
          15, // Smaller base size
          10, 20,
          50, 25,
          100, 30
        ],
        'circle-stroke-width': 2,
        'circle-stroke-color': '#ffffff'
      }
    });

    // Enhanced cluster labels
    map.current.addLayer({
      id: 'cluster-count',
      type: 'symbol',
      source: 'facts',
      filter: ['has', 'point_count'],
      layout: {
        'text-field': [
          'concat',
          ['to-string', ['get', 'point_count']],
          '\n',
          ['case', ['>', ['get', 'verified_count'], 0], '✓', '']
        ],
        'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
        'text-size': 11,
        'text-line-height': 1.2
      },
      paint: {
        'text-color': '#ffffff'
      }
    });

    // Enhanced individual points with priority-based styling
    map.current.addLayer({
      id: 'unclustered-point',
      type: 'circle',
      source: 'facts',
      filter: ['!', ['has', 'point_count']],
      paint: {
        'circle-color': [
          'match',
          ['get', 'category'],
          'history', categoryConfig.history.color,
          'culture', categoryConfig.culture.color,
          'nature', categoryConfig.nature.color,
          'architecture', categoryConfig.architecture.color,
          'science', categoryConfig.science.color,
          'mystery', categoryConfig.mystery.color,
          categoryConfig.default.color
        ],
        'circle-radius': [
          '+',
          8, // Base size
          ['*', ['get', 'priority'], 1.5], // Priority bonus
          ['case', ['get', 'verified'], 3, 0], // Verification bonus
          ['min', ['*', ['max', ['get', 'voteScore'], 0], 0.3], 6] // Vote score bonus (capped)
        ],
        'circle-stroke-width': [
          'case',
          ['get', 'verified'], 3, 2
        ],
        'circle-stroke-color': [
          'case',
          ['get', 'verified'], '#10B981', '#ffffff'
        ],
        'circle-opacity': 0.9
      }
    });

    // Enhanced click handlers
    map.current.on('click', 'clusters', (e) => {
      if (!map.current) return;
      
      const features = map.current.queryRenderedFeatures(e.point, { layers: ['clusters'] });
      const clusterId = features[0].properties?.cluster_id;
      const source = map.current.getSource('facts') as mapboxgl.GeoJSONSource;
      
      source.getClusterExpansionZoom(clusterId, (err, zoom) => {
        if (err || !map.current) return;
        
        map.current.easeTo({
          center: (features[0].geometry as any).coordinates,
          zoom: zoom,
          duration: 1000
        });
      });
    });

    map.current.on('click', 'unclustered-point', (e) => {
      const feature = e.features?.[0];
      if (feature?.properties) {
        const factId = feature.properties.id;
        const fact = facts.find(f => f.id === factId);
        if (fact) {
          onFactClick?.(fact);
        }
      }
    });

    setLoadingState('ready');
  }, [facts, onFactClick]);

  // Component lifecycle effects
  useEffect(() => {
    if (!hasInitializedRef.current && isVisible) {
      initializeMap();
    }
    
    return () => {
      if (realtimeChannel.current) {
        unsubscribe('facts-updates');
      }
      if (map.current) {
        map.current.remove();
        map.current = null;
        hasInitializedRef.current = false;
      }
    };
  }, [isVisible, initializeMap, unsubscribe]);

  useEffect(() => {
    if (loadingState === 'facts' && facts.length >= 0) {
      addFactsToMap();
    }
  }, [facts, loadingState, addFactsToMap]);

  // Theme detection
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const updateTheme = (e: MediaQueryListEvent | MediaQueryList) => {
      setIsDarkMode(e.matches);
      setMapStyle(e.matches ? 'dark' : 'light');
    };
    
    updateTheme(mediaQuery);
    mediaQuery.addEventListener('change', updateTheme);
    
    return () => mediaQuery.removeEventListener('change', updateTheme);
  }, []);

  // Style updates
  useEffect(() => {
    if (map.current && hasInitializedRef.current) {
      map.current.setStyle(mapStyles[mapStyle]);
      map.current.once('styledata', () => {
        if (facts.length > 0) {
          addFactsToMap();
        }
      });
    }
  }, [mapStyle, addFactsToMap, facts.length]);

  const isLoading = !overlayMinTimerDone || loadingState !== 'ready';

  return (
    <div className={cn('relative w-full h-full min-h-[400px]', className)}>
      <div 
        ref={mapContainer} 
        className="absolute inset-0 rounded-lg w-full h-full" 
        role="application"
        aria-label="Interactive map showing facts and locations"
      />
      
      {/* Enhanced loading overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-background/90 backdrop-blur-sm flex items-center justify-center rounded-lg">
          <div className="flex flex-col items-center space-y-4 p-6 bg-card/95 rounded-xl shadow-lg border">
            <div className="flex items-center space-x-3">
              <div className="animate-spin rounded-full h-6 w-6 border-2 border-primary border-t-transparent"></div>
              <span className="text-sm font-medium">
                {loadingState === 'token' && 'Connecting to map service...'}
                {loadingState === 'map' && 'Initializing map...'}
                {loadingState === 'facts' && 'Loading location data...'}
                {loadingState === 'ready' && 'Finalizing...'}
              </span>
            </div>
            
            {/* Enhanced progress bar */}
            <div className="w-56 h-2 bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-primary to-primary/80 rounded-full transition-all duration-700 ease-out"
                style={{
                  width: loadingState === 'token' ? '25%' : 
                         loadingState === 'map' ? '60%' : 
                         loadingState === 'facts' ? '90%' : '100%'
                }}
              />
            </div>
            
            {retryCount > 0 && (
              <p className="text-xs text-muted-foreground">
                Retry attempt {retryCount}/3...
              </p>
            )}
          </div>
        </div>
      )}

      {/* Error state overlay */}
      {errorState && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-20">
          <div className="bg-destructive/90 text-destructive-foreground px-4 py-2 rounded-lg shadow-lg border">
            <p className="text-sm font-medium">{errorState}</p>
          </div>
        </div>
      )}

      {/* Enhanced map controls */}
      {loadingState === 'ready' && (
        <div className="absolute top-4 left-4 flex flex-col space-y-2 z-10">
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

      {/* Enhanced legend */}
      {loadingState === 'ready' && facts.length > 0 && (
        <div className="absolute bottom-4 left-4 bg-background/90 backdrop-blur-sm rounded-xl p-3 shadow-lg border z-10">
          <div className="flex items-center space-x-3 text-xs">
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 rounded-full bg-primary border border-white"></div>
              <span>Unverified</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 rounded-full bg-green-500 border-2 border-white"></div>
              <span>Verified</span>
            </div>
            <div className="text-muted-foreground">
              {facts.length} locations
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.6; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.05); }
        }
        
        @keyframes ripple {
          0% { width: 4px; height: 4px; opacity: 1; }
          100% { width: 40px; height: 40px; opacity: 0; }
        }
      `}</style>
    </div>
  );
};