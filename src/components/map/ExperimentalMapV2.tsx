import React, { useRef, useEffect, useCallback, memo, useMemo } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { ErrorBoundary } from 'react-error-boundary';
import { mapboxService } from '@/services/mapboxService';
import { useDiscoveryStore } from '@/stores/discoveryStore';
import { usePerformanceMonitor } from '@/hooks/usePerformanceMonitor';
import { FactMarker } from '@/types/map';

interface ExperimentalMapV2Props {
  onFactClick?: (fact: any) => void;
  className?: string;
  isVisible?: boolean;
}

const MapErrorFallback = ({ error, resetErrorBoundary }: any) => (
  <div className="flex items-center justify-center h-full bg-muted/50 rounded-lg">
    <div className="text-center p-6">
      <h3 className="font-semibold text-lg mb-2">Map Error</h3>
      <p className="text-muted-foreground mb-4">Something went wrong loading the map</p>
      <button 
        onClick={resetErrorBoundary}
        className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
      >
        Retry
      </button>
    </div>
  </div>
);

const ExperimentalMapV2 = memo(({ onFactClick, className = "", isVisible = true }: ExperimentalMapV2Props) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const { startRenderMeasurement, endRenderMeasurement } = usePerformanceMonitor();
  
  const { facts, isLoading } = useDiscoveryStore();

  // Convert facts to markers format
  const factMarkers = useMemo(() => 
    facts.map(fact => ({
      id: fact.id,
      title: fact.title,
      latitude: fact.latitude,
      longitude: fact.longitude,
      category: fact.categories?.category_translations?.[0]?.name || 'unknown',
      verified: fact.status === 'verified',
      voteScore: fact.vote_count_up - fact.vote_count_down,
      authorName: fact.profiles?.username
    })), [facts]);

  // Map style change handler
  const handleStyleChange = useCallback((style: string) => {
    if (!map.current) return;
    
    const styleMap = {
      light: 'mapbox://styles/mapbox/light-v11',
      dark: 'mapbox://styles/mapbox/dark-v11',
      satellite: 'mapbox://styles/mapbox/satellite-v9',
      terrain: 'mapbox://styles/mapbox/outdoors-v12'
    };
    
    const mapStyle = styleMap[style as keyof typeof styleMap] || styleMap.light;
    map.current.setStyle(mapStyle);
    console.log('🎨 Map style changed to:', style);
  }, []);

  // Zoom controls
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

  // Reset view handler
  const handleResetView = useCallback(() => {
    if (map.current) {
      map.current.flyTo({
        center: [-74.5, 40],
        zoom: 9,
        duration: 1000
      });
    }
  }, []);

  // Share location handler
  const handleShareLocation = useCallback(() => {
    if (!navigator.geolocation) {
      console.warn('Geolocation not supported');
      return;
    }
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        if (map.current) {
          map.current.flyTo({
            center: [longitude, latitude],
            zoom: 15,
            duration: 1000
          });
        }
      },
      (error) => {
        console.warn('Error getting location:', error);
      }
    );
  }, []);

  // Initialize map
  const initializeMap = useCallback(async () => {
    if (!mapContainer.current || map.current) return;

    try {
      startRenderMeasurement();
      
      const token = await mapboxService.getToken();
      if (!token) {
        console.error('No Mapbox token available');
        return;
      }

      mapboxgl.accessToken = token;

      // Create map with React 18 optimizations
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/light-v11',
        center: [-74.5, 40],
        zoom: 9,
        // Performance optimizations for React 18
        antialias: false,
        maxTileCacheSize: 50,
        cooperativeGestures: false,
        scrollZoom: { around: 'center' }
      });

      // Add navigation controls
      map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

      map.current.on('load', () => {
        endRenderMeasurement();
        console.log('🗺️ Experimental Map V2 loaded successfully');
      });

      map.current.on('error', (e) => {
        console.error('Map error:', e);
      });

    } catch (error) {
      console.error('Failed to initialize experimental map:', error);
    }
  }, [startRenderMeasurement, endRenderMeasurement]);

  // Create marker element
  const createMarkerElement = useCallback((fact: FactMarker) => {
    const el = document.createElement('div');
    el.className = 'experimental-marker';
    el.style.cssText = `
      width: 36px;
      height: 36px;
      border-radius: 50%;
      background: ${fact.verified ? 'hsl(var(--primary))' : 'hsl(var(--muted-foreground))'};
      border: 3px solid white;
      cursor: pointer;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 14px;
      font-weight: bold;
      transition: all 0.2s ease;
      position: relative;
    `;
    
    el.textContent = fact.verified ? '✓' : '?';
    
    // Hover effects
    el.addEventListener('mouseenter', () => {
      el.style.transform = 'scale(1.15)';
      el.style.zIndex = '1000';
    });
    
    el.addEventListener('mouseleave', () => {
      el.style.transform = 'scale(1)';
      el.style.zIndex = '100';
    });
    
    // Click handler
    el.addEventListener('click', (e) => {
      e.stopPropagation();
      if (onFactClick) {
        // Convert back to full fact format
        const fullFact = facts.find(f => f.id === fact.id);
        if (fullFact) {
          onFactClick(fullFact);
        }
      }
    });

    return el;
  }, [onFactClick, facts]);

  // Update markers when facts change
  const updateMarkers = useCallback(() => {
    if (!map.current || !isVisible) return;

    // Clear existing markers efficiently
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    console.log(`🎯 Adding ${factMarkers.length} markers to experimental map`);

    // Batch marker creation for better performance
    requestAnimationFrame(() => {
      factMarkers.forEach(fact => {
        try {
          const el = createMarkerElement(fact);
          const marker = new mapboxgl.Marker(el)
            .setLngLat([fact.longitude, fact.latitude])
            .addTo(map.current!);
          
          markersRef.current.push(marker);
        } catch (error) {
          console.warn('Failed to create experimental marker:', error);
        }
      });
    });
  }, [factMarkers, isVisible, createMarkerElement]);

  // Initialize map
  useEffect(() => {
    if (isVisible) {
      initializeMap();
    }

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [isVisible, initializeMap]);

  // Update markers when facts change
  useEffect(() => {
    if (map.current && !isLoading) {
      // Wait for map to be fully loaded
      if (map.current.isStyleLoaded()) {
        updateMarkers();
      } else {
        map.current.on('load', updateMarkers);
      }
    }
  }, [factMarkers, isLoading, updateMarkers]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      markersRef.current.forEach(marker => marker.remove());
      markersRef.current = [];
    };
  }, []);

  if (!isVisible) {
    return <div className={className} />;
  }

  return (
    <div className={`relative ${className}`}>
      <div 
        ref={mapContainer} 
        className="absolute inset-0 w-full h-full"
        style={{ minHeight: '100%' }}
      />
      
      {/* Map Style Controls - Left Side (50vh) */}
      <div className="absolute top-1/2 left-4 transform -translate-y-1/2 z-20 flex flex-col gap-2 mr-2">
        <div className="flex flex-col bg-background/90 backdrop-blur-sm rounded-lg border shadow-lg overflow-hidden">
          <button
            onClick={() => handleStyleChange('light')}
            className="px-3 py-2 text-xs hover:bg-muted/50 transition-colors border-0 rounded-none bg-transparent text-foreground"
            title="Light Style"
          >
            🌞 Light
          </button>
          <button
            onClick={() => handleStyleChange('dark')}
            className="px-3 py-2 text-xs hover:bg-muted/50 transition-colors border-t border-0 rounded-none bg-transparent text-foreground"
            title="Dark Style"
          >
            🌙 Dark
          </button>
          <button
            onClick={() => handleStyleChange('satellite')}
            className="px-3 py-2 text-xs hover:bg-muted/50 transition-colors border-t border-0 rounded-none bg-transparent text-foreground"
            title="Satellite Style"
          >
            🛰️ Satellite
          </button>
          <button
            onClick={() => handleStyleChange('terrain')}
            className="px-3 py-2 text-xs hover:bg-muted/50 transition-colors border-t border-0 rounded-none bg-transparent text-foreground"
            title="Terrain Style"
          >
            🏔️ Terrain
          </button>
        </div>
      </div>

      {/* Zoom Controls - Left Side (50vh) - Offset */}
      <div className="absolute top-1/2 left-20 transform -translate-y-1/2 z-20 flex flex-col gap-2">
        <div className="flex flex-col bg-background/90 backdrop-blur-sm rounded-lg border shadow-lg overflow-hidden">
          <button
            onClick={() => handleZoomIn()}
            className="p-3 hover:bg-muted/50 transition-colors border-0 rounded-none bg-transparent text-foreground"
            title="Zoom In"
          >
            ➕
          </button>
          <button
            onClick={() => handleZoomOut()}
            className="p-3 hover:bg-muted/50 transition-colors border-t border-0 rounded-none bg-transparent text-foreground"
            title="Zoom Out"
          >
            ➖
          </button>
        </div>
      </div>

      {/* Navigation Controls - Right Side (50vh) */}
      <div className="absolute top-1/2 right-4 transform -translate-y-1/2 z-20 flex flex-col gap-2">
        <div className="flex flex-col bg-background/90 backdrop-blur-sm rounded-lg border shadow-lg overflow-hidden">
          <button
            onClick={() => handleResetView()}
            className="p-3 hover:bg-muted/50 transition-colors border-0 rounded-none bg-transparent text-foreground"
            title="Reset View"
          >
            🧭
          </button>
          <button
            onClick={() => handleShareLocation()}
            className="p-3 hover:bg-muted/50 transition-colors border-t border-0 rounded-none bg-transparent text-foreground"
            title="Share Location"
          >
            📍
          </button>
        </div>
      </div>

      {/* Debug info in development */}
      {process.env.NODE_ENV === 'development' && (
        <div className="absolute bottom-4 left-4 z-20 bg-black/80 text-white p-2 rounded text-xs">
          Experimental V2 • {factMarkers.length} markers
        </div>
      )}
    </div>
  );
});

ExperimentalMapV2.displayName = 'ExperimentalMapV2';

const ExperimentalMapV2WithErrorBoundary: React.FC<ExperimentalMapV2Props> = (props) => (
  <ErrorBoundary FallbackComponent={MapErrorFallback}>
    <ExperimentalMapV2 {...props} />
  </ErrorBoundary>
);

export default ExperimentalMapV2WithErrorBoundary;