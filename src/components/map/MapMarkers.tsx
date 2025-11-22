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

    // Use category color or default to primary
    const bgColor = fact.categoryColor || 'hsl(var(--primary))';
    const verifiedBadge = fact.verified
      ? '<div style="position: absolute; top: -4px; right: -4px; width: 16px; height: 16px; background: #10b981; border: 2px solid white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 10px;">✓</div>'
      : '';

    el.style.cssText = `
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: ${bgColor};
      border: 3px solid white;
      cursor: pointer;
      box-shadow: 0 3px 12px rgba(0,0,0,0.4);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 18px;
      transition: all 0.2s ease;
      position: relative;
    `;

    // Use category icon or fallback to pin
    el.innerHTML = `
      <span style="filter: drop-shadow(0 1px 2px rgba(0,0,0,0.3));">
        ${fact.categoryIcon || '📍'}
      </span>
      ${verifiedBadge}
    `;

    el.addEventListener('mouseenter', () => {
      el.style.transform = 'scale(1.15)';
      el.style.zIndex = '1000';
    });

    el.addEventListener('mouseleave', () => {
      el.style.transform = 'scale(1)';
      el.style.zIndex = '';
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

          // Create popup with fact details
          const popup = new mapboxgl.Popup({
            offset: 25,
            closeButton: true,
            closeOnClick: false,
            maxWidth: '300px'
          }).setHTML(`
            <div style="padding: 8px; font-family: system-ui, -apple-system, sans-serif;">
              <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
                <span style="font-size: 20px;">${fact.categoryIcon || '📍'}</span>
                <h3 style="margin: 0; font-size: 16px; font-weight: 600; line-height: 1.3; flex: 1;">
                  ${fact.title}
                </h3>
              </div>
              ${fact.description ? `
                <p style="margin: 0 0 8px 0; font-size: 13px; color: #666; line-height: 1.4; max-height: 60px; overflow: hidden; text-overflow: ellipsis;">
                  ${fact.description.substring(0, 120)}${fact.description.length > 120 ? '...' : ''}
                </p>
              ` : ''}
              <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 8px; font-size: 12px; color: #888;">
                <span>👍 ${fact.voteScore}</span>
                ${fact.verified ? '<span style="color: #10b981;">✓ Verified</span>' : '<span style="color: #f59e0b;">⏳ Pending</span>'}
              </div>
              <a
                href="/fact/${fact.id}"
                style="display: inline-block; padding: 6px 12px; background: hsl(var(--primary)); color: white; text-decoration: none; border-radius: 6px; font-size: 13px; font-weight: 500; transition: opacity 0.2s;"
                onmouseover="this.style.opacity='0.9'"
                onmouseout="this.style.opacity='1'"
              >
                View Details →
              </a>
            </div>
          `);

          const marker = new mapboxgl.Marker(el)
            .setLngLat([fact.longitude, fact.latitude])
            .setPopup(popup)
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