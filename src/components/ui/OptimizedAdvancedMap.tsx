import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/ios-card';
import { Input } from '@/components/ui/ios-input';
import { Badge } from '@/components/ui/ios-badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { supabase } from '@/integrations/supabase/client';
import { 
  Map as MapIcon, 
  Globe2, 
  Sun, 
  Moon, 
  Locate, 
  Search, 
  Mountain,
  Zap,
  Settings
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Fact, FactMarker } from '@/types/map';
import { useDiscoveryStore } from '@/stores/discoveryStore';
import { usePerformanceStore } from '@/stores/performanceStore';
import { PerformanceMonitor } from '@/utils/performance-core';

// Performance optimized map component with caching and efficient rendering

const mapStyles = {
  light: 'mapbox://styles/mapbox/light-v11',
  dark: 'mapbox://styles/mapbox/dark-v11',
  satellite: 'mapbox://styles/mapbox/satellite-streets-v12',
  terrain: 'mapbox://styles/mapbox/outdoors-v12'
};

const categoryColors = {
  history: '#3B82F6',
  culture: '#8B5CF6', 
  legend: '#F59E0B',
  nature: '#10B981',
  mystery: '#EF4444'
};

interface OptimizedAdvancedMapProps {
  className?: string;
  initialCenter?: [number, number];
  initialZoom?: number;
  onFactClick?: (fact: FactMarker) => void;
  showHeatmap?: boolean;
  showBuiltInSearch?: boolean;
}

// Cache for expensive computations
const geoJSONCache = new Map<string, any>();
const markerCache = new Map<string, HTMLElement>();

const OptimizedAdvancedMap: React.FC<OptimizedAdvancedMapProps> = ({
  className,
  initialCenter = [-74.0060, 40.7128],
  initialZoom = 10,
  onFactClick,
  showHeatmap = false,
  showBuiltInSearch = true
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<{ [key: string]: mapboxgl.Marker }>({});
  const realtimeChannelRef = useRef<any>(null);
  const lastBounds = useRef<mapboxgl.LngLatBounds | null>(null);
  const pendingFactsUpdate = useRef<boolean>(false);
  
  // Performance monitoring
  const { setCachedResult, getCachedResult, enableVirtualization } = usePerformanceStore();
  
  // Get mapCenter and syncSelectedFact from discovery store
  const { mapCenter, setMapCenter, syncSelectedFact } = useDiscoveryStore();
  
  const [mapStyle, setMapStyle] = useState<keyof typeof mapStyles>('light');
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [showControls, setShowControls] = useState(true);
  const [facts, setFacts] = useState<FactMarker[]>([]);
  const [mapboxToken, setMapboxToken] = useState<string | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Memoized GeoJSON data to prevent unnecessary recalculations
  const geoJSONData = useMemo(() => {
    const cacheKey = `geojson-${facts.length}-${facts.map(f => f.id).join('-')}`;
    const cached = getCachedResult(cacheKey);
    
    if (cached) {
      return cached;
    }

    const data = {
      type: 'FeatureCollection' as const,
      features: facts.map(fact => ({
        type: 'Feature' as const,
        properties: {
          id: fact.id,
          title: fact.title,
          category: fact.category,
          verified: fact.verified
        },
        geometry: {
          type: 'Point' as const,
          coordinates: [fact.longitude, fact.latitude]
        }
      }))
    };

    setCachedResult(cacheKey, data);
    return data;
  }, [facts, getCachedResult, setCachedResult]);

  // Fetch Mapbox token with caching
  const fetchMapboxToken = useCallback(async () => {
    const cached = getCachedResult('mapbox-token');
    if (cached) return cached;

    try {
      PerformanceMonitor.start('mapbox-token-fetch');
      const { data, error } = await supabase.functions.invoke('get-mapbox-token');
      if (error) throw error;
      
      setCachedResult('mapbox-token', data.token);
      PerformanceMonitor.end('mapbox-token-fetch');
      return data.token;
    } catch (error) {
      console.error('Error fetching Mapbox token:', error);
      return null;
    }
  }, [getCachedResult, setCachedResult]);

  // Optimized facts fetching with viewport-based loading
  const fetchFactsInViewport = useCallback(async (bounds?: mapboxgl.LngLatBounds) => {
    try {
      PerformanceMonitor.start('facts-fetch');
      
      let query = supabase
        .from('facts')
        .select(`
          id,
          title,
          description,
          location_name,
          latitude,
          longitude,
          status,
          vote_count_up,
          vote_count_down,
          category_id,
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
        .in('status', ['verified', 'pending']);

      // Only fetch facts in current viewport for better performance
      if (bounds) {
        query = query
          .gte('longitude', bounds.getWest())
          .lte('longitude', bounds.getEast())
          .gte('latitude', bounds.getSouth())
          .lte('latitude', bounds.getNorth());
      }

      // Limit results for performance
      query = query.limit(enableVirtualization ? 1000 : 5000);

      const { data: facts, error } = await query;
      if (error) throw error;

      const formattedFacts: FactMarker[] = facts?.map(fact => ({
        id: fact.id,
        title: fact.title,
        latitude: fact.latitude,
        longitude: fact.longitude,
        category: fact.categories?.slug || 'unknown',
        verified: fact.status === 'verified',
        voteScore: fact.vote_count_up - fact.vote_count_down,
        authorName: fact.profiles?.username
      })) || [];

      setFacts(formattedFacts);
      PerformanceMonitor.end('facts-fetch');
    } catch (error) {
      console.error('Error fetching facts:', error);
      setFacts([]);
    }
  }, [enableVirtualization]);

  // Throttled viewport update
  const updateFactsForViewport = useCallback(() => {
    if (!map.current || pendingFactsUpdate.current) return;
    
    const currentBounds = map.current.getBounds();
    
    // Only update if bounds changed significantly
    if (lastBounds.current && 
        Math.abs(currentBounds.getCenter().lng - lastBounds.current.getCenter().lng) < 0.001 &&
        Math.abs(currentBounds.getCenter().lat - lastBounds.current.getCenter().lat) < 0.001) {
      return;
    }

    pendingFactsUpdate.current = true;
    lastBounds.current = currentBounds;

    // Debounce the update
    setTimeout(() => {
      fetchFactsInViewport(currentBounds);
      pendingFactsUpdate.current = false;
    }, 300);
  }, [fetchFactsInViewport]);

  // Set up real-time subscriptions with performance optimization
  const setupRealtimeSubscription = useCallback(() => {
    if (realtimeChannelRef.current) {
      supabase.removeChannel(realtimeChannelRef.current);
    }

    const channel = supabase
      .channel('facts-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'facts'
        },
        (payload) => {
          // Throttle real-time updates
          if (!pendingFactsUpdate.current) {
            updateFactsForViewport();
          }
        }
      )
      .subscribe();

    realtimeChannelRef.current = channel;
  }, [updateFactsForViewport]);

  // Optimized marker creation with caching
  const createMarkerElement = useCallback((fact: FactMarker) => {
    const cacheKey = `marker-${fact.id}-${fact.verified}-${isDarkMode}`;
    const cached = markerCache.get(cacheKey);
    if (cached) return cached.cloneNode(true) as HTMLElement;

    const el = document.createElement('div');
    el.className = 'custom-marker';
    const borderColor = isDarkMode ? 'hsl(var(--border))' : '#ffffff';
    
    el.style.cssText = `
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: ${categoryColors[fact.category as keyof typeof categoryColors] || '#6B7280'};
      border: 3px solid ${borderColor};
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
      transition: all 0.2s ease;
      transform-origin: center bottom;
    `;

    if (fact.verified) {
      const badge = document.createElement('div');
      badge.innerHTML = '✓';
      badge.style.cssText = `
        position: absolute;
        top: -2px;
        right: -2px;
        width: 16px;
        height: 16px;
        background: #10B981;
        color: white;
        border-radius: 50%;
        font-size: 10px;
        display: flex;
        align-items: center;
        justify-content: center;
        border: 2px solid ${borderColor};
      `;
      el.appendChild(badge);
    }

    // Cache the marker element
    markerCache.set(cacheKey, el);
    
    const clonedEl = el.cloneNode(true) as HTMLElement;
    
    // Add event listeners to the cloned element
    clonedEl.addEventListener('click', () => onFactClick?.(fact));
    
    return clonedEl;
  }, [onFactClick, isDarkMode]);

  // Efficient map layer updates
  const addFactsToMap = useCallback(() => {
    if (!map.current || !map.current.isStyleLoaded() || facts.length === 0) return;

    PerformanceMonitor.start('add-facts-to-map');

    // Clear existing layers efficiently
    const layersToRemove = ['unclustered-point', 'cluster-count', 'clusters'];
    layersToRemove.forEach(layer => {
      if (map.current!.getLayer(layer)) {
        map.current!.removeLayer(layer);
      }
    });

    if (map.current.getSource('facts')) {
      map.current.removeSource('facts');
    }

    // Add optimized cluster source
    map.current.addSource('facts', {
      type: 'geojson',
      data: geoJSONData,
      cluster: true,
      clusterMaxZoom: 14,
      clusterRadius: 50,
      // Enable clustering optimizations
      tolerance: 0.375,
      buffer: 64
    });

    // Add layers with performance optimizations
    map.current.addLayer({
      id: 'clusters',
      type: 'circle',
      source: 'facts',
      filter: ['has', 'point_count'],
      paint: {
        'circle-color': [
          'step',
          ['get', 'point_count'],
          '#3B82F6',
          100,
          '#8B5CF6',
          750,
          '#EF4444'
        ],
        'circle-radius': [
          'interpolate',
          ['linear'],
          ['zoom'],
          10, ['step', ['get', 'point_count'], 15, 100, 25, 750, 35],
          15, ['step', ['get', 'point_count'], 20, 100, 30, 750, 40]
        ],
        'circle-stroke-width': 2,
        'circle-stroke-color': isDarkMode ? 'hsl(var(--border))' : '#ffffff'
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
        'text-size': ['interpolate', ['linear'], ['zoom'], 10, 10, 15, 14]
      },
      paint: {
        'text-color': '#ffffff'
      }
    });

    map.current.addLayer({
      id: 'unclustered-point',
      type: 'circle',
      source: 'facts',
      filter: ['!', ['has', 'point_count']],
      paint: {
        'circle-color': [
          'match',
          ['get', 'category'],
          'history', categoryColors.history,
          'culture', categoryColors.culture,
          'legend', categoryColors.legend,
          'nature', categoryColors.nature,
          'mystery', categoryColors.mystery,
          '#6B7280'
        ],
        'circle-radius': [
          'interpolate',
          ['linear'],
          ['zoom'],
          10, [
            'case',
            ['==', ['get', 'id'], syncSelectedFact || ''],
            12,
            8
          ],
          15, [
            'case',
            ['==', ['get', 'id'], syncSelectedFact || ''],
            16,
            12
          ]
        ],
        'circle-stroke-width': [
          'case',
          ['==', ['get', 'id'], syncSelectedFact || ''],
          3,
          2
        ],
        'circle-stroke-color': [
          'case',
          ['==', ['get', 'id'], syncSelectedFact || ''],
          '#FFD700',
          isDarkMode ? 'hsl(var(--border))' : '#ffffff'
        ]
      }
    });

    // Add click handlers
    map.current.on('click', 'clusters', (e) => {
      const features = map.current!.queryRenderedFeatures(e.point, {
        layers: ['clusters']
      });
      const clusterId = features[0].properties!.cluster_id;
      (map.current!.getSource('facts') as mapboxgl.GeoJSONSource).getClusterExpansionZoom(clusterId, (err, zoom) => {
        if (err) return;
        map.current!.easeTo({
          center: (features[0].geometry as any).coordinates,
          zoom: zoom
        });
      });
    });

    map.current.on('click', 'unclustered-point', (e) => {
      const feature = e.features![0];
      const factId = feature.properties!.id;
      const fact = facts.find(f => f.id === factId);
      if (fact) {
        onFactClick?.(fact);
      }
    });

    // Change cursor on hover
    map.current.on('mouseenter', 'clusters', () => {
      map.current!.getCanvas().style.cursor = 'pointer';
    });
    map.current.on('mouseleave', 'clusters', () => {
      map.current!.getCanvas().style.cursor = '';
    });
    map.current.on('mouseenter', 'unclustered-point', () => {
      map.current!.getCanvas().style.cursor = 'pointer';
    });
    map.current.on('mouseleave', 'unclustered-point', () => {
      map.current!.getCanvas().style.cursor = '';
    });

    PerformanceMonitor.end('add-facts-to-map');
  }, [facts, geoJSONData, syncSelectedFact, isDarkMode, onFactClick]);

  // Initialize map with performance optimizations
  useEffect(() => {
    if (!mapContainer.current || map.current || !mapboxToken) return;

    PerformanceMonitor.start('map-initialization');
    
    mapboxgl.accessToken = mapboxToken;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: mapStyles[mapStyle],
      center: initialCenter,
      zoom: initialZoom,
      pitch: 45,
      bearing: 0,
      antialias: true,
      // Performance optimizations
      preserveDrawingBuffer: false,
      refreshExpiredTiles: false
    });

    // Add controls with efficient positioning
    const nav = new mapboxgl.NavigationControl({
      visualizePitch: true,
      showZoom: true,
      showCompass: true
    });
    map.current.addControl(nav);

    const geolocate = new mapboxgl.GeolocateControl({
      positionOptions: {
        enableHighAccuracy: true
      },
      trackUserLocation: true,
      showUserHeading: true
    });
    map.current.addControl(geolocate, 'top-right');

    map.current.addControl(new mapboxgl.ScaleControl(), 'bottom-left');

    map.current.on('load', () => {
      setIsLoading(false);
      PerformanceMonitor.end('map-initialization');
    });

    // Optimized viewport-based loading
    map.current.on('moveend', updateFactsForViewport);
    map.current.on('zoomend', updateFactsForViewport);

    geolocate.on('geolocate', (e: any) => {
      setUserLocation([e.coords.longitude, e.coords.latitude]);
    });

    return () => {
      map.current?.remove();
    };
  }, [mapboxToken, mapStyle, initialCenter, initialZoom, updateFactsForViewport]);

  // Initialize data with performance monitoring
  useEffect(() => {
    const initialize = async () => {
      PerformanceMonitor.start('map-data-initialization');
      
      const token = await fetchMapboxToken();
      if (token) {
        setMapboxToken(token);
        await fetchFactsInViewport();
        setupRealtimeSubscription();
      }
      
      PerformanceMonitor.end('map-data-initialization');
    };
    initialize();

    return () => {
      if (realtimeChannelRef.current) {
        supabase.removeChannel(realtimeChannelRef.current);
      }
    };
  }, [fetchMapboxToken, fetchFactsInViewport, setupRealtimeSubscription]);

  // Update facts when loaded
  useEffect(() => {
    if (map.current && map.current.isStyleLoaded() && facts.length > 0) {
      addFactsToMap();
    }
  }, [facts, addFactsToMap]);

  // Theme detection
  useEffect(() => {
    const detectTheme = () => {
      const isDark = document.documentElement.classList.contains('dark');
      setIsDarkMode(isDark);
    };

    detectTheme();
    const observer = new MutationObserver(detectTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });

    return () => observer.disconnect();
  }, []);

  // Handle map center changes with performance optimization
  useEffect(() => {
    if (mapCenter && map.current) {
      const currentCenter = map.current.getCenter();
      const distance = Math.sqrt(
        Math.pow(currentCenter.lng - mapCenter[0], 2) +
        Math.pow(currentCenter.lat - mapCenter[1], 2)
      );

      // Only fly if the distance is significant
      if (distance > 0.001) {
        map.current.flyTo({
          center: mapCenter,
          zoom: 15,
          essential: true,
          duration: 2000
        });
      }
    }
  }, [mapCenter]);

  return (
    <div className={cn("relative w-full h-full", className)}>
      <div ref={mapContainer} className="absolute inset-0" />
      
      {isLoading && (
        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="flex flex-col items-center gap-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <p className="text-sm text-muted-foreground">Loading optimized map...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default OptimizedAdvancedMap;