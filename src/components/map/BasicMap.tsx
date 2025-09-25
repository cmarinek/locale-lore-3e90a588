// Basic Map - Lightweight fallback component
import React, { useRef, useEffect, useState, useCallback } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { FactMarker } from '@/types/map';
import { geoService, ViewportBounds } from '@/services/geoService';

interface BasicMapProps {
  onFactClick?: (fact: FactMarker) => void;
  className?: string;
  center?: [number, number];
  zoom?: number;
}

const BasicMap: React.FC<BasicMapProps> = ({
  onFactClick,
  className = "w-full h-96",
  center = [0, 0],
  zoom = 2
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [facts, setFacts] = useState<FactMarker[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  const fetchFacts = useCallback(async () => {
    if (!map.current) return;

    const bounds = map.current.getBounds();
    const viewportBounds: ViewportBounds = {
      north: bounds.getNorth(),
      south: bounds.getSouth(),
      east: bounds.getEast(),
      west: bounds.getWest()
    };

    try {
      const result = await geoService.getFactsForBounds(viewportBounds, map.current.getZoom());
      setFacts(result);
    } catch (error) {
      console.error('Error fetching facts:', error);
    }
  }, []);

  useEffect(() => {
    if (!mapContainer.current) return;

    const token = 'pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw';
    
    if (!token) {
      console.error('Mapbox token not found');
      return;
    }

    mapboxgl.accessToken = token;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/light-v11',
      center: center,
      zoom: zoom,
      antialias: false
    });

    map.current.on('load', () => {
      setIsLoaded(true);
      fetchFacts();
    });

    let timeout: NodeJS.Timeout;
    const handleMove = () => {
      clearTimeout(timeout);
      timeout = setTimeout(fetchFacts, 300);
    };

    map.current.on('moveend', handleMove);

    return () => {
      clearTimeout(timeout);
      map.current?.remove();
    };
  }, [center, zoom, fetchFacts]);

  useEffect(() => {
    if (!map.current || !isLoaded) return;

    // Simple marker rendering
    const markers: mapboxgl.Marker[] = [];
    
    facts.forEach(fact => {
      const el = document.createElement('div');
      el.className = 'w-3 h-3 bg-primary rounded-full border border-white cursor-pointer';
      el.addEventListener('click', () => {
        if (onFactClick) onFactClick(fact);
      });

      const marker = new mapboxgl.Marker(el)
        .setLngLat([fact.longitude, fact.latitude])
        .addTo(map.current!);
      
      markers.push(marker);
    });

    return () => {
      markers.forEach(marker => marker.remove());
    };
  }, [facts, isLoaded, onFactClick]);

  return (
    <div className={className}>
      <div ref={mapContainer} className="w-full h-full rounded-lg" />
    </div>
  );
};

export default BasicMap;