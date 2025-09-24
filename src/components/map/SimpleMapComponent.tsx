import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { mapboxService } from '@/services/mapboxService';
import { MapTokenMissing } from './MapTokenMissing';
import { FactMarker } from '@/types/map';
import { useDiscoveryStore } from '@/stores/discoveryStore';

interface SimpleMapComponentProps {
  onFactClick?: (fact: FactMarker) => void;
  className?: string;
  isVisible?: boolean;
  center?: [number, number];
  zoom?: number;
}

export const SimpleMapComponent: React.FC<SimpleMapComponentProps> = ({
  onFactClick,
  className = '',
  isVisible = true,
  center = [-74.5, 40],
  zoom = 9
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markers = useRef<mapboxgl.Marker[]>([]);
  
  const [isLoading, setIsLoading] = useState(true);
  const [tokenMissing, setTokenMissing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { facts } = useDiscoveryStore();

  // Fetch Mapbox token and initialize map
  useEffect(() => {
    if (!isVisible || !mapContainer.current) return;

    const initializeMap = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const token = await mapboxService.getToken();
        if (!token) {
          setTokenMissing(true);
          setIsLoading(false);
          return;
        }

        mapboxgl.accessToken = token;

        if (map.current) {
          map.current.remove();
        }

        map.current = new mapboxgl.Map({
          container: mapContainer.current,
          style: 'mapbox://styles/mapbox/light-v11',
          center,
          zoom,
          antialias: false,
          maxTileCacheSize: 50
        });

        map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

        map.current.on('load', () => {
          setIsLoading(false);
          console.log('🗺️ Map loaded successfully');
        });

        map.current.on('error', (e) => {
          console.error('Map error:', e);
          setError('Failed to load map');
          setIsLoading(false);
        });

      } catch (error) {
        console.error('Failed to initialize map:', error);
        setError('Failed to initialize map');
        setIsLoading(false);
      }
    };

    initializeMap();

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [isVisible, center, zoom]);

  // Update markers when facts change
  useEffect(() => {
    if (!map.current || !facts) return;

    // Clear existing markers
    markers.current.forEach(marker => marker.remove());
    markers.current = [];

    // Add new markers
    facts.slice(0, 100).forEach(fact => { // Limit to 100 facts for performance
      if (!fact.latitude || !fact.longitude) return;

      const el = document.createElement('div');
      el.className = 'map-marker';
      el.style.cssText = `
        width: 24px;
        height: 24px;
        border-radius: 50%;
        background: #3B82F6;
        border: 2px solid white;
        cursor: pointer;
        box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        transition: transform 0.2s;
      `;

      el.addEventListener('mouseenter', () => {
        el.style.transform = 'scale(1.1)';
      });

      el.addEventListener('mouseleave', () => {
        el.style.transform = 'scale(1)';
      });

      if (onFactClick) {
        el.addEventListener('click', () => {
          const factMarker: FactMarker = {
            id: fact.id,
            title: fact.title,
            latitude: fact.latitude,
            longitude: fact.longitude,
            category: fact.categories?.slug || 'unknown',
            verified: fact.status === 'verified' || false,
            voteScore: (fact.vote_count_up || 0) - (fact.vote_count_down || 0),
            authorName: fact.profiles?.username || 'Anonymous'
          };
          onFactClick(factMarker);
        });
      }

      const marker = new mapboxgl.Marker(el)
        .setLngLat([fact.longitude, fact.latitude])
        .setPopup(
          new mapboxgl.Popup({ offset: 25 })
            .setHTML(`
              <div class="p-2">
                <h3 class="font-semibold text-sm">${fact.title}</h3>
                <p class="text-xs text-gray-600 mt-1">${fact.categories?.category_translations?.[0]?.name || 'Unknown'}</p>
              </div>
            `)
        )
        .addTo(map.current);

      markers.current.push(marker);
    });
  }, [facts, onFactClick]);

  if (tokenMissing) {
    return <MapTokenMissing />;
  }

  if (error) {
    return (
      <div className={`flex items-center justify-center h-full ${className}`}>
        <div className="text-center p-6">
          <p className="text-red-600 mb-2">Map Error</p>
          <p className="text-sm text-gray-600 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Reload
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative w-full h-full ${className}`}>
      <div ref={mapContainer} className="absolute inset-0 w-full h-full" />
      {isLoading && (
        <div className="absolute inset-0 bg-gray-50 flex items-center justify-center">
          <div className="flex flex-col items-center space-y-3">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent"></div>
            <p className="text-sm text-gray-600">Loading map...</p>
          </div>
        </div>
      )}
    </div>
  );
};