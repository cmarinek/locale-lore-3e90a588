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

import { SimpleMapControls } from './SimpleMapControls';
import { MapSkeleton } from './MapSkeleton';
import { mapboxService } from '@/services/mapboxService';
import { useMapStore } from '@/stores/mapStore';
import { MapTokenMissing } from './MapTokenMissing';
import { supabase } from '@/integrations/supabase/client';

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
  created_at?: string;
  profiles?: { username?: string };
  categories?: { 
    slug?: string;
    icon?: string;
    color?: string;
    category_translations?: { name?: string }[];
  };
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
  
  // Event handlers
  onFactClick?: (fact: Fact) => void;
  onBoundsChange?: (bounds: mapboxgl.LngLatBounds) => void;
  
  // UI options
  className?: string;
  isVisible?: boolean;
}

export const UnifiedMap: React.FC<UnifiedMapProps> = ({
  facts: externalFacts,
  useScalableLoading = false,
  center = [0, 20],
  zoom = 2,
  maxZoom = 16,
  style = 'light',
  enableClustering = true,
  clusterRadius = 50,
  enableViewportLoading = false,
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

  // Hooks - minimal state management
  const { selectedMarkerId, setSelectedMarkerId } = useMapStore();

  // State
  const [mapboxToken, setMapboxToken] = useState<string>('');
  const [tokenStatus, setTokenStatus] = useState<'idle' | 'loading' | 'ready' | 'missing' | 'error'>('idle');
  const [tokenError, setTokenError] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [currentZoom, setCurrentZoom] = useState(zoom);
  const [mapStyle, setMapStyle] = useState(style);
  const [loadingDismissed, setLoadingDismissed] = useState(false);

  const [retryTrigger, setRetryTrigger] = useState(0);

  // Fetch Mapbox token - with timeout and debug logging
  useEffect(() => {
    let mounted = true;
    let timeoutId: NodeJS.Timeout;

    const fetchToken = async () => {
      console.log('🗺️ [UnifiedMap] Starting token fetch, status:', tokenStatus);
      setTokenStatus('loading');
      setTokenError(null);
      setLoadingDismissed(false);

      // Set timeout to prevent infinite loading
      timeoutId = setTimeout(() => {
        if (mounted && tokenStatus === 'loading') {
          console.error('⏱️ [UnifiedMap] Token fetch timeout - forcing dismissal');
          setLoadingDismissed(true);
        }
      }, 8000); // 8 second timeout

      try {
        const token = await mapboxService.getToken();
        clearTimeout(timeoutId);

        console.log('🗺️ [UnifiedMap] Token fetch result:', { 
          mounted, 
          hasToken: !!token, 
          tokenLength: token?.length 
        });

        if (!mounted) return;

        if (token && token.length > 0) {
          setMapboxToken(token);
          setTokenStatus('ready');
          console.log('✅ [UnifiedMap] Token status set to READY');
        } else {
          setTokenStatus('missing');
          setTokenError('A Mapbox public token is required to display the interactive map.');
          console.log('❌ [UnifiedMap] Token status set to MISSING');
        }
      } catch (error) {
        clearTimeout(timeoutId);
        if (!mounted) return;
        
        console.error('❌ [UnifiedMap] Failed to load Mapbox token:', error);
        setTokenStatus('error');
        setTokenError(error instanceof Error ? error.message : 'Unknown error while fetching Mapbox token.');
      }
    };

    fetchToken();

    return () => {
      mounted = false;
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [retryTrigger]);

  // Handle loading state dismissal
  const handleDismissLoading = useCallback(() => {
    console.log('🗺️ [UnifiedMap] Loading state dismissed by user');
    setLoadingDismissed(true);
  }, []);

  const handleRetryTokenFetch = useCallback(() => {
    mapboxService.clearToken();
    setRetryTrigger(prev => prev + 1);
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

  // Process facts data - use provided facts directly + real-time updates
  const [liveFacts, setLiveFacts] = useState<Fact[]>([]);
  
  const processedFacts = useMemo(() => {
    return externalFacts || liveFacts;
  }, [externalFacts, liveFacts]);

  // Real-time subscription for new facts
  useEffect(() => {
    if (!externalFacts) {
      // Only subscribe if not using external facts
      const channel = supabase
        .channel('facts-realtime')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'facts'
          },
          (payload) => {
            console.log('🔴 New fact added:', payload.new);
            const newFact = payload.new as Fact;
            setLiveFacts(prev => [...prev, newFact]);
            toast({
              title: "New Story Added!",
              description: newFact.title,
            });
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [externalFacts, toast]);

  const filteredFacts = processedFacts;

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

    if (filteredFacts.length > 0) {
      const geoJsonPoints = filteredFacts.map(fact => ({
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
  }, [filteredFacts, enableClustering, clusterRadius, maxZoom]);

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
    console.log('🔄 Map init useEffect triggered:', {
      hasContainer: !!mapContainer.current,
      hasToken: !!mapboxToken,
      tokenLength: mapboxToken?.length || 0,
      tokenPreview: mapboxToken ? `${mapboxToken.substring(0, 10)}...` : 'null',
      isInitialized: isInitialized.current,
      tokenStatus
    });

    if (!mapContainer.current || !mapboxToken || isInitialized.current) {
      console.log('⏭️ Skipping map init:', {
        hasContainer: !!mapContainer.current,
        hasToken: !!mapboxToken,
        tokenLength: mapboxToken?.length || 0,
        isInitialized: isInitialized.current
      });
      return;
    }

    console.log('🗺️ Initializing Mapbox map with token:', `${mapboxToken.substring(0, 20)}...`);
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

      // Add navigation controls (zoom in/out, compass)
      map.current.addControl(
        new mapboxgl.NavigationControl({
          visualizePitch: true,
          showCompass: true,
          showZoom: true
        }),
        'top-right'
      );

      // Add geolocate control (locate me button)
      map.current.addControl(
        new mapboxgl.GeolocateControl({
          positionOptions: {
            enableHighAccuracy: true
          },
          trackUserLocation: true,
          showUserHeading: true
        }),
        'top-right'
      );

      // Add fullscreen control
      map.current.addControl(
        new mapboxgl.FullscreenControl(),
        'top-right'
      );

      map.current.on('load', () => {
        console.log('✅ Map loaded successfully');
        setIsLoaded(true);
        
        if (enableClustering) {
          setupClusteredMap();
        } else {
          setupMarkerMap();
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
        
        onBoundsChange?.(bounds);
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
  }, [mapboxToken, getMapStyleUrl, center, zoom, enableClustering]);

  // Setup clustered map using Mapbox GL native clustering with category distribution
  const setupClusteredMap = useCallback(() => {
    if (!map.current || !isLoaded) return;

    // Remove existing layers and source if they exist
    const layersToRemove = ['unclustered-point-labels', 'unclustered-point', 'cluster-count', 'clusters'];
    layersToRemove.forEach(layerId => {
      if (map.current?.getLayer(layerId)) {
        map.current.removeLayer(layerId);
      }
    });

    if (map.current.getSource('facts')) {
      map.current.removeSource('facts');
    }

    // Add facts source with clustering and category tracking
    map.current.addSource('facts', {
      type: 'geojson',
      data: {
        type: 'FeatureCollection',
        features: filteredFacts.map(fact => ({
          type: 'Feature',
          properties: {
            id: fact.id,
            title: fact.title,
            category: fact.categories?.slug || fact.category || 'unknown',
            categoryIcon: fact.categories?.icon || '📍',
            categoryColor: fact.categories?.color || '#666666',
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
        sum_votes: ['+', ['get', 'vote_count_up']],
        // Track category distribution in clusters
        history_count: ['+', ['case', ['==', ['get', 'category'], 'history'], 1, 0]],
        culture_count: ['+', ['case', ['==', ['get', 'category'], 'culture'], 1, 0]],
        nature_count: ['+', ['case', ['==', ['get', 'category'], 'nature'], 1, 0]],
        mystery_count: ['+', ['case', ['==', ['get', 'category'], 'mystery'], 1, 0]],
        legend_count: ['+', ['case', ['==', ['get', 'category'], 'legend'], 1, 0]]
      }
    });

    // Cluster circles with category-based coloring
    // Note: Mapbox can't use CSS variables, so we use actual HSL colors
    map.current.addLayer({
      id: 'clusters',
      type: 'circle',
      source: 'facts',
      filter: ['has', 'point_count'],
      paint: {
        'circle-color': [
          'case',
          ['>', ['get', 'history_count'], ['max', ['get', 'culture_count'], ['get', 'nature_count'], ['get', 'mystery_count'], ['get', 'legend_count']]],
          'hsl(203, 85%, 65%)', // primary
          ['>', ['get', 'nature_count'], ['max', ['get', 'culture_count'], ['get', 'mystery_count'], ['get', 'legend_count']]],
          'hsl(120, 45%, 55%)', // secondary/success
          ['>', ['get', 'culture_count'], ['max', ['get', 'mystery_count'], ['get', 'legend_count']]],
          'hsl(203, 30%, 90%)', // accent
          ['>', ['get', 'mystery_count'], ['get', 'legend_count']],
          'hsl(0, 84%, 60%)', // destructive
          'hsl(45, 100%, 60%)' // warning/legend - default yellow
        ],
        'circle-radius': [
          'step',
          ['get', 'point_count'],
          20, 10, 25, 50, 30, 100, 35
        ],
        'circle-stroke-width': 3,
        'circle-stroke-color': '#fff',
        'circle-opacity': 0.9
      }
    });

    // Cluster count labels with category indicator
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
          ['case',
            ['>', ['get', 'history_count'], ['max', ['get', 'culture_count'], ['get', 'nature_count'], ['get', 'mystery_count'], ['get', 'legend_count']]],
            '🏛️',
            ['>', ['get', 'nature_count'], ['max', ['get', 'culture_count'], ['get', 'mystery_count'], ['get', 'legend_count']]],
            '🌿',
            ['>', ['get', 'culture_count'], ['max', ['get', 'mystery_count'], ['get', 'legend_count']]],
            '🎭',
            ['>', ['get', 'mystery_count'], ['get', 'legend_count']],
            '🔮',
            '📜'
          ]
        ],
        'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
        'text-size': 11,
        'text-line-height': 1.2
      },
      paint: {
        'text-color': '#ffffff'
      }
    });

    // Individual points with animation support
    // Note: Mapbox can't use CSS variables, so we use actual HSL colors
    map.current.addLayer({
      id: 'unclustered-point',
      type: 'circle',
      source: 'facts',
      filter: ['!', ['has', 'point_count']],
      paint: {
        'circle-color': [
          'match',
          ['get', 'category'],
          'history', 'hsl(203, 85%, 65%)', // primary
          'nature', 'hsl(120, 45%, 55%)', // secondary/success
          'culture', 'hsl(203, 30%, 90%)', // accent  
          'mystery', 'hsl(0, 84%, 60%)', // destructive
          'legend', 'hsl(45, 100%, 60%)', // warning
          'hsl(203, 15%, 45%)' // muted-foreground - default
        ],
        'circle-radius': [
          'interpolate',
          ['linear'],
          ['zoom'],
          8, 5,
          16, 10
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
        ],
        'circle-opacity': [
          'interpolate',
          ['linear'],
          ['zoom'],
          8, 0.7,
          16, 0.95
        ]
      }
    });
    
    // Add symbol layer for marker icons with animation data
    map.current.addLayer({
      id: 'unclustered-point-icon',
      type: 'symbol',
      source: 'facts',
      filter: ['!', ['has', 'point_count']],
      layout: {
        'icon-image': 'custom-marker',
        'icon-size': [
          'interpolate',
          ['linear'],
          ['zoom'],
          8, 0.5,
          16, 1
        ],
        'icon-allow-overlap': true,
        'icon-ignore-placement': true
      }
    });

    // Click handlers with smooth expansion animation
    map.current.on('click', 'clusters', (e) => {
      const features = map.current!.queryRenderedFeatures(e.point, { layers: ['clusters'] });
      if (features[0]) {
        const clusterId = features[0].properties.cluster_id;
        const source = map.current!.getSource('facts') as mapboxgl.GeoJSONSource;
        
        // Get cluster children for animation
        source.getClusterLeaves(clusterId, 100, 0, (err, leaves) => {
          if (err) return;
          
          // Temporarily hide cluster markers that will be revealed
          const childIds = leaves?.map(leaf => leaf.properties.id) || [];
          
          // Add animation class to markers that will be revealed
          if (leaves && leaves.length > 0) {
            // Create temporary visual effect
            const tempCircle = document.createElement('div');
            tempCircle.className = 'cluster-expansion-ring';
            tempCircle.style.cssText = `
              position: absolute;
              width: 60px;
              height: 60px;
              border: 3px solid hsl(var(--primary));
              border-radius: 50%;
              pointer-events: none;
              animation: cluster-expand 0.6s ease-out forwards;
              z-index: 1000;
            `;
            
            const point = map.current!.project((features[0].geometry as any).coordinates);
            tempCircle.style.left = `${point.x - 30}px`;
            tempCircle.style.top = `${point.y - 30}px`;
            
            map.current!.getContainer().appendChild(tempCircle);
            setTimeout(() => tempCircle.remove(), 600);
          }
        });
        
        source.getClusterExpansionZoom(
          clusterId,
          (err, zoom) => {
            if (err) return;
            
            // Smooth zoom with longer duration
            map.current!.easeTo({
              center: (features[0].geometry as any).coordinates,
              zoom: zoom,
              duration: 800,
              easing: (t) => t * (2 - t) // easeOutQuad
            });
            
            // After zoom completes, trigger staggered marker reveal
            setTimeout(() => {
              // Get newly visible markers
              const visibleFeatures = map.current!.querySourceFeatures('facts', {
                sourceLayer: 'facts',
                filter: ['!', ['has', 'point_count']]
              });
              
              // Trigger staggered animation via CSS
              visibleFeatures.forEach((feature, index) => {
                setTimeout(() => {
                  // Pulse effect on newly revealed markers
                  const elements = document.querySelectorAll(`[data-fact-id="${feature.properties?.id}"]`);
                  elements.forEach(el => {
                    (el as HTMLElement).style.animation = 'marker-reveal 0.4s ease-out';
                  });
                }, index * 50); // 50ms stagger between each marker
              });
            }, 400); // Start revealing halfway through zoom
          }
        );
      }
    });

    map.current.on('click', 'unclustered-point', (e) => {
      const feature = e.features?.[0];
      if (feature && feature.properties && onFactClick) {
        const fact = filteredFacts.find(f => f.id === feature.properties.id);
        if (fact) onFactClick(fact);
      }
    });
  }, [isLoaded, filteredFacts, maxZoom, clusterRadius, selectedMarkerId, onFactClick]);

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
          if (map.current) {
            map.current.easeTo({ center: userPos, zoom: 14, duration: 1000 });
            
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
  }, []);

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

  return (
    <div className={`relative w-full h-full ${className}`}>
      {/* Map Container - always render to attach ref */}
      <div ref={mapContainer} className="absolute inset-0" />
      
      {/* Loading State */}
      {((tokenStatus === 'loading' || tokenStatus === 'idle') && !mapboxToken) && (
        <div className="absolute inset-0 z-10">
          <MapSkeleton />
        </div>
      )}

      {/* Token Missing State */}
      {tokenStatus === 'missing' && (
        <div className="absolute inset-0 z-10">
          <MapTokenMissing />
        </div>
      )}

      {/* Error State */}
      {tokenStatus === 'error' && (
        <div className="absolute inset-0 z-10">
          <div className="flex min-h-[320px] w-full items-center justify-center p-6">
            <Card className="max-w-md w-full border-destructive/40 bg-destructive/5">
              <div className="flex flex-col gap-4 p-6 text-destructive">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="h-5 w-5" />
                  <h3 className="text-lg font-semibold">Map Loading Error</h3>
                </div>
                <p className="text-sm text-destructive/80">
                  {tokenError || 'Unable to load map. Please check your connection and try again.'}
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
      )}
      
      {/* Loading Skeleton while map initializes - hide when loaded */}
      {!isLoaded && mapboxToken && tokenStatus === 'ready' && (
        <div className="absolute inset-0 z-10 bg-background">
          <MapSkeleton />
        </div>
      )}

      {/* Simple Map Controls */}
      {isLoaded && (
        <SimpleMapControls
          onZoomIn={handleZoomIn}
          onZoomOut={handleZoomOut}
          onRecenter={handleRecenter}
          onStyleChange={handleStyleChange}
          currentStyle={mapStyle}
        />
      )}
    </div>
  );
};