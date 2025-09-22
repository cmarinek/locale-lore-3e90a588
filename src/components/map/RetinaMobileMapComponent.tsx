import React, { useEffect, useRef, useState, useCallback } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { useDiscoveryStore } from '@/stores/discoveryStore';
import { FactMarker } from '@/types/map';
import { TouchControls, AccessibleMapControls } from '@/components/ui/enhanced-touch-controls';
import { AccessibilityPanel, AccessibilityTrigger } from '@/components/ui/accessibility-features';
import { useOfflineMap } from '@/hooks/useOfflineMap';
import { useAdaptivePerformance } from '@/hooks/useAdaptivePerformance';
import { useAdvancedGestures } from '@/hooks/useAdvancedGestures';
import { useAppStore } from '@/stores/appStore';
import { cdnManager } from '@/utils/scaling/cdn-config';
import { useProductionMonitoring } from '@/hooks/useProductionMonitoring';
import { useRequestOptimization } from '@/hooks/useRequestOptimization';
import { NetworkAwareFallback, ErrorBoundaryWithRetry, MapFallback } from '@/components/ui/graceful-degradation';

interface RetinaMobileMapProps {
  onFactClick?: (fact: FactMarker) => void;
  className?: string;
  isVisible?: boolean;
}

export const RetinaMobileMapComponent: React.FC<RetinaMobileMapProps> = ({
  onFactClick,
  className = '',
  isVisible = true
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markers = useRef<Map<string, mapboxgl.Marker>>(new Map());
  
  const { startMonitoring, trackMapLoad, reportError } = useProductionMonitoring();
  const { getOptimizedFactClusters, healthCheck } = useRequestOptimization();
  const clustersSource = useRef<mapboxgl.GeoJSONSource | null>(null);
  
  const [isLoading, setIsLoading] = useState(true);
  const [currentZoom, setCurrentZoom] = useState(2);
  const [accessibilityOpen, setAccessibilityOpen] = useState(false);
  
  const { facts, isLoading: factsLoading } = useDiscoveryStore();
  const { triggerHapticFeedback } = useAppStore();
  
  // Hooks for mobile optimization
  const offlineMap = useOfflineMap();
  const adaptivePerf = useAdaptivePerformance();

  // Map style optimized for different screen densities
  const getOptimizedMapStyle = useCallback(() => {
    const pixelRatio = window.devicePixelRatio || 1;
    const isRetina = pixelRatio >= 2;
    const tileQuality = adaptivePerf.performanceSettings.tileQuality;
    
    // Choose appropriate style based on device capabilities
    if (tileQuality === 'low' || !isRetina) {
      return 'mapbox://styles/mapbox/light-v11';
    } else if (tileQuality === 'medium') {
      return 'mapbox://styles/mapbox/streets-v12';
    } else {
      return 'mapbox://styles/mapbox/satellite-streets-v12';
    }
  }, [adaptivePerf.performanceSettings.tileQuality]);

  // Initialize map with retina optimization
  useEffect(() => {
    if (!mapContainer.current) return;

    const pixelRatio = window.devicePixelRatio || 1;
    
    mapboxgl.accessToken = process.env.REACT_APP_MAPBOX_TOKEN || '';
    
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: getOptimizedMapStyle(),
      center: [0, 20],
      zoom: 2,
      minZoom: 1,
      maxZoom: 18,
      // Mobile optimizations (removed pixelRatio as it's not in MapOptions)
      antialias: pixelRatio >= 2,
      // Mobile optimizations
      dragRotate: false, // Disable rotation on mobile
      pitchWithRotate: false,
      touchZoomRotate: true,
      // Performance settings
      preserveDrawingBuffer: false,
      renderWorldCopies: false
    });

    // Add retina-optimized controls
    const nav = new mapboxgl.NavigationControl({
      showCompass: false,
      showZoom: false,
      visualizePitch: false
    });
    
    map.current.addControl(nav, 'top-right');

    // Performance monitoring
    map.current.on('render', () => {
      // Adaptive performance adjustments
      if (adaptivePerf.performanceScore < 30) {
        // Reduce visual quality
        if (map.current) {
          map.current.setLayoutProperty('water', 'visibility', 'none');
        }
      }
    });

    // Mobile gesture optimizations
    map.current.on('load', () => {
      setIsLoading(false);
      
      // Disable double-tap zoom (we'll handle it with gestures)
      map.current?.doubleClickZoom.disable();
      
      // Add offline tile caching
      if (offlineMap.isOfflineMode) {
        enableOfflineTiles();
      }
    });

    // Zoom tracking for adaptive controls
    map.current.on('zoom', () => {
      setCurrentZoom(map.current?.getZoom() || 2);
    });

    return () => {
      markers.current.forEach(marker => marker.remove());
      markers.current.clear();
      map.current?.remove();
    };
  }, [getOptimizedMapStyle, adaptivePerf.performanceScore, offlineMap.isOfflineMode]);

  // Advanced gesture handling
  const gestureHandlers = useAdvancedGestures(mapContainer, {
    onPinch: (scale, center) => {
      if (!map.current) return;
      
      const currentZoom = map.current.getZoom();
      const newZoom = currentZoom + Math.log2(scale);
      
      map.current.setZoom(Math.max(1, Math.min(18, newZoom)));
      triggerHapticFeedback('light');
    },
    
    onPan: (translation, velocity) => {
      if (!map.current) return;
      
      const center = map.current.getCenter();
      const newCenter = new mapboxgl.LngLat(
        center.lng - translation.x * 0.001,
        center.lat + translation.y * 0.001
      );
      
      map.current.setCenter(newCenter);
    },
    
    onDoubleTap: (point) => {
      if (!map.current) return;
      
      map.current.zoomTo(map.current.getZoom() + 1, {
        duration: 300
      });
      triggerHapticFeedback('medium');
    },
    
    onLongPress: (point) => {
      triggerHapticFeedback('heavy');
      // Could trigger context menu or info popup
    }
  });

  // Offline tile caching
  const enableOfflineTiles = useCallback(() => {
    if (!map.current) return;
    
    const style = map.current.getStyle();
    
    Object.keys(style.sources).forEach(sourceId => {
      const source = style.sources[sourceId];
      if (source.type === 'raster' && source.tiles) {
        // Cache current viewport tiles
        const bounds = map.current!.getBounds();
        const zoom = Math.floor(map.current!.getZoom());
        
        // Implement tile caching logic here
        cacheTilesForBounds(bounds, zoom);
      }
    });
  }, []);

  const cacheTilesForBounds = useCallback((bounds: mapboxgl.LngLatBounds, zoom: number) => {
    // Calculate tile coordinates for bounds
    const sw = bounds.getSouthWest();
    const ne = bounds.getNorthEast();
    
    // Simplified tile caching - would need proper tile math
    for (let z = Math.max(1, zoom - 1); z <= Math.min(18, zoom + 1); z++) {
      // Cache tiles for this zoom level
      const tileKey = `${z}-${sw.lng}-${sw.lat}-${ne.lng}-${ne.lat}`;
      // offlineMap.cacheTile(tileUrl, tileKey);
    }
  }, []);

  // Optimized fact rendering based on performance
  useEffect(() => {
    if (!map.current || !facts.length || !isVisible) return;

    const maxMarkers = adaptivePerf.performanceSettings.maxMarkers;
    const clusterDistance = adaptivePerf.performanceSettings.clusterDistance;
    
    // Clear existing markers
    markers.current.forEach(marker => marker.remove());
    markers.current.clear();

    // Convert EnhancedFact to FactMarker for compatibility
    const factMarkers: FactMarker[] = facts.slice(0, maxMarkers).map(fact => ({
      id: fact.id,
      title: fact.title,
      latitude: fact.latitude,
      longitude: fact.longitude,
      category: fact.categories?.slug || 'unknown',
      verified: fact.status === 'verified',
      voteScore: (fact.vote_count_up || 0) - (fact.vote_count_down || 0),
      authorName: fact.profiles?.username || 'Anonymous'
    }));
    
    if (currentZoom >= 10) {
      // Show individual markers at high zoom
      factMarkers.forEach(fact => {
        const el = document.createElement('div');
        el.className = 'custom-marker';
        el.style.cssText = `
          width: 24px;
          height: 24px;
          background: hsl(var(--primary));
          border: 2px solid white;
          border-radius: 50%;
          cursor: pointer;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
          transform: translate(-50%, -50%);
        `;
        
        const marker = new mapboxgl.Marker({
          element: el,
          anchor: 'center'
        })
          .setLngLat([fact.longitude, fact.latitude])
          .addTo(map.current!);

        el.addEventListener('click', () => {
          onFactClick?.(fact);
          triggerHapticFeedback('light');
        });

        markers.current.set(fact.id, marker);
      });
    } else {
      // Use clustering at lower zoom levels
      renderClusters(factMarkers, clusterDistance);
    }
  }, [facts, currentZoom, isVisible, adaptivePerf.performanceSettings, onFactClick, triggerHapticFeedback]);

  // Clustering implementation
  const renderClusters = useCallback((facts: FactMarker[], clusterDistance: number) => {
    if (!map.current) return;

    // Simple clustering algorithm - group nearby points
    const clusters: { [key: string]: FactMarker[] } = {};
    
    facts.forEach(fact => {
      const key = `${Math.floor(fact.latitude / clusterDistance)}-${Math.floor(fact.longitude / clusterDistance)}`;
      if (!clusters[key]) clusters[key] = [];
      clusters[key].push(fact);
    });

    // Render cluster markers
    Object.values(clusters).forEach(clusterFacts => {
      if (clusterFacts.length === 0) return;
      
      const centerLat = clusterFacts.reduce((sum, f) => sum + f.latitude, 0) / clusterFacts.length;
      const centerLng = clusterFacts.reduce((sum, f) => sum + f.longitude, 0) / clusterFacts.length;
      
      const el = document.createElement('div');
      el.className = 'cluster-marker';
      
      if (clusterFacts.length === 1) {
        // Single fact
        el.style.cssText = `
          width: 24px;
          height: 24px;
          background: hsl(var(--primary));
          border: 2px solid white;
          border-radius: 50%;
          cursor: pointer;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        `;
        
        el.addEventListener('click', () => {
          onFactClick?.(clusterFacts[0]);
          triggerHapticFeedback('light');
        });
      } else {
        // Cluster
        el.style.cssText = `
          width: 36px;
          height: 36px;
          background: hsl(var(--primary));
          border: 3px solid white;
          border-radius: 50%;
          cursor: pointer;
          box-shadow: 0 2px 6px rgba(0,0,0,0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: bold;
          font-size: 12px;
        `;
        el.textContent = clusterFacts.length.toString();
        
        el.addEventListener('click', () => {
          map.current?.flyTo({
            center: [centerLng, centerLat],
            zoom: Math.min(currentZoom + 2, 15),
            duration: 1000
          });
          triggerHapticFeedback('medium');
        });
      }

      const marker = new mapboxgl.Marker({
        element: el,
        anchor: 'center'
      })
        .setLngLat([centerLng, centerLat])
        .addTo(map.current!);

      markers.current.set(`cluster-${centerLat}-${centerLng}`, marker);
    });
  }, [currentZoom, onFactClick, triggerHapticFeedback]);

  // Touch-optimized controls
  const handleZoomIn = useCallback(() => {
    if (map.current) {
      map.current.zoomTo(Math.min(currentZoom + 1, 18), { duration: 300 });
      triggerHapticFeedback('light');
    }
  }, [currentZoom, triggerHapticFeedback]);

  const handleZoomOut = useCallback(() => {
    if (map.current) {
      map.current.zoomTo(Math.max(currentZoom - 1, 1), { duration: 300 });
      triggerHapticFeedback('light');
    }
  }, [currentZoom, triggerHapticFeedback]);

  const handleRecenter = useCallback(() => {
    if (map.current) {
      map.current.flyTo({ center: [0, 20], zoom: 2, duration: 1000 });
      triggerHapticFeedback('medium');
    }
  }, [triggerHapticFeedback]);

  const handleLocation = useCallback(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition((position) => {
        if (map.current) {
          map.current.flyTo({
            center: [position.coords.longitude, position.coords.latitude],
            zoom: 12,
            duration: 1000
          });
          triggerHapticFeedback('medium');
        }
      });
    }
  }, [triggerHapticFeedback]);

  if (!isVisible) return null;

  return (
    <div className={`relative h-full w-full ${className}`}>
      {/* Map Container */}
      <div ref={mapContainer} className="h-full w-full" />
      
      {/* Loading overlay */}
      {(isLoading || factsLoading) && (
        <div className="absolute inset-0 bg-background/50 backdrop-blur-sm flex items-center justify-center z-10">
          <div className="bg-background rounded-lg p-4 shadow-lg">
            <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">Loading map...</p>
          </div>
        </div>
      )}

      {/* Touch-optimized controls */}
      <TouchControls
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onRecenter={handleRecenter}
        onLocation={handleLocation}
        position="right"
      />

      {/* Accessibility controls */}
      <AccessibleMapControls
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onRecenter={handleRecenter}
        onLocation={handleLocation}
        currentZoom={currentZoom}
        maxZoom={18}
        minZoom={1}
      />

      {/* Accessibility trigger */}
      <AccessibilityTrigger onClick={() => setAccessibilityOpen(true)} />

      {/* Accessibility panel */}
      <AccessibilityPanel
        isOpen={accessibilityOpen}
        onClose={() => setAccessibilityOpen(false)}
      />

      {/* Performance indicator (dev mode) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="absolute top-4 left-4 bg-background/90 backdrop-blur-sm rounded-lg p-2 text-xs space-y-1">
          <div>FPS: {adaptivePerf.performanceScore.toFixed(0)}</div>
          <div>Quality: {adaptivePerf.performanceSettings.tileQuality}</div>
          <div>Markers: {adaptivePerf.performanceSettings.maxMarkers}</div>
          {offlineMap.isOfflineMode && (
            <div className="text-orange-500">Offline Mode</div>
          )}
        </div>
      )}
    </div>
  );
};