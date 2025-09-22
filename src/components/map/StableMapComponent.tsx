import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { useDiscoveryStore } from '@/stores/discoveryStoreOptimized';
import { FactMarker } from '@/types/map';
import { mapboxService } from '@/services/mapboxService';
import { MapTokenMissing } from './MapTokenMissing';
import { usePerformanceMonitor } from '@/hooks/usePerformanceMonitor';
import { toast } from '@/hooks/use-toast';

interface StableMapProps {
  onFactClick?: (fact: FactMarker) => void;
  className?: string;
  isVisible?: boolean;
}

export const StableMapComponent: React.FC<StableMapProps> = React.memo(({
  onFactClick,
  className = '',
  isVisible = true
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markers = useRef<Map<string, mapboxgl.Marker>>(new Map());
  const isInitialized = useRef(false);
  const cleanupRef = useRef<(() => void) | null>(null);
  
  const [mapboxToken, setMapboxToken] = useState<string | null>(null);
  const [tokenMissing, setTokenMissing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { facts, isLoading: factsLoading } = useDiscoveryStore();
  const { startRenderMeasurement, endRenderMeasurement, metrics } = usePerformanceMonitor(true);

  // Memoized map style to prevent unnecessary re-renders
  const mapStyle = useMemo(() => {
    const isLowEnd = navigator.hardwareConcurrency <= 2;
    return isLowEnd ? 'mapbox://styles/mapbox/light-v11' : 'mapbox://styles/mapbox/streets-v11';
  }, []);

  // Stable token loading - only runs once
  useEffect(() => {
    if (isInitialized.current) return;
    
    let isMounted = true;
    const loadToken = async () => {
      try {
        console.log('🗺️ Loading Mapbox token...');
        const token = await mapboxService.getToken();
        
        if (!isMounted) return;
        
        if (mapboxService.isTokenMissing(token)) {
          setTokenMissing(true);
          setIsLoading(false);
          return;
        }
        
        setMapboxToken(token);
        setTokenMissing(false);
        console.log('🗺️ Token loaded successfully');
      } catch (error) {
        if (isMounted) {
          console.error('Failed to load Mapbox token:', error);
          setError('Failed to load map token');
          setIsLoading(false);
        }
      }
    };
    
    loadToken();
    return () => { isMounted = false; };
  }, []); // Empty dependency array - runs only once

  // Stable map initialization - prevent recreation
  useEffect(() => {
    if (!mapContainer.current || !mapboxToken || tokenMissing || !isVisible || isInitialized.current) {
      return;
    }

    console.log('🗺️ Initializing map...');
    startRenderMeasurement();
    
    try {
      mapboxgl.accessToken = mapboxToken;
      
      // Create map instance with memory-optimized settings
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: mapStyle,
        center: [0, 20],
        zoom: 2,
        // Critical memory optimizations
        antialias: false,
        preserveDrawingBuffer: false,
        renderWorldCopies: false,
        maxZoom: 16,
        maxTileCacheSize: 30, // Very low to prevent memory buildup
        transformRequest: (url) => {
          // Optimize tile requests
          if (url.includes('mapbox://')) {
            return { url: url + '?optimize=true' };
          }
          return { url };
        }
      });

      // Minimal controls to reduce memory usage
      map.current.addControl(
        new mapboxgl.NavigationControl({ 
          showCompass: false,
          showZoom: true,
          visualizePitch: false
        }), 
        'top-right'
      );

      // Optimize map interactions
      map.current.scrollZoom.setWheelZoomRate(0.005); // Smoother zooming

      map.current.on('load', () => {
        console.log('🗺️ Map loaded successfully');
        setIsLoading(false);
        endRenderMeasurement();
        isInitialized.current = true;
      });

      map.current.on('error', (e) => {
        console.error('Map error:', e);
        setError('Map failed to load');
        setIsLoading(false);
      });

      // Critical: Set up cleanup function
      cleanupRef.current = () => {
        console.log('🗺️ Cleaning up map...');
        
        // Clear all markers first
        markers.current.forEach(marker => {
          try {
            marker.remove();
          } catch (e) {
            console.warn('Error removing marker:', e);
          }
        });
        markers.current.clear();
        
        // Remove map instance
        if (map.current) {
          try {
            map.current.remove();
            map.current = null;
          } catch (e) {
            console.warn('Error removing map:', e);
          }
        }
        
        isInitialized.current = false;
      };

    } catch (error) {
      console.error('Map initialization error:', error);
      setError('Failed to initialize map');
      setIsLoading(false);
    }

    // Cleanup on unmount
    return () => {
      if (cleanupRef.current) {
        cleanupRef.current();
      }
    };
  }, [mapboxToken, tokenMissing, isVisible, mapStyle]); // Minimal dependencies

  // Optimized marker updates with memory management
  const updateMarkersStable = useCallback(() => {
    if (!map.current || !isInitialized.current || factsLoading || !facts.length) {
      return;
    }

    console.log(`🗺️ Updating ${facts.length} markers...`);

    // Clear existing markers efficiently
    const startTime = performance.now();
    markers.current.forEach(marker => marker.remove());
    markers.current.clear();

    // Limit markers based on performance
    const zoom = map.current.getZoom();
    const maxMarkers = Math.min(
      zoom > 12 ? 300 : zoom > 8 ? 150 : 50,
      facts.length
    );
    
    const visibleFacts = facts.slice(0, maxMarkers);

    // Create markers in batches to prevent blocking
    const batchSize = 20;
    let processed = 0;

    const processBatch = () => {
      const endIndex = Math.min(processed + batchSize, visibleFacts.length);
      
      for (let i = processed; i < endIndex; i++) {
        const fact = visibleFacts[i];
        
        if (fact.latitude && fact.longitude) {
          try {
            const marker = new mapboxgl.Marker({
              color: fact.status === 'verified' ? '#10B981' : '#F59E0B',
              scale: 0.7 // Smaller for performance
            })
              .setLngLat([fact.longitude, fact.latitude]);

            // Simplified popup to reduce memory
            marker.setPopup(
              new mapboxgl.Popup({ 
                offset: 15, 
                closeButton: false,
                maxWidth: '200px'
              })
                .setHTML(`<div style="padding:8px;"><strong>${fact.title}</strong></div>`)
            );

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

            marker.addTo(map.current!);
            markers.current.set(fact.id, marker);
          } catch (error) {
            console.warn('Failed to create marker:', error);
          }
        }
      }

      processed = endIndex;

      // Continue processing or finish
      if (processed < visibleFacts.length) {
        requestAnimationFrame(processBatch);
      } else {
        const endTime = performance.now();
        console.log(`🗺️ Added ${markers.current.size} markers in ${Math.round(endTime - startTime)}ms`);
      }
    };

    // Start batch processing
    requestAnimationFrame(processBatch);

  }, [facts, factsLoading, onFactClick]);

  // Debounced marker updates to prevent excessive re-renders
  useEffect(() => {
    const timeoutId = setTimeout(updateMarkersStable, 200);
    return () => clearTimeout(timeoutId);
  }, [updateMarkersStable]);

  // Memory usage monitoring
  useEffect(() => {
    if (metrics.memoryUsage && metrics.memoryUsage > 150) {
      console.warn('⚠️ High memory usage detected:', metrics.memoryUsage, 'MB');
      toast({
        title: "Memory Warning",
        description: `High memory usage: ${Math.round(metrics.memoryUsage)}MB. Consider zooming out or refreshing the page.`,
        variant: "destructive"
      });
    }
  }, [metrics.memoryUsage]);

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
        <div className="absolute inset-0 bg-background/90 flex items-center justify-center z-50">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
            <p className="text-sm text-muted-foreground">Loading stable map...</p>
          </div>
        </div>
      )}

      {/* Memory usage indicator - development only */}
      {process.env.NODE_ENV === 'development' && (
        <div className="absolute bottom-4 right-4 bg-black/80 text-white px-3 py-2 rounded text-xs">
          <div>FPS: {Math.round(metrics.fps)}</div>
          <div>Markers: {markers.current.size}</div>
          {metrics.memoryUsage && <div>Memory: {Math.round(metrics.memoryUsage)}MB</div>}
        </div>
      )}
    </div>
  );
});

StableMapComponent.displayName = 'StableMapComponent';

export default StableMapComponent;