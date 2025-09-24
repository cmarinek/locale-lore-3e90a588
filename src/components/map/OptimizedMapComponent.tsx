import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import * as mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { useDiscoveryStore } from '@/stores/discoveryStore';
import { FactMarker } from '@/types/map';
import { mapboxService } from '@/services/mapboxService';
import { MapTokenMissing } from './MapTokenMissing';
import { MapPerformanceDashboard } from '@/components/ui/map-performance-dashboard';
import { usePerformanceMonitor } from '@/hooks/usePerformanceMonitor';
import { toast } from '@/hooks/use-toast';

interface OptimizedMapProps {
  onFactClick?: (fact: FactMarker) => void;
  className?: string;
  isVisible?: boolean;
}

export const OptimizedMapComponent: React.FC<OptimizedMapProps> = ({
  onFactClick,
  className = '',
  isVisible = true
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markers = useRef<Map<string, mapboxgl.Marker>>(new Map());
  const markersCluster = useRef<mapboxgl.GeoJSONSource | null>(null);
  const animationFrame = useRef<number>();
  
  const [isLoading, setIsLoading] = useState(true);
  const [mapboxToken, setMapboxToken] = useState<string | null>(null);
  const [tokenMissing, setTokenMissing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { facts, isLoading: factsLoading } = useDiscoveryStore();
  const { startRenderMeasurement, endRenderMeasurement, metrics } = usePerformanceMonitor(true);

  // Optimized map style based on performance
  const mapStyle = useMemo(() => {
    const pixelRatio = window.devicePixelRatio || 1;
    const isLowEnd = navigator.hardwareConcurrency <= 2 || pixelRatio < 2;
    
    // Use lightweight styles for better performance
    return isLowEnd 
      ? 'mapbox://styles/mapbox/light-v11'  // Fastest loading
      : 'mapbox://styles/mapbox/streets-v11'; // Balanced performance
  }, []);

  // Debounced token loading
  useEffect(() => {
    let isMounted = true;
    const loadToken = async () => {
      try {
        startRenderMeasurement();
        const token = await mapboxService.getToken();
        
        if (!isMounted) return;
        
        if (mapboxService.isTokenMissing(token)) {
          setTokenMissing(true);
          setIsLoading(false);
          return;
        }
        
        setMapboxToken(token);
        setTokenMissing(false);
        endRenderMeasurement();
      } catch (error) {
        if (isMounted) {
          console.error('Failed to load Mapbox token:', error);
          setError('Failed to load map token');
          setTokenMissing(true);
          setIsLoading(false);
        }
      }
    };
    
    loadToken();
    return () => { isMounted = false; };
  }, [startRenderMeasurement, endRenderMeasurement]);

  // Optimized map initialization
  useEffect(() => {
    if (!mapContainer.current || !mapboxToken || tokenMissing || !isVisible) return;

    startRenderMeasurement();
    
    try {
      (mapboxgl as any).accessToken = mapboxToken;
      
      // Performance-optimized map configuration
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: mapStyle,
        center: [0, 20],
        zoom: 2,
        // Performance optimizations
        antialias: false, // Disable for better performance
        preserveDrawingBuffer: false,
        renderWorldCopies: false,
        maxZoom: 16, // Limit max zoom to reduce memory usage
        // Reduce tile loading
        maxTileCacheSize: 50 // Reduce from default 500
      });

      // Add minimal controls only
      map.current.addControl(
        new mapboxgl.NavigationControl({ 
          showCompass: false, // Remove compass to save memory
          showZoom: true,
          visualizePitch: false
        }), 
        'top-right'
      );

      // Disable unused interactions for better performance
      map.current.scrollZoom.setWheelZoomRate(0.01); // Slower zoom for better control
      map.current.scrollZoom.setZoomRate(0.01);

      map.current.on('load', () => {
        console.log('🗺️ Map loaded successfully');
        setIsLoading(false);
        endRenderMeasurement();
        
        // Performance warning if load took too long
        if (metrics.renderTime > 3000) {
          toast({
            title: "Map Performance Warning",
            description: `Map took ${Math.round(metrics.renderTime / 1000)}s to load. Consider upgrading your device or internet connection.`,
            variant: "destructive"
          });
        }
      });

      map.current.on('error', (e) => {
        console.error('Map error:', e);
        setError('Map failed to load');
        setIsLoading(false);
      });

      // Memory cleanup on style change
      map.current.on('styledata', () => {
        // Clear any cached data when style changes
        if (markersCluster.current) {
          markersCluster.current.setData({ type: 'FeatureCollection', features: [] });
        }
      });

    } catch (error) {
      console.error('Map initialization error:', error);
      setError('Failed to initialize map');
      setIsLoading(false);
    }

    return () => {
      if (animationFrame.current) {
        cancelAnimationFrame(animationFrame.current);
      }
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
      // Clear all markers to free memory
      markers.current.forEach(marker => marker.remove());
      markers.current.clear();
    };
  }, [mapboxToken, tokenMissing, isVisible, mapStyle, startRenderMeasurement, endRenderMeasurement, metrics.renderTime]);

  // Optimized marker clustering with performance monitoring
  const updateMarkers = useCallback(() => {
    if (!map.current || factsLoading || !facts.length) return;

    startRenderMeasurement();

    // Clear existing markers efficiently
    markers.current.forEach(marker => marker.remove());
    markers.current.clear();

    // Limit markers based on zoom level for performance
    const zoom = map.current.getZoom();
    const maxMarkers = zoom > 10 ? 500 : zoom > 8 ? 200 : 100;
    const visibleFacts = facts.slice(0, maxMarkers);

    // Batch marker creation for better performance
    const markersToAdd: Array<{ marker: mapboxgl.Marker, id: string }> = [];

    visibleFacts.forEach((fact) => {
      if (fact.latitude && fact.longitude) {
        try {
          const marker = new mapboxgl.Marker({
            color: fact.status === 'verified' ? '#10B981' : '#F59E0B',
            scale: 0.8 // Smaller markers for better performance
          })
            .setLngLat([fact.longitude, fact.latitude])
            .setPopup(
              new mapboxgl.Popup({ offset: 25, closeButton: false })
                .setHTML(`
                  <div class="p-2 max-w-xs">
                    <h3 class="font-semibold text-sm">${fact.title}</h3>
                    <p class="text-xs text-gray-600 mt-1">Click for details</p>
                  </div>
                `)
            );

          markersToAdd.push({ marker, id: fact.id });

          // Add click handler
          marker.getElement().addEventListener('click', () => {
            const factMarker: FactMarker = {
              id: fact.id,
              title: fact.title,
              latitude: fact.latitude!,
              longitude: fact.longitude!,
              category: fact.categories?.category_translations?.[0]?.name || 'Unknown',
              voteScore: (fact.vote_count_up || 0) - (fact.vote_count_down || 0),
              verified: fact.status === 'verified',
              authorName: fact.profiles?.username || 'Anonymous'
            };
            onFactClick?.(factMarker);
          });
        } catch (error) {
          console.warn('Failed to create marker for fact:', fact.id, error);
        }
      }
    });

    // Add all markers in a single batch using requestAnimationFrame
    animationFrame.current = requestAnimationFrame(() => {
      markersToAdd.forEach(({ marker, id }) => {
        try {
          marker.addTo(map.current!);
          markers.current.set(id, marker);
        } catch (error) {
          console.warn('Failed to add marker to map:', id, error);
        }
      });
      
      endRenderMeasurement();
      console.log(`🗺️ Added ${markersToAdd.length} markers to map (${facts.length} total facts)`);
    });

  }, [facts, factsLoading, onFactClick, startRenderMeasurement, endRenderMeasurement]);

  // Update markers when facts change, with debouncing
  useEffect(() => {
    const timeoutId = setTimeout(updateMarkers, 100);
    return () => clearTimeout(timeoutId);
  }, [updateMarkers]);

  // Performance monitoring
  useEffect(() => {
    if (metrics.fps < 30) {
      console.warn('⚠️ Map performance degraded - FPS:', metrics.fps);
    }
  }, [metrics.fps]);

  if (tokenMissing) {
    return <MapTokenMissing />;
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full bg-muted">
        <div className="text-center p-6">
          <h3 className="text-lg font-semibold mb-2">Map Error</h3>
          <p className="text-muted-foreground">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
          >
            Reload Page
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      <div ref={mapContainer} className="w-full h-full" />
      
      {isLoading && (
        <div className="absolute inset-0 bg-background/80 flex items-center justify-center z-50">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
            <p className="text-sm text-muted-foreground">Loading optimized map...</p>
          </div>
        </div>
      )}

      {/* Performance indicator - development only */}
      {process.env.NODE_ENV === 'development' && (
        <MapPerformanceDashboard 
          markersCount={markers.current.size}
          isVisible={true}
        />
      )}
    </div>
  );
};

export default OptimizedMapComponent;