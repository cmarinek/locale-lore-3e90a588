// Ultimate Performance Map - The One Map Component to Rule Them All
import React, { useRef, useEffect, useState, useCallback } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { FactMarker } from '@/types/map';
import { mapboxService } from '@/services/mapboxService';
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

  // Initialize map with proper token
  useEffect(() => {
    if (!mapContainer.current || !mapboxToken) return;

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

    // Add navigation control
    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

    // Load immediately
    map.current.on('load', () => {
      setIsLoaded(true);
    });

    return () => {
      markers.current.forEach(marker => marker.remove());
      map.current?.remove();
    };
  }, [center, zoom, mapboxToken, mapStyle]);

  // Load facts progressively after map is ready
  useEffect(() => {
    if (!isLoaded) return;

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
        
        // Create simple marker element
        const el = document.createElement('div');
        el.className = 'w-3 h-3 bg-primary rounded-full border border-white cursor-pointer hover:scale-125 transition-transform';
        el.addEventListener('click', () => {
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
      map.current.flyTo({ center: center, zoom: zoom });
    }
  }, [center, zoom]);

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
      map.current.setStyle(getMapStyleUrl(nextStyle));
    }
  }, [mapStyle]);

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
      
      {/* Map Controls */}
      {isLoaded && (
        <EnhancedMapControls
          onZoomIn={handleZoomIn}
          onZoomOut={handleZoomOut}
          onRecenter={handleRecenter}
          onMyLocation={handleMyLocation}
          onStyleChange={handleStyleChange}
          onResetView={handleRecenter}
          position="right"
          className="absolute top-4 right-4 z-10"
        />
      )}

      {/* Favorite Cities */}
      {isLoaded && !citiesLoading && favoriteCities.length > 0 && (
        <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
          <div className="bg-background/90 backdrop-blur-sm rounded-lg p-2 shadow-lg border">
            <div className="flex items-center gap-2 mb-2">
              <Heart className="w-4 h-4 text-primary" />
              <span className="text-xs font-medium">Favorites</span>
            </div>
            <div className="flex flex-col gap-1">
              {favoriteCities.slice(0, 3).map((city, index) => (
                <Button
                  key={index}
                  variant="ghost"
                  size="sm"
                  onClick={() => handleCityClick(city)}
                  className="h-8 px-2 justify-start text-xs"
                >
                  <span className="mr-1">{city.emoji}</span>
                  {city.name}
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