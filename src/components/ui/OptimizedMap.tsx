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
  showBuiltInSearch = true
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<{ [key: string]: mapboxgl.Marker }>({});
  
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

  // Initialize map with optimized loading
  const initializeMap = useCallback(async () => {
    if (!mapContainer.current) return;

    try {
      // Get token from service
      const token = await mapboxService.getToken();
      if (!token) {
        console.error('No Mapbox token available');
        return;
      }

      setLoadingState('map');
      mapboxgl.accessToken = token;

      const mapInstance = new mapboxgl.Map({
        container: mapContainer.current,
        style: mapStyles[mapStyle],
        center: mapCenter || initialCenter,
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
  }, [mapStyle, mapCenter, initialCenter, initialZoom, setMapCenter, fetchFacts]);

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

  // Effect for map initialization
  useEffect(() => {
    initializeMap();
    
    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [initializeMap]);

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

  return (
    <div className={`relative w-full h-full ${className}`}>
      <div ref={mapContainer} className="absolute inset-0 rounded-lg" />
      
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