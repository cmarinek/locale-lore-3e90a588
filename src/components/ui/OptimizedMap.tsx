// Optimized map component with improved loading and performance
import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { supabase } from '@/integrations/supabase/client';
import { mapboxService } from '@/services/mapboxService';
import { useDiscoveryStore } from '@/stores/discoveryStore';
import { FactMarker } from '@/types/map';

interface OptimizedMapProps {
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
  satellite: 'mapbox://styles/mapbox/satellite-v9',
  terrain: 'mapbox://styles/mapbox/outdoors-v12'
} as const;

const categoryColors = {
  history: '#8B5CF6',
  culture: '#06B6D4',
  nature: '#10B981',
  architecture: '#F59E0B',
  science: '#EF4444',
  mystery: '#EC4899',
  default: '#6B7280'
} as const;

export const OptimizedMap: React.FC<OptimizedMapProps> = ({
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
  const retryCountRef = useRef(0);
  const maxRetries = 3;
  
  const { mapCenter, setMapCenter, syncSelectedFact } = useDiscoveryStore();

  const [mapStyle, setMapStyle] = useState<keyof typeof mapStyles>('light');
  const [loadingState, setLoadingState] = useState<'token' | 'map' | 'facts' | 'ready'>('token');
  const [facts, setFacts] = useState<FactMarker[]>([]);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Memoized loading messages
  const loadingMessage = useMemo(() => {
    switch (loadingState) {
      case 'token': return 'Connecting to map service...';
      case 'map': return 'Initializing map...';
      case 'facts': return 'Loading locations...';
      default: return 'Loading...';
    }
  }, [loadingState]);

  // Fetch facts with error handling
  const fetchFacts = useCallback(async () => {
    try {
      setLoadingState('facts');
      const { data: factData, error } = await supabase
        .from('facts')
        .select(`
          id,
          title,
          latitude,
          longitude,
          category_id,
          status,
          vote_count_up,
          vote_count_down
        `)
        .not('latitude', 'is', null)
        .not('longitude', 'is', null);

      if (error) throw error;
      
      // Transform to FactMarker format
      const transformedFacts: FactMarker[] = (factData || []).map(fact => ({
        id: fact.id,
        title: fact.title,
        latitude: fact.latitude,
        longitude: fact.longitude,
        category: fact.category_id || 'default',
        verified: fact.status === 'verified',
        voteScore: (fact.vote_count_up || 0) - (fact.vote_count_down || 0)
      }));
      
      setFacts(transformedFacts);
    } catch (error) {
      console.error('Error fetching facts:', error);
      setFacts([]);
    }
  }, []);

  // Check if container is ready for initialization
  const isContainerReady = useCallback(() => {
    if (!mapContainer.current) return false;
    
    const rect = mapContainer.current.getBoundingClientRect();
    const computed = getComputedStyle(mapContainer.current);
    
    const isVisible = rect.width > 0 && rect.height > 0 && computed.display !== 'none';
    const hasValidSize = mapContainer.current.offsetWidth > 0 && mapContainer.current.offsetHeight > 0;
    
    console.log('🗺️ Container readiness check:', {
      visible: isVisible,
      hasValidSize,
      dimensions: { width: rect.width, height: rect.height },
      display: computed.display
    });
    
    return isVisible && hasValidSize;
  }, []);

  // Initialize map with visibility and retry logic
  const initializeMap = useCallback(async () => {
    if (!isVisible) {
      console.log('🗺️ Map not visible, skipping initialization');
      return;
    }

    if (!isContainerReady()) {
      console.warn('🗺️ Container not ready for initialization');
      if (retryCountRef.current < maxRetries) {
        retryCountRef.current++;
        console.log(`🗺️ Retrying initialization (${retryCountRef.current}/${maxRetries})`);
        setTimeout(() => initializeMap(), 100 * retryCountRef.current);
      }
      return;
    }

    try {
      // Get token from service
      const token = await mapboxService.getToken();
      if (!token) {
        console.error('🗺️ No Mapbox token available');
        return;
      }
      
      console.log('🗺️ Token received, initializing map...');

      setLoadingState('map');
      mapboxgl.accessToken = token;

      const mapInstance = new mapboxgl.Map({
        container: mapContainer.current,
        style: mapStyles[mapStyle],
        center: (mapCenter as [number, number]) || initialCenter,
        zoom: initialZoom,
        preserveDrawingBuffer: true,
        attributionControl: false,
        logoPosition: 'bottom-right'
      });

      // Add controls
      mapInstance.addControl(new mapboxgl.NavigationControl({ visualizePitch: true }), 'top-right');
      mapInstance.addControl(new mapboxgl.GeolocateControl({
        positionOptions: { enableHighAccuracy: true },
        trackUserLocation: true,
        showUserHeading: true
      }), 'top-right');

      map.current = mapInstance;

      // Set up event listeners
      mapInstance.on('load', () => {
        setLoadingState('facts');
        fetchFacts();
      });

      mapInstance.on('moveend', () => {
        const center = mapInstance.getCenter();
        setMapCenter([center.lng, center.lat]);
      });

    } catch (error) {
      console.error('Error initializing map:', error);
      setLoadingState('token');
    }
  }, []);

  // Create marker element
  const createMarkerElement = useCallback((fact: FactMarker) => {
    const el = document.createElement('div');
    el.className = 'marker-custom';
    el.style.cssText = `
      width: 30px;
      height: 30px;
      border-radius: 50%;
      cursor: pointer;
      border: 2px solid white;
      box-shadow: 0 2px 10px rgba(0,0,0,0.3);
      background-color: ${categoryColors[fact.category as keyof typeof categoryColors] || categoryColors.default};
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
      transition: transform 0.2s ease;
    `;

    // Add verification badge
    if (fact.verified) {
      const badge = document.createElement('div');
      badge.innerHTML = '✓';
      badge.style.cssText = `
        position: absolute;
        top: -5px;
        right: -5px;
        width: 16px;
        height: 16px;
        background: #10B981;
        color: white;
        border-radius: 50%;
        font-size: 10px;
        display: flex;
        align-items: center;
        justify-content: center;
        border: 2px solid white;
      `;
      el.appendChild(badge);
    }

    el.addEventListener('mouseenter', () => {
      el.style.transform = 'scale(1.2)';
    });

    el.addEventListener('mouseleave', () => {
      el.style.transform = 'scale(1)';
    });

    return el;
  }, []);

  // Add facts to map
  const addFactsToMap = useCallback(() => {
    if (!map.current || facts.length === 0) return;

    // Clear existing markers
    Object.values(markersRef.current).forEach(marker => marker.remove());
    markersRef.current = {};

    // Add new markers
    facts.forEach(fact => {
      const el = createMarkerElement(fact);
      
      const marker = new mapboxgl.Marker(el)
        .setLngLat([fact.longitude, fact.latitude])
        .addTo(map.current!);

      // Add click handler
      el.addEventListener('click', () => {
        onFactClick?.(fact);
      });

      markersRef.current[fact.id] = marker;
    });

    setLoadingState('ready');
  }, [facts, createMarkerElement, onFactClick]);

  // Effect for map initialization with visibility control
  useEffect(() => {
    if (hasInitializedRef.current || !isVisible) return;

    const timer = setTimeout(() => {
      if (!hasInitializedRef.current && isVisible && isContainerReady()) {
        console.log('🗺️ Initializing visible map');
        initializeMap();
        hasInitializedRef.current = true;
      } else if (isVisible && !isContainerReady()) {
        console.warn('🗺️ Container not ready, will retry');
      }
    }, 150);
    
    return () => {
      clearTimeout(timer);
      // Cleanup on unmount
      if (map.current) {
        map.current.remove();
        map.current = null;
        hasInitializedRef.current = false;
        retryCountRef.current = 0;
      }
    };
  }, [isVisible, isContainerReady, initializeMap]);

  // Effect for adding facts
  useEffect(() => {
    if (loadingState === 'facts' && facts.length >= 0) {
      addFactsToMap();
    }
  }, [facts, loadingState, addFactsToMap]);

  // Theme detection
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    setIsDarkMode(mediaQuery.matches);
    setMapStyle(mediaQuery.matches ? 'dark' : 'light');

    const handleChange = (e: MediaQueryListEvent) => {
      setIsDarkMode(e.matches);
      setMapStyle(e.matches ? 'dark' : 'light');
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Update map style without re-initializing
  useEffect(() => {
    if (map.current) {
      try {
        map.current.setStyle(mapStyles[mapStyle]);
      } catch (e) {
        console.warn('🗺️ Failed to update map style', e);
      }
    }
  }, [mapStyle]);

  // React to external center changes without re-initializing
  useEffect(() => {
    if (map.current && mapCenter) {
      map.current.easeTo({ center: mapCenter as [number, number], duration: 800 });
    }
  }, [mapCenter]);

  return (
    <div className={`relative w-full h-full min-h-[400px] ${className}`}>
      <div 
        ref={mapContainer} 
        className="absolute inset-0 rounded-lg w-full h-full" 
        style={{ minHeight: '400px' }}
      />
      
      {/* Loading overlay with progress indicator */}
      {loadingState !== 'ready' && (
        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center rounded-lg">
          <div className="flex flex-col items-center space-y-4 p-6 bg-card/90 rounded-lg shadow-lg">
            <div className="flex items-center space-x-3">
              <div className="animate-spin rounded-full h-6 w-6 border-2 border-primary border-t-transparent"></div>
              <span className="text-sm font-medium">{loadingMessage}</span>
            </div>
            
            {/* Progress bar */}
            <div className="w-48 h-2 bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full bg-primary rounded-full transition-all duration-500 ease-out"
                style={{
                  width: loadingState === 'token' ? '25%' : 
                         loadingState === 'map' ? '50%' : 
                         loadingState === 'facts' ? '75%' : '100%'
                }}
              />
            </div>
            
            <p className="text-xs text-muted-foreground text-center">
              {loadingState === 'token' && 'Setting up map connection...'}
              {loadingState === 'map' && 'Preparing interactive map...'}
              {loadingState === 'facts' && 'Loading location data...'}
            </p>
          </div>
        </div>
      )}

      {/* Map style controls */}
      {loadingState === 'ready' && (
        <div className="absolute top-4 left-4 flex flex-col space-y-2 z-10">
          {Object.entries(mapStyles).map(([style, _]) => (
            <button
              key={style}
              onClick={() => setMapStyle(style as keyof typeof mapStyles)}
              className={`w-10 h-10 rounded-lg border-2 flex items-center justify-center text-sm font-medium transition-all ${
                mapStyle === style 
                  ? 'bg-primary text-primary-foreground border-primary shadow-lg' 
                  : 'bg-background/90 text-foreground border-border hover:bg-accent hover:border-accent-foreground'
              }`}
              title={`Switch to ${style} style`}
            >
              {style === 'light' && '☀️'}
              {style === 'dark' && '🌙'}
              {style === 'satellite' && '🛰️'}
              {style === 'terrain' && '🏔️'}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};