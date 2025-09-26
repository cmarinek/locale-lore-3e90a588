// Ultimate Performance Map - The One Map Component to Rule Them All
import React, { useRef, useEffect, useState, useCallback } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { FactMarker } from '@/types/map';
import { mapboxService } from '@/services/mapboxService';
import { ultraFastGeoService } from '@/services/ultraFastGeoService';
import { MapTokenMissing } from './MapTokenMissing';
import { EnhancedMapControls } from './EnhancedMapControls';
import { useFavoriteCities } from '@/hooks/useFavoriteCities';
import { Button } from '@/components/ui/button';
import { Heart } from 'lucide-react';

interface UltimateMapProps {
  onFactClick?: (fact: FactMarker) => void;
  className?: string;
  center?: [number, number];
  zoom?: number;
}

type MapStyle = 'light' | 'dark' | 'satellite';

// Ultra-simple cache with localStorage persistence
const CACHE_KEY = 'map-facts-cache';
const CACHE_TTL = 60000; // 1 minute

const getCache = (): { data: FactMarker[], timestamp: number } | null => {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (!cached) return null;
    const parsed = JSON.parse(cached);
    if (Date.now() - parsed.timestamp > CACHE_TTL) {
      localStorage.removeItem(CACHE_KEY);
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
};

const setCache = (data: FactMarker[]) => {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({
      data,
      timestamp: Date.now()
    }));
  } catch {
    // Storage full, ignore
  }
};

// Simple fetch function - no clustering, no complexity
const fetchFacts = async (): Promise<FactMarker[]> => {
  const cached = getCache();
  if (cached) return cached.data;

  try {
    const { supabase } = await import('@/integrations/supabase/client');
    const { data, error } = await supabase
      .from('facts')
      .select(`
        id, title, latitude, longitude, 
        vote_count_up, vote_count_down,
        categories!inner(slug)
      `)
      .eq('status', 'verified')
      .limit(200);

    if (error) throw error;

    const facts: FactMarker[] = (data || []).map(fact => ({
      id: fact.id,
      title: fact.title,
      latitude: fact.latitude,
      longitude: fact.longitude,
      category: fact.categories?.slug || 'general',
      verified: true,
      voteScore: fact.vote_count_up - fact.vote_count_down,
      authorName: 'Community'
    }));

    setCache(facts);
    return facts;
  } catch (error) {
    console.error('Error fetching facts:', error);
    return [];
  }
};

const UltimateMap: React.FC<UltimateMapProps> = ({
  onFactClick,
  className = "w-full h-96",
  center = [0, 0],
  zoom = 2
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markers = useRef<mapboxgl.Marker[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [facts, setFacts] = useState<FactMarker[]>([]);
  const [mapboxToken, setMapboxToken] = useState<string | null>(null);
  const [tokenLoading, setTokenLoading] = useState(true);
  const [mapStyle, setMapStyle] = useState<MapStyle>('light');
  const { favoriteCities, loading: citiesLoading } = useFavoriteCities();
  
  // Store current view state to prevent resets
  const currentViewRef = useRef({ center, zoom });

  // Load Mapbox token first
  useEffect(() => {
    const loadToken = async () => {
      try {
        const token = await mapboxService.getToken();
        if (token) {
          setMapboxToken(token);
        }
      } catch (error) {
        console.error('Failed to load Mapbox token:', error);
      } finally {
        setTokenLoading(false);
      }
    };

    loadToken();
  }, []);

  // Track if map is initialized to prevent resets
  const isInitializedRef = useRef(false);

  // Initialize map with proper token (only once)
  useEffect(() => {
    if (!mapContainer.current || !mapboxToken || isInitializedRef.current) return;

    mapboxgl.accessToken = mapboxToken;

    // Create map with minimal options for fastest load
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: getMapStyleUrl(mapStyle),
      center: center,
      zoom: zoom,
      antialias: false,
      attributionControl: false,
      logoPosition: 'bottom-right'
    });

    // Custom controls only - no native Mapbox controls

    // Load immediately
    map.current.on('load', () => {
      setIsLoaded(true);
    });

    // Store current view state on move
    map.current.on('moveend', () => {
      if (map.current) {
        currentViewRef.current = {
          center: [map.current.getCenter().lng, map.current.getCenter().lat] as [number, number],
          zoom: map.current.getZoom()
        };
      }
    });

    // Mark as initialized
    isInitializedRef.current = true;

    return () => {
      markers.current.forEach(marker => marker.remove());
      map.current?.remove();
      isInitializedRef.current = false;
    };
  }, [mapboxToken]);

  // Handle map style changes separately without resetting position
  useEffect(() => {
    if (!map.current || !isLoaded) return;
    
    map.current.setStyle(getMapStyleUrl(mapStyle));
  }, [mapStyle, isLoaded]);

  // Load facts progressively after map is ready
  useEffect(() => {
    if (!isLoaded) return;
    
    // Clear cache to get fresh data with images
    ultraFastGeoService.clearCache();
    fetchFacts().then(setFacts);
  }, [isLoaded]);

  // Add markers simply and efficiently
  useEffect(() => {
    if (!map.current || !isLoaded || facts.length === 0) return;

    // Clear existing markers
    markers.current.forEach(marker => marker.remove());
    markers.current = [];
    
    // Add markers in batches for smooth performance
    const addMarkersInBatch = (startIndex: number) => {
      const batchSize = 20;
      const endIndex = Math.min(startIndex + batchSize, facts.length);
      
      for (let i = startIndex; i < endIndex; i++) {
        const fact = facts[i];
        
        // Create marker element with image preview
        const el = document.createElement('div');
        el.className = 'w-8 h-8 rounded-full border-2 border-white shadow-lg cursor-pointer hover:scale-110 transition-transform overflow-hidden bg-primary';
        el.title = fact.title; // Add tooltip with fact title
        
        if (fact.imageUrl) {
          const img = document.createElement('img');
          img.src = fact.imageUrl;
          img.className = 'w-full h-full object-cover';
          img.alt = fact.title;
          el.appendChild(img);
        } else {
          // Fallback icon for facts without images
          el.innerHTML = `<div class="w-full h-full flex items-center justify-center text-white text-xs">📍</div>`;
        }
        el.addEventListener('click', (e) => {
          e.stopPropagation(); // Prevent event bubbling to map
          if (onFactClick) onFactClick(fact);
        });

        // Add marker to map
        const marker = new mapboxgl.Marker(el)
          .setLngLat([fact.longitude, fact.latitude])
          .addTo(map.current!);
        
        markers.current.push(marker);
      }

      // Continue with next batch
      if (endIndex < facts.length) {
        requestAnimationFrame(() => addMarkersInBatch(endIndex));
      }
    };

    // Start batch processing
    addMarkersInBatch(0);

    return () => {
      markers.current.forEach(marker => marker.remove());
      markers.current = [];
    };
  }, [facts, isLoaded, onFactClick]);

  // Map control handlers
  const handleZoomIn = useCallback(() => {
    if (map.current) {
      map.current.zoomIn();
    }
  }, []);

  const handleZoomOut = useCallback(() => {
    if (map.current) {
      map.current.zoomOut();
    }
  }, []);

  const handleRecenter = useCallback(() => {
    if (map.current) {
      // Use stored view state if available, otherwise use initial props
      const targetCenter = currentViewRef.current.center;
      const targetZoom = currentViewRef.current.zoom;
      map.current.flyTo({ center: targetCenter, zoom: targetZoom });
    }
  }, []);

  const handleMyLocation = useCallback(() => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        if (map.current) {
          map.current.flyTo({
            center: [position.coords.longitude, position.coords.latitude],
            zoom: 14
          });
        }
      },
      (error) => {
        console.error('Error getting location:', error);
      }
    );
  }, []);

  const handleStyleChange = useCallback(() => {
    const styles: MapStyle[] = ['light', 'dark', 'satellite'];
    const currentIndex = styles.indexOf(mapStyle);
    const nextStyle = styles[(currentIndex + 1) % styles.length];
    setMapStyle(nextStyle);
    
    if (map.current) {
      // Store current map state
      const currentCenter = map.current.getCenter();
      const currentZoom = map.current.getZoom();
      const currentBearing = map.current.getBearing();
      const currentPitch = map.current.getPitch();
      
      map.current.setStyle(getMapStyleUrl(nextStyle));
      
      // Restore map state and markers after style loads
      map.current.once('styledata', () => {
        // Restore view state
        map.current!.jumpTo({
          center: currentCenter,
          zoom: currentZoom,
          bearing: currentBearing,
          pitch: currentPitch
        });
        
        // Re-add all markers
        facts.forEach(fact => {
          const el = document.createElement('div');
          el.className = 'w-8 h-8 rounded-full border-2 border-white shadow-lg cursor-pointer hover:scale-110 transition-transform overflow-hidden bg-primary';
          el.title = fact.title; // Add tooltip with fact title
          
          if (fact.imageUrl) {
            const img = document.createElement('img');
            img.src = fact.imageUrl;
            img.className = 'w-full h-full object-cover';
            img.alt = fact.title;
            el.appendChild(img);
          } else {
            // Fallback icon for facts without images
            el.innerHTML = `<div class="w-full h-full flex items-center justify-center text-white text-xs">📍</div>`;
          }
          el.addEventListener('click', (e) => {
            e.stopPropagation(); // Prevent event bubbling to map
            if (onFactClick) onFactClick(fact);
          });

          const newMarker = new mapboxgl.Marker(el)
            .setLngLat([fact.longitude, fact.latitude])
            .addTo(map.current!);
          
          markers.current.push(newMarker);
        });
      });
    }
  }, [mapStyle, facts, onFactClick]);

  const handleCityClick = useCallback((city: any) => {
    if (map.current) {
      map.current.flyTo({
        center: [city.lng, city.lat],
        zoom: 12
      });
    }
  }, []);

  // Show token missing component if no token
  if (tokenLoading) {
    return (
      <div className={className}>
        <div className="w-full h-full rounded-lg bg-muted flex items-center justify-center">
          <div className="text-sm text-muted-foreground">Loading map...</div>
        </div>
      </div>
    );
  }

  if (!mapboxToken) {
    return (
      <div className={className}>
        <MapTokenMissing />
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      <div ref={mapContainer} className="w-full h-full rounded-lg" />
      
      {/* Map Controls - Responsive positioning */}
      {isLoaded && (
        <EnhancedMapControls
          onZoomIn={handleZoomIn}
          onZoomOut={handleZoomOut}
          onRecenter={handleRecenter}
          onMyLocation={handleMyLocation}
          onStyleChange={handleStyleChange}
          onResetView={handleRecenter}
          position="left"
        />
      )}

      {/* Favorite Cities - Responsive positioning */}
      {isLoaded && !citiesLoading && favoriteCities.length > 0 && (
        <div className="absolute top-2 left-2 md:top-4 md:left-4 z-10 flex flex-col gap-2">
          <div className="bg-background/90 backdrop-blur-sm rounded-lg p-2 shadow-lg border max-w-[200px] md:max-w-none">
            <div className="flex items-center gap-2 mb-2">
              <Heart className="w-3 h-3 md:w-4 md:h-4 text-primary" />
              <span className="text-xs font-medium">Favorites</span>
            </div>
            <div className="flex flex-col gap-1">
              {favoriteCities.slice(0, 3).map((city, index) => (
                <Button
                  key={index}
                  variant="ghost"
                  size="sm"
                  onClick={() => handleCityClick(city)}
                  className="h-6 md:h-8 px-1 md:px-2 justify-start text-xs"
                >
                  <span className="mr-1 text-xs">{city.emoji}</span>
                  <span className="truncate">{city.name}</span>
                </Button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Loading overlay */}
      {!isLoaded && (
        <div className="absolute inset-0 bg-muted rounded-lg flex items-center justify-center">
          <div className="text-sm text-muted-foreground">Loading map...</div>
        </div>
      )}
    </div>
  );
};

// Helper function to get map style URL
const getMapStyleUrl = (style: MapStyle): string => {
  switch (style) {
    case 'light':
      return 'mapbox://styles/mapbox/light-v11';
    case 'dark':
      return 'mapbox://styles/mapbox/dark-v11';
    case 'satellite':
      return 'mapbox://styles/mapbox/satellite-v9';
    default:
      return 'mapbox://styles/mapbox/light-v11';
  }
};

export default UltimateMap;