// Ultimate Performance Map - The One Map Component to Rule Them All
import React, { useRef, useEffect, useState, useCallback } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { FactMarker } from '@/types/map';

interface UltimateMapProps {
  onFactClick?: (fact: FactMarker) => void;
  className?: string;
  center?: [number, number];
  zoom?: number;
}

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

  // Initialize map immediately with skeleton
  useEffect(() => {
    if (!mapContainer.current) return;

    const token = 'pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw';
    
    if (!token) {
      console.error('Mapbox token not found');
      return;
    }

    mapboxgl.accessToken = token;

    // Create map with minimal options for fastest load
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/light-v11',
      center: center,
      zoom: zoom,
      antialias: false,
      attributionControl: false,
      logoPosition: 'bottom-right'
    });

    // Load immediately
    map.current.on('load', () => {
      setIsLoaded(true);
    });

    return () => {
      markers.current.forEach(marker => marker.remove());
      map.current?.remove();
    };
  }, [center, zoom]);

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

  return (
    <div className={className}>
      <div ref={mapContainer} className="w-full h-full rounded-lg" />
      {!isLoaded && (
        <div className="absolute inset-0 bg-muted rounded-lg flex items-center justify-center">
          <div className="text-sm text-muted-foreground">Loading map...</div>
        </div>
      )}
    </div>
  );
};

export default UltimateMap;