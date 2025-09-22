import React, { useEffect, useRef, useState, useCallback } from 'react';
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
  Settings,
  Share
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Fact, FactMarker } from '@/types/map';
import { useDiscoveryStore } from '@/stores/discoveryStore';

// Get theme-aware border color
const getThemeBorderColor = () => {
  return getComputedStyle(document.documentElement).getPropertyValue('--border').trim();
};

// Real-time facts data - no more mock data!

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

interface AdvancedMapProps {
  className?: string;
  initialCenter?: [number, number];
  initialZoom?: number;
  onFactClick?: (fact: FactMarker) => void;
  showHeatmap?: boolean;
  showBuiltInSearch?: boolean;
}

const AdvancedMap: React.FC<AdvancedMapProps> = ({
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

  // Fetch Mapbox token securely from Edge Function
  const fetchMapboxToken = useCallback(async () => {
    try {
      const { data, error } = await supabase.functions.invoke('get-mapbox-token');
      if (error) throw error;
      return data.token;
    } catch (error) {
      console.error('Error fetching Mapbox token:', error);
      return null;
    }
  }, []);

  // Fetch facts from Supabase
  const fetchFacts = useCallback(async () => {
    try {
      const { data: facts, error } = await supabase
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
          author_id,
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
    } catch (error) {
      console.error('Error fetching facts:', error);
      // Fallback to mock data if there's an error
      setFacts([]);
    }
  }, []);

  // Set up real-time subscriptions
  const setupRealtimeSubscription = useCallback(() => {
    // Clean up existing subscription
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
          console.log('Real-time fact update:', payload);
          // Refetch facts when changes occur
          fetchFacts();
        }
      )
      .subscribe();

    realtimeChannelRef.current = channel;
  }, [fetchFacts]);

  // Initialize token and data efficiently
  useEffect(() => {
    const initialize = async () => {
      const token = await fetchMapboxToken();
      if (token) {
        setMapboxToken(token);
        fetchFacts(); // Remove await to not block loading
        setupRealtimeSubscription();
      }
    };
    initialize();

    return () => {
      if (realtimeChannelRef.current) {
        supabase.removeChannel(realtimeChannelRef.current);
      }
    };
  }, [fetchMapboxToken, fetchFacts, setupRealtimeSubscription]);

  // Create custom marker element
  const createMarkerElement = useCallback((fact: FactMarker): HTMLElement => {
    const el = document.createElement('div');
    el.className = 'marker-container cursor-pointer';
    
    // Get category info
    const category = fact.category || 'general';
    const isVerified = fact.verified;
    
    // CashApp-style color mapping
    const categoryColors: Record<string, string> = {
      'history': '#dc2626', // Red like CVS
      'culture': '#16a34a',   // Green like 7-Eleven
      'nature': '#2563eb',    // Blue
      'urban': '#7c3aed',      // Purple
      'folklore': '#ea580c',   // Orange
      'general': '#6b7280'     // Gray
    };
    
    const bgColor = categoryColors[category] || categoryColors.general;
    
    el.innerHTML = `
      <div class="relative">
        <div class="w-10 h-10 rounded-full flex items-center justify-center text-white font-medium text-sm shadow-lg transform transition-all duration-200 hover:scale-110" 
             style="background-color: ${bgColor}">
          <span class="font-bold">📍</span>
        </div>
        ${isVerified ? 
          '<div class="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white flex items-center justify-center"><svg class="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path></svg></div>' : 
          ''
        }
      </div>
    `;
    
    return el;
  }, []);

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || map.current || !mapboxToken) return;

    mapboxgl.accessToken = mapboxToken;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: mapStyles[mapStyle],
      center: initialCenter,
      zoom: initialZoom,
      pitch: 45,
      bearing: 0,
      antialias: true
    });

    // Add navigation controls positioned at 50vh to avoid ViewModeToggle overlap
    const nav = new mapboxgl.NavigationControl({
      visualizePitch: true,
      showZoom: true,
      showCompass: true
    });
    
    // Custom positioning for navigation controls
    map.current.addControl(nav);
    
    // Move controls to 50vh after they're added
    setTimeout(() => {
      const navControl = document.querySelector('.mapboxgl-ctrl-top-right');
      if (navControl) {
        (navControl as HTMLElement).style.top = '50vh';
        (navControl as HTMLElement).style.transform = 'translateY(-50%)';
      }
    }, 100);

    // Add geolocate control
    const geolocate = new mapboxgl.GeolocateControl({
      positionOptions: {
        enableHighAccuracy: true
      },
      trackUserLocation: true,
      showUserHeading: true
    });
    map.current.addControl(geolocate, 'top-right');

    // Add scale control
    map.current.addControl(new mapboxgl.ScaleControl(), 'bottom-left');

    // Map load event
    map.current.on('load', () => {
      setIsLoading(false);
      // Don't add facts here - wait for facts to be loaded
    });

    // Geolocate event
    geolocate.on('geolocate', (e: any) => {
      setUserLocation([e.coords.longitude, e.coords.latitude]);
    });

    return () => {
      map.current?.remove();
    };
  }, [mapboxToken]); // Add mapboxToken as dependency

  // Detect theme changes
  useEffect(() => {
    const detectTheme = () => {
      const isDark = document.documentElement.classList.contains('dark');
      setIsDarkMode(isDark);
    };

    // Initial detection
    detectTheme();

    // Watch for theme changes
    const observer = new MutationObserver(detectTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });

    return () => observer.disconnect();
  }, []);

  // Update map layers when theme changes
  useEffect(() => {
    if (map.current && map.current.isStyleLoaded()) {
      // Update cluster stroke colors
      if (map.current.getLayer('clusters')) {
        map.current.setPaintProperty('clusters', 'circle-stroke-color', 
          isDarkMode ? 'hsl(var(--border))' : '#ffffff'
        );
      }
      
      // Update unclustered point stroke colors
      if (map.current.getLayer('unclustered-point')) {
        map.current.setPaintProperty('unclustered-point', 'circle-stroke-color', 
          isDarkMode ? 'hsl(var(--border))' : '#ffffff'
        );
      }
    }
  }, [isDarkMode]);

  // Update map style
  useEffect(() => {
    if (map.current) {
      map.current.setStyle(mapStyles[mapStyle]);
      map.current.once('styledata', () => {
        addFactsToMap();
        if (showHeatmap) {
          addHeatmapLayer();
        }
      });
    }
  }, [mapStyle]);

  // Add facts as markers with clustering
  const addFactsToMap = useCallback(() => {
    if (!map.current || !map.current.isStyleLoaded() || facts.length === 0) return;

    console.log(`Adding ${facts.length} facts to map`);

    // Clear existing markers
    Object.values(markersRef.current).forEach(marker => marker.remove());
    markersRef.current = {};

    // Remove existing source and layers if they exist
    if (map.current.getLayer('unclustered-point')) {
      map.current.removeLayer('unclustered-point');
    }
    if (map.current.getLayer('cluster-count')) {
      map.current.removeLayer('cluster-count');
    }
    if (map.current.getLayer('clusters')) {
      map.current.removeLayer('clusters');
    }
    if (map.current.getSource('facts')) {
      map.current.removeSource('facts');
    }

    // Add cluster source
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
              verified: fact.verified
            },
            geometry: {
              type: 'Point',
              coordinates: [fact.longitude, fact.latitude]
            }
          }))
        },
        cluster: true,
        clusterMaxZoom: 14,
        clusterRadius: 50
      });

      // Add cluster layer
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
            'step',
            ['get', 'point_count'],
            20,
            100,
            30,
            750,
            40
          ],
          'circle-stroke-width': 2,
          'circle-stroke-color': isDarkMode ? 'hsl(var(--border))' : '#ffffff'
        }
      });

      // Add cluster count layer
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

      // Add unclustered points layer
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
            'case',
            ['==', ['get', 'id'], syncSelectedFact || ''],
            16, // Larger radius for selected fact
            12
          ],
          'circle-stroke-width': [
            'case',
            ['==', ['get', 'id'], syncSelectedFact || ''],
            4, // Thicker stroke for selected fact
            2
          ],
          'circle-stroke-color': [
            'case',
            ['==', ['get', 'id'], syncSelectedFact || ''],
            '#FFD700', // Gold stroke for selected fact
            isDarkMode ? 'hsl(var(--border))' : '#ffffff'
          ]
        }
      });

      // Click events for clusters
      map.current.on('click', 'clusters', (e) => {
        if (!map.current) return;
        
        const features = map.current.queryRenderedFeatures(e.point, {
          layers: ['clusters']
        });
        
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

      // Click events for unclustered points
      map.current.on('click', 'unclustered-point', (e) => {
        const feature = e.features?.[0];
        if (feature && feature.properties) {
          const fact = facts.find(f => f.id === feature.properties?.id);
          if (fact) {
            onFactClick?.(fact);
          }
        }
      });

      // Cursor pointer on hover
      map.current.on('mouseenter', 'clusters', () => {
        if (map.current) map.current.getCanvas().style.cursor = 'pointer';
      });
      map.current.on('mouseleave', 'clusters', () => {
        if (map.current) map.current.getCanvas().style.cursor = '';
      });
      map.current.on('mouseenter', 'unclustered-point', () => {
        if (map.current) map.current.getCanvas().style.cursor = 'pointer';
      });
      map.current.on('mouseleave', 'unclustered-point', () => {
        if (map.current) map.current.getCanvas().style.cursor = '';
      });
    
  }, [facts, onFactClick, isDarkMode]);

  // Update facts on map when facts array changes
  useEffect(() => {
    if (map.current && facts.length > 0 && map.current.isStyleLoaded()) {
      addFactsToMap();
      if (showHeatmap) {
        addHeatmapLayer();
      }
    }
  }, [facts, addFactsToMap, showHeatmap]);

  // Add heatmap layer
  const addHeatmapLayer = useCallback(() => {
    if (!map.current) return;

    if (!map.current.getSource('facts-heatmap')) {
      map.current.addSource('facts-heatmap', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: facts.map(fact => ({
            type: 'Feature',
            properties: {
              weight: fact.verified ? 2 : 1
            },
            geometry: {
              type: 'Point',
              coordinates: [fact.longitude, fact.latitude]
            }
          }))
        }
      });

      map.current.addLayer({
        id: 'facts-heatmap',
        type: 'heatmap',
        source: 'facts-heatmap',
        maxzoom: 15,
        paint: {
          'heatmap-weight': [
            'interpolate',
            ['linear'],
            ['get', 'weight'],
            0, 0,
            6, 1
          ],
          'heatmap-intensity': [
            'interpolate',
            ['linear'],
            ['zoom'],
            0, 1,
            15, 3
          ],
          'heatmap-color': [
            'interpolate',
            ['linear'],
            ['heatmap-density'],
            0, 'rgba(33,102,172,0)',
            0.2, 'rgb(103,169,207)',
            0.4, 'rgb(209,229,240)',
            0.6, 'rgb(253,219,199)',
            0.8, 'rgb(239,138,98)',
            1, 'rgb(178,24,43)'
          ],
          'heatmap-radius': [
            'interpolate',
            ['linear'],
            ['zoom'],
            0, 2,
            15, 20
          ],
          'heatmap-opacity': [
            'interpolate',
            ['linear'],
            ['zoom'],
            7, 1,
            15, 0
          ]
        }
      });
    }
  }, [facts]);

  // Handle map center changes from store (for location navigation) - Enhanced with state-of-the-art animations
  useEffect(() => {
    if (map.current && mapCenter) {
      console.log('Centering map on:', mapCenter);
      
      // Add a subtle pulse animation to the target location before centering
      const tempMarker = new mapboxgl.Marker({
        element: (() => {
          const el = document.createElement('div');
          el.className = 'pulse-marker';
          el.style.cssText = `
            width: 40px;
            height: 40px;
            border-radius: 50%;
            background: radial-gradient(circle, hsl(var(--primary)) 0%, hsl(var(--primary)/0.3) 70%, transparent 100%);
            animation: pulse 2s ease-in-out;
            pointer-events: none;
            z-index: 1000;
          `;
          return el;
        })()
      })
        .setLngLat(mapCenter)
        .addTo(map.current);

      // Smooth flyTo animation with easing
      map.current.flyTo({
        center: mapCenter,
        zoom: 17,
        duration: 2000,
        essential: true,
        curve: 1.2,
        speed: 0.8,
        easing: (t) => t * (2 - t) // Custom easeOut function for smooth deceleration
      });
      
      // Remove pulse marker and clear mapCenter after animation
      setTimeout(() => {
        tempMarker.remove();
        setMapCenter(null);
      }, 2500);
    }
  }, [mapCenter, setMapCenter]);

  // Search functionality
  const handleSearch = useCallback(async (query: string) => {
    if (!query.trim() || !map.current || !mapboxToken) return;

    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?access_token=${mapboxToken}&limit=5`
      );
      const data = await response.json();
      
      if (data.features && data.features.length > 0) {
        const [lng, lat] = data.features[0].center;
        map.current.flyTo({
          center: [lng, lat],
          zoom: 12,
          duration: 2000
        });
      }
    } catch (error) {
      console.error('Search error:', error);
    }
  }, [mapboxToken]); // Add mapboxToken as dependency

  // Fly to user location
  const flyToUserLocation = useCallback(() => {
    if (userLocation && map.current) {
      map.current.flyTo({
        center: userLocation,
        zoom: 15,
        duration: 2000
      });
    }
  }, [userLocation]);

  return (
    <div className={cn("relative w-full h-full rounded-xl overflow-hidden", className)}>
      {/* Map Container */}
      <div ref={mapContainer} className="absolute inset-0" />
      
      {/* Loading Overlay - Enhanced */}
      {isLoading && (
        <div className="absolute inset-0 bg-background/95 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="text-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary/20 border-t-primary mx-auto"></div>
            <p className="text-sm font-medium text-muted-foreground">Loading interactive map...</p>
          </div>
        </div>
      )}

      {/* Search Bar - only show if enabled */}
      {showBuiltInSearch && (
        <Card className="absolute top-4 left-4 right-4 z-10 bg-card/95 backdrop-blur border-border">
          <div className="flex items-center gap-3 p-4">
            <Search className="w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Search locations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch(searchQuery)}
              className="border-0 bg-transparent focus-visible:ring-0 text-foreground placeholder:text-muted-foreground"
            />
          </div>
        </Card>
      )}

      {/* Map Style Controls - using emoji icons as requested */}
      {showControls && (
        <div className="absolute top-1/2 -translate-y-1/2 left-4 z-10">
          <TooltipProvider>
            <div className="flex flex-col gap-1 bg-card/95 backdrop-blur border border-border rounded-lg">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={mapStyle === 'light' ? 'ios' : 'ghost'}
                    size="sm"
                    onClick={() => setMapStyle('light')}
                    className="haptic-feedback p-2"
                  >
                    <span className="text-lg">☀️</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Light mode</TooltipContent>
              </Tooltip>
              
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={mapStyle === 'dark' ? 'ios' : 'ghost'}
                    size="sm"
                    onClick={() => setMapStyle('dark')}
                    className="haptic-feedback p-2"
                  >
                    <span className="text-lg">🌙</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Dark mode</TooltipContent>
              </Tooltip>
              
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={mapStyle === 'satellite' ? 'ios' : 'ghost'}
                    size="sm"
                    onClick={() => setMapStyle('satellite')}
                    className="haptic-feedback p-2"
                  >
                    <span className="text-lg">🛰️</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Satellite view</TooltipContent>
              </Tooltip>
              
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={mapStyle === 'terrain' ? 'ios' : 'ghost'}
                    size="sm"
                    onClick={() => setMapStyle('terrain')}
                    className="haptic-feedback p-2"
                  >
                    <span className="text-lg">🏔️</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Terrain view</TooltipContent>
              </Tooltip>
              
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      if (navigator.share) {
                        navigator.share({
                          title: "Check out this location on LocaleLore",
                          url: window.location.href
                        });
                      }
                    }}
                    className="haptic-feedback p-2"
                  >
                    <Share className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Share location</TooltipContent>
              </Tooltip>
            </div>
          </TooltipProvider>
        </div>
      )}

      {/* User Location Button */}
      {userLocation && (
        <Button
          variant="floating"
          size="icon-lg"
          onClick={flyToUserLocation}
          className="absolute bottom-20 right-4 z-10"
        >
          <Locate className="w-6 h-6" />
        </Button>
      )}

      {/* Add custom CSS for enhanced animations */}
      <style>{`
        @keyframes pulse {
          0% {
            transform: scale(0.8);
            opacity: 1;
          }
          50% {
            transform: scale(1.2);
            opacity: 0.7;
          }
          100% {
            transform: scale(1.5);
            opacity: 0;
          }
        }
        .pulse-marker {
          animation: pulse 2s ease-in-out;
        }
      `}</style>
    </div>
  );
};

export default AdvancedMap;