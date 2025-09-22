import React, { useRef, useEffect, useCallback, memo, useMemo } from 'react';
import mapboxgl from 'mapbox-gl';
import Supercluster from 'supercluster';
import 'mapbox-gl/dist/mapbox-gl.css';
import { ErrorBoundary } from 'react-error-boundary';
import { mapboxService } from '@/services/mapboxService';
import { useDiscoveryStore } from '@/stores/discoveryStore';
import { usePerformanceMonitor } from '@/hooks/usePerformanceMonitor';
import { FactMarker } from '@/types/map';
import { ClusterPoint, Cluster, MapFeature } from '@/types/clustering';
import { Loader2 } from 'lucide-react';

interface ClusteredMapProps {
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

const ClusteredMap = memo(({ onFactClick, className = "", isVisible = true }: ClusteredMapProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const superclusterRef = useRef<Supercluster | null>(null);
  const isInitializedRef = useRef(false);
  const lastZoomRef = useRef<number>(9);
  
  const { startRenderMeasurement, endRenderMeasurement } = usePerformanceMonitor();
  const { facts, isLoading } = useDiscoveryStore();

  // Map styles
  const mapStyles = {
    light: 'mapbox://styles/mapbox/light-v11',
    dark: 'mapbox://styles/mapbox/dark-v11',
    satellite: 'mapbox://styles/mapbox/satellite-v9',
    terrain: 'mapbox://styles/mapbox/outdoors-v12'
  };

  // Convert facts to clustering format
  const clusterPoints = useMemo<ClusterPoint[]>(() => 
    facts.map(fact => ({
      type: 'Feature' as const,
      geometry: {
        type: 'Point' as const,
        coordinates: [fact.longitude, fact.latitude] as [number, number]
      },
      properties: {
        id: fact.id,
        title: fact.title,
        category: fact.categories?.category_translations?.[0]?.name || 'unknown',
        verified: fact.status === 'verified',
        voteScore: fact.vote_count_up - fact.vote_count_down,
        authorName: fact.profiles?.username
      }
    })), [facts]);

  // Initialize Supercluster
  useEffect(() => {
    if (clusterPoints.length > 0) {
      superclusterRef.current = new Supercluster({
        radius: 80,
        maxZoom: 16,
        minZoom: 0,
        minPoints: 2
      });
      
      superclusterRef.current.load(clusterPoints);
      console.log('🔄 Supercluster initialized with', clusterPoints.length, 'points');
    }
  }, [clusterPoints]);

  // Initialize map
  const initializeMap = useCallback(async () => {
    if (!mapContainer.current || map.current || isInitializedRef.current) return;

    try {
      startRenderMeasurement();
      
      const token = await mapboxService.getToken();
      if (!token) {
        console.error('No Mapbox token available');
        return;
      }

      mapboxgl.accessToken = token;
      isInitializedRef.current = true;

      // Create map with optimizations
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: mapStyles.light,
        center: [-74.5, 40],
        zoom: 9,
        antialias: false,
        maxTileCacheSize: 50,
        cooperativeGestures: false
      });

      // Add controls - positioned for mobile-first design
      const nav = new mapboxgl.NavigationControl({ 
        visualizePitch: true,
        showCompass: true,
        showZoom: true
      });
      
      // Position native controls at center-right on mobile, top-right on desktop
      map.current.addControl(nav, 'top-right');
      
      // Style the native controls for mobile accessibility
      setTimeout(() => {
        const navControl = mapContainer.current?.querySelector('.mapboxgl-ctrl-top-right');
        if (navControl instanceof HTMLElement) {
          navControl.style.cssText = `
            top: 50% !important;
            right: 16px !important;
            transform: translateY(-50%) !important;
            transition: all 0.3s ease !important;
          `;
          
          // Apply desktop positioning on larger screens
          const mediaQuery = window.matchMedia('(min-width: 640px)');
          const handleResize = (e: MediaQueryListEvent | MediaQueryList) => {
            if (e.matches) {
              navControl.style.cssText = `
                top: 16px !important;
                right: 16px !important;
                transform: none !important;
                transition: all 0.3s ease !important;
              `;
            } else {
              navControl.style.cssText = `
                top: 50% !important;
                right: 16px !important;
                transform: translateY(-50%) !important;
                transition: all 0.3s ease !important;
              `;
            }
          };
          
          handleResize(mediaQuery);
          mediaQuery.addEventListener('change', handleResize);
        }
      }, 100);

      // Event listeners
      map.current.on('load', () => {
        endRenderMeasurement();
        updateMarkers();
        console.log('🗺️ Clustered map loaded successfully');
      });

      map.current.on('zoom', () => {
        const currentZoom = map.current?.getZoom() || 9;
        // Only update if zoom changed significantly (performance optimization)
        if (Math.abs(currentZoom - lastZoomRef.current) > 0.5) {
          lastZoomRef.current = currentZoom;
          updateMarkers();
        }
      });

      map.current.on('moveend', () => {
        updateMarkers();
      });

      map.current.on('error', (e) => {
        console.error('Map error:', e);
      });

    } catch (error) {
      console.error('Failed to initialize clustered map:', error);
      isInitializedRef.current = false;
    }
  }, [startRenderMeasurement, endRenderMeasurement]);

  // Create marker element for individual points
  const createMarkerElement = useCallback((point: ClusterPoint) => {
    const el = document.createElement('div');
    el.className = 'clustered-marker';
    el.style.cssText = `
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: ${point.properties.verified ? 'hsl(var(--primary))' : 'hsl(var(--muted-foreground))'};
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
    
    el.textContent = point.properties.verified ? '✓' : '?';
    
    // Hover effects
    el.addEventListener('mouseenter', () => {
      el.style.transform = 'scale(1.2)';
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
        const fullFact = facts.find(f => f.id === point.properties.id);
        if (fullFact) {
          onFactClick(fullFact);
        }
      }
    });

    return el;
  }, [onFactClick, facts]);

  // Create cluster element
  const createClusterElement = useCallback((cluster: Cluster) => {
    const el = document.createElement('div');
    el.className = 'cluster-marker';
    
    const size = Math.min(50, 30 + (cluster.properties.point_count / 10));
    
    el.style.cssText = `
      width: ${size}px;
      height: ${size}px;
      border-radius: 50%;
      background: hsl(var(--primary));
      border: 3px solid white;
      cursor: pointer;
      box-shadow: 0 4px 12px rgba(0,0,0,0.4);
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: ${Math.min(16, 10 + cluster.properties.point_count / 5)}px;
      font-weight: bold;
      transition: transform 0.2s ease;
    `;
    
    el.textContent = cluster.properties.point_count_abbreviated;
    
    // Hover effects
    el.addEventListener('mouseenter', () => {
      el.style.transform = 'scale(1.1)';
      el.style.backgroundColor = 'hsl(var(--primary)/0.8)';
    });
    
    el.addEventListener('mouseleave', () => {
      el.style.transform = 'scale(1)';
      el.style.backgroundColor = 'hsl(var(--primary))';
    });
    
    // Click to expand cluster
    el.addEventListener('click', (e) => {
      e.stopPropagation();
      if (map.current && superclusterRef.current) {
        const expansionZoom = superclusterRef.current.getClusterExpansionZoom(cluster.properties.cluster_id);
        map.current.flyTo({
          center: cluster.coordinates,
          zoom: expansionZoom,
          duration: 500
        });
      }
    });

    return el;
  }, []);

  // Update markers based on current viewport
  const updateMarkers = useCallback(() => {
    if (!map.current || !superclusterRef.current || !isVisible) return;

    // Clear existing markers
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    const bounds = map.current.getBounds();
    const zoom = Math.floor(map.current.getZoom());
    
    // Get clusters/points for current viewport
    const clusters = superclusterRef.current.getClusters([
      bounds.getWest(),
      bounds.getSouth(),
      bounds.getEast(),
      bounds.getNorth()
    ], zoom);

    console.log(`🎯 Rendering ${clusters.length} clusters/points at zoom ${zoom}`);

    // Batch marker creation for performance
    requestAnimationFrame(() => {
      clusters.forEach((feature: any) => {
        const [lng, lat] = feature.geometry.coordinates;
        
        let el: HTMLElement;
        
        if (feature.properties?.cluster) {
          // It's a cluster - create cluster element
          el = createClusterElement({
            id: feature.properties.cluster_id.toString(),
            coordinates: [lng, lat],
            properties: {
              cluster: true,
              cluster_id: feature.properties.cluster_id,
              point_count: feature.properties.point_count,
              point_count_abbreviated: feature.properties.point_count_abbreviated || feature.properties.point_count.toString()
            }
          });
        } else {
          // It's an individual point - create marker element
          el = createMarkerElement({
            type: 'Feature',
            geometry: feature.geometry,
            properties: feature.properties
          });
        }
        
        const marker = new mapboxgl.Marker(el)
          .setLngLat([lng, lat])
          .addTo(map.current!);
        
        markersRef.current.push(marker);
      });
    });
  }, [isVisible, createMarkerElement, createClusterElement]);

  // Map style controls
  const handleStyleChange = useCallback((style: keyof typeof mapStyles) => {
    if (map.current) {
      map.current.setStyle(mapStyles[style]);
      console.log('🎨 Map style changed to:', style);
    }
  }, []);

  // Reset view
  const handleResetView = useCallback(() => {
    if (map.current) {
      map.current.flyTo({
        center: [-74.5, 40],
        zoom: 9,
        duration: 1000
      });
    }
  }, []);

  // Get user location
  const handleMyLocation = useCallback(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          if (map.current) {
            map.current.flyTo({
              center: [position.coords.longitude, position.coords.latitude],
              zoom: 15,
              duration: 1000
            });
          }
        },
        (error) => console.warn('Location error:', error)
      );
    }
  }, []);

  // Initialize map when visible
  useEffect(() => {
    if (isVisible) {
      initializeMap();
    }

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
        isInitializedRef.current = false;
      }
    };
  }, [isVisible, initializeMap]);

  // Update markers when facts change or map loads
  useEffect(() => {
    if (map.current && !isLoading && superclusterRef.current) {
      if (map.current.isStyleLoaded()) {
        updateMarkers();
      } else {
        map.current.once('load', updateMarkers);
      }
    }
  }, [facts, isLoading, updateMarkers]);

  // Cleanup markers on unmount
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
      
      {/* Mobile-first Controls - Positioned at 50vh for optimal thumb reach */}
      <div className="absolute top-1/2 left-4 -translate-y-1/2 sm:top-4 sm:translate-y-0 z-20 flex flex-col gap-3">
        {/* Style Controls */}
        <div className="flex flex-col bg-background/95 backdrop-blur-md rounded-lg border shadow-lg overflow-hidden">
          {Object.keys(mapStyles).map((style) => (
            <button
              key={style}
              onClick={() => handleStyleChange(style as keyof typeof mapStyles)}
              className="px-4 py-3 sm:px-3 sm:py-2 text-sm sm:text-xs hover:bg-muted/50 transition-colors border-0 rounded-none bg-transparent text-foreground first:border-t-0 border-t min-h-[44px] sm:min-h-0 flex items-center justify-start gap-2"
              title={`${style.charAt(0).toUpperCase() + style.slice(1)} Style`}
            >
              <span className="text-base sm:text-sm">
                {style === 'light' ? '🌞' : style === 'dark' ? '🌙' : style === 'satellite' ? '🛰️' : '🏔️'}
              </span>
              <span className="hidden sm:inline">
                {style.charAt(0).toUpperCase() + style.slice(1)}
              </span>
            </button>
          ))}
        </div>

        {/* Navigation Controls */}
        <div className="flex flex-col bg-background/95 backdrop-blur-md rounded-lg border shadow-lg overflow-hidden">
          <button
            onClick={handleResetView}
            className="p-4 sm:p-3 hover:bg-muted/50 transition-colors border-0 rounded-none bg-transparent text-foreground min-h-[44px] sm:min-h-0 flex items-center justify-center"
            title="Reset View"
            aria-label="Reset map view"
          >
            <span className="text-lg sm:text-base">🧭</span>
          </button>
          <button
            onClick={handleMyLocation}
            className="p-4 sm:p-3 hover:bg-muted/50 transition-colors border-t border-0 rounded-none bg-transparent text-foreground min-h-[44px] sm:min-h-0 flex items-center justify-center"
            title="My Location"
            aria-label="Go to my location"
          >
            <span className="text-lg sm:text-base">📍</span>
          </button>
        </div>
      </div>

      {/* Loading indicator */}
      {isLoading && (
        <div className="absolute top-4 right-4 z-20 bg-background/90 backdrop-blur-sm rounded-lg border shadow-lg p-3">
          <div className="flex items-center gap-2 text-sm">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading facts...
          </div>
        </div>
      )}

      {/* Debug info in development */}
      {process.env.NODE_ENV === 'development' && (
        <div className="absolute bottom-4 right-4 z-20 bg-black/80 text-white p-2 rounded text-xs">
          Clustered Map • {facts.length} facts • {markersRef.current.length} markers
        </div>
      )}
    </div>
  );
});

ClusteredMap.displayName = 'ClusteredMap';

const ClusteredMapWithErrorBoundary: React.FC<ClusteredMapProps> = (props) => (
  <ErrorBoundary FallbackComponent={MapErrorFallback}>
    <ClusteredMap {...props} />
  </ErrorBoundary>
);

export default ClusteredMapWithErrorBoundary;