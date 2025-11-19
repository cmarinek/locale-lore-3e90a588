import React, { useEffect, useRef, memo, useCallback } from 'react';
import mapboxgl from 'mapbox-gl';
import { FactMarker } from '@/types/map';

interface MapMarkersProps {
  onFactClick?: (fact: any) => void;
  facts?: FactMarker[];
  isLoading?: boolean;
  isVisible?: boolean;
}

const MapMarkers = memo(({ onFactClick, facts = [], isLoading, isVisible }: MapMarkersProps) => {
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const mapRef = useRef<mapboxgl.Map | null>(null);

  // Get map instance from global state or context
  useEffect(() => {
    const findMapInstance = () => {
      const mapContainer = document.querySelector('.mapboxgl-map');
      if (mapContainer && (mapContainer as any)._map) {
        mapRef.current = (mapContainer as any)._map;
      }
    };

    const interval = setInterval(findMapInstance, 100);
    setTimeout(() => clearInterval(interval), 5000);

    return () => clearInterval(interval);
  }, []);

  const createMarkerElement = useCallback((fact: FactMarker) => {
    const el = document.createElement('div');
    el.className = 'custom-marker';
    el.style.cssText = `
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: hsl(var(--primary));
      border: 2px solid white;
      cursor: pointer;
      box-shadow: 0 2px 8px rgba(0,0,0,0.3);
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 12px;
      font-weight: bold;
      transition: transform 0.2s ease;
    `;
    
    el.textContent = fact.verified ? '✓' : '?';
    
    el.addEventListener('mouseenter', () => {
      el.style.transform = 'scale(1.1)';
    });
    
    el.addEventListener('mouseleave', () => {
      el.style.transform = 'scale(1)';
    });
    
    el.addEventListener('click', (e) => {
      e.stopPropagation();
      onFactClick?.(fact);
    });

    return el;
  }, [onFactClick]);

  const updateMarkers = useCallback(() => {
    if (!mapRef.current || !isVisible) return;

    // Clear existing markers efficiently
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    // Limit markers based on zoom level for performance
    const zoom = mapRef.current.getZoom();
    const maxMarkers = zoom < 10 ? 100 : zoom < 12 ? 200 : 500;
    const factsToShow = facts.slice(0, maxMarkers);

    // Batch marker creation
    requestAnimationFrame(() => {
      factsToShow.forEach(fact => {
        try {
          const el = createMarkerElement(fact);
          const marker = new mapboxgl.Marker(el)
            .setLngLat([fact.longitude, fact.latitude])
            .addTo(mapRef.current);
          
          markersRef.current.push(marker);
        } catch (error) {
          console.warn('Failed to create marker:', error);
        }
      });
    });
  }, [facts, isVisible, createMarkerElement]);

  // Update markers when facts change
  useEffect(() => {
    if (!isLoading) {
      updateMarkers();
    }
  }, [facts, isLoading, updateMarkers]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      markersRef.current.forEach(marker => marker.remove());
      markersRef.current = [];
    };
  }, []);

  return null; // This component doesn't render anything directly
});

MapMarkers.displayName = 'MapMarkers';

export default MapMarkers;