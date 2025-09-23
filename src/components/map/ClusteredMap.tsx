import React, { useEffect, useRef, useCallback, useMemo, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import Supercluster from 'supercluster';
import 'mapbox-gl/dist/mapbox-gl.css';
import { usePerformanceMonitor } from '@/hooks/usePerformanceMonitor';
import { FactMarker } from '@/types/map';
import { ClusterPoint } from '@/types/clustering';
import { useDiscoveryStore } from '@/stores/discoveryStore';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { ErrorBoundary } from 'react-error-boundary';
import { EnhancedMapControls } from './EnhancedMapControls';
import { MapLoadingState } from './MapLoadingState';

interface ClusteredMapProps {
  onFactClick?: (fact: FactMarker) => void;
  className?: string;
  isVisible?: boolean;
}

// Error fallback component
const MapErrorFallback: React.FC<{ error: Error }> = ({ error }) => (
  <div className="flex items-center justify-center h-full bg-muted/20 rounded-lg border border-border">
    <div className="text-center p-6">
      <h3 className="text-lg font-semibold text-destructive mb-2">Map Error</h3>
      <p className="text-sm text-muted-foreground mb-4">Failed to load the map</p>
      <p className="text-xs text-muted-foreground">{error.message}</p>
    </div>
  </div>
);

export const ClusteredMap: React.FC<ClusteredMapProps> = React.memo(({ onFactClick, className, isVisible }) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const superclusterRef = useRef<Supercluster | null>(null);
  const superclusterLoadedRef = useRef<boolean>(false);
  const isInitializedRef = useRef(false);
  const lastZoomRef = useRef(0);
  const { startRenderMeasurement, endRenderMeasurement } = usePerformanceMonitor(true);
  
  const { facts, loading } = useDiscoveryStore();
  const [mapStyle, setMapStyle] = useState('mapbox://styles/mapbox/light-v11');
  const [isMapLoading, setIsMapLoading] = useState(true);

  // Convert facts to cluster points for Supercluster
  const clusterPoints: ClusterPoint[] = useMemo(() => {
    const validFacts = facts.filter(fact => 
      fact.latitude != null && 
      fact.longitude != null && 
      !isNaN(fact.latitude) && 
      !isNaN(fact.longitude)
    );
    
    console.log(`🗺️ Converting ${validFacts.length} facts to cluster points (filtered from ${facts.length} total)`);
    
    return validFacts.map(fact => ({
      type: 'Feature' as const,
      geometry: {
        type: 'Point' as const,
        coordinates: [fact.longitude, fact.latitude]
      },
      properties: {
        id: fact.id,
        title: fact.title,
        category: fact.categories?.slug || 'unknown',
        verified: fact.status === 'verified',
        voteScore: (fact.vote_count_up || 0) - (fact.vote_count_down || 0),
        authorName: fact.profiles?.username || 'Anonymous'
      }
    }));
  }, [facts]);

  // Initialize Supercluster when cluster points change
  useEffect(() => {
    if (superclusterRef.current && clusterPoints.length > 0) {
      console.log(`🔄 Loading ${clusterPoints.length} points into Supercluster`);
      superclusterRef.current.load(clusterPoints);
      superclusterLoadedRef.current = true;
      
      // Update markers after loading data
      if (map.current && !isMapLoading) {
        updateMarkers();
      }
    } else {
      superclusterLoadedRef.current = false;
    }
  }, [clusterPoints, isMapLoading]);

  // Initialize map
  const initializeMap = useCallback(async () => {
    if (!mapContainer.current || isInitializedRef.current) return;

    try {
      // Get Mapbox token from Supabase secrets
      const { data, error } = await supabase.functions.invoke('get-mapbox-token');
      
      if (error || !data?.token) {
        console.error('Failed to get Mapbox token:', error);
        toast({
          title: "Map Error",
          description: "Failed to load map. Please check your Mapbox configuration.",
          variant: "destructive"
        });
        return;
      }

      mapboxgl.accessToken = data.token;
      isInitializedRef.current = true;

      // Initialize Supercluster
      superclusterRef.current = new Supercluster({
        radius: 80,
        maxZoom: 14,
        minZoom: 0,
        minPoints: 2
      });

      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: mapStyle,
        center: [0, 20],
        zoom: 2,
        projection: { name: 'globe' },
        antialias: true
      });

      // Add navigation controls
      map.current.addControl(new mapboxgl.NavigationControl({
        visualizePitch: true
      }), 'top-left');

      // Disable map rotation using right click + drag
      map.current.dragRotate.disable();
      
      // Disable map tilting using ctrl + drag
      map.current.touchZoomRotate.disableRotation();

      map.current.on('load', () => {
        console.log('🗺️ Map loaded successfully');
        setIsMapLoading(false);
        updateMarkers();
      });

      // Efficient zoom handling
      map.current.on('zoomend', () => {
        const currentZoom = map.current!.getZoom();
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
  }, [startRenderMeasurement, endRenderMeasurement, mapStyle]);

  // Create marker element for individual points
  const createMarkerElement = useCallback((point: ClusterPoint) => {
    const el = document.createElement('div');
    el.className = 'fact-marker';
    
    // Modern glassmorphism design
    el.style.cssText = `
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: ${point.properties.verified 
        ? 'linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--primary))/0.8 100%)' 
        : 'linear-gradient(135deg, hsl(var(--muted-foreground)) 0%, hsl(var(--muted-foreground))/0.8 100%)'
      };
      border: 3px solid rgba(255,255,255,0.9);
      cursor: pointer;
      box-shadow: 
        0 8px 32px rgba(0,0,0,0.12),
        0 2px 8px rgba(0,0,0,0.08),
        inset 0 1px 0 rgba(255,255,255,0.3);
      backdrop-filter: blur(8px);
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      position: relative;
      z-index: 10;
      display: flex;
      align-items: center;
      justify-content: center;
    `;
    
    // Category-based icon
    const categoryIcons = {
      history: '🏛️',
      culture: '🎭',
      nature: '🌿',
      mystery: '🔮',
      legend: '📜',
      default: '📍'
    };
    
    const icon = document.createElement('div');
    icon.textContent = categoryIcons[point.properties.category as keyof typeof categoryIcons] || categoryIcons.default;
    icon.style.cssText = `
      font-size: 18px;
      filter: drop-shadow(0 1px 2px rgba(0,0,0,0.3));
    `;
    el.appendChild(icon);
    
    // Verified badge
    if (point.properties.verified) {
      const badge = document.createElement('div');
      badge.textContent = '✓';
      badge.style.cssText = `
        position: absolute;
        top: -2px;
        right: -2px;
        width: 16px;
        height: 16px;
        background: hsl(var(--success));
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 10px;
        color: white;
        font-weight: bold;
        box-shadow: 0 2px 4px rgba(0,0,0,0.2);
      `;
      el.appendChild(badge);
    }
    
    // Click handler with haptic feedback
    el.addEventListener('click', () => {
      if (onFactClick) {
        // Add click animation
        el.style.transform = 'scale(0.95)';
        setTimeout(() => el.style.transform = 'scale(1.05)', 100);
        
        const factMarker = {
          id: point.properties.id,
          title: point.properties.title,
          latitude: point.geometry.coordinates[1],
          longitude: point.geometry.coordinates[0],
          category: point.properties.category,
          verified: point.properties.verified,
          voteScore: point.properties.voteScore,
          authorName: point.properties.authorName
        };
        onFactClick(factMarker);
      }
    });
    
    // Enhanced hover effects
    el.addEventListener('mouseenter', () => {
      el.style.transform = 'scale(1.15)';
      el.style.boxShadow = `
        0 12px 40px rgba(0,0,0,0.15),
        0 4px 12px rgba(0,0,0,0.1),
        inset 0 1px 0 rgba(255,255,255,0.4)
      `;
      el.style.zIndex = '20';
    });
    
    el.addEventListener('mouseleave', () => {
      el.style.transform = 'scale(1)';
      el.style.boxShadow = `
        0 8px 32px rgba(0,0,0,0.12),
        0 2px 8px rgba(0,0,0,0.08),
        inset 0 1px 0 rgba(255,255,255,0.3)
      `;
      el.style.zIndex = '10';
    });
    
    return el;
  }, [onFactClick]);

  // Create cluster element for grouped points
  const createClusterElement = useCallback((cluster: any) => {
    const pointCount = cluster.properties.point_count;
    const el = document.createElement('div');
    el.className = 'fact-cluster';
    
    // Dynamic sizing based on point count
    const size = pointCount < 10 ? 50 : pointCount < 50 ? 60 : pointCount < 100 ? 70 : 80;
    
    // Gradient color based on cluster size
    const getClusterColor = (count: number) => {
      if (count < 10) return 'linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--primary))/0.8 100%)';
      if (count < 50) return 'linear-gradient(135deg, hsl(var(--accent)) 0%, hsl(var(--accent))/0.8 100%)';
      return 'linear-gradient(135deg, hsl(var(--destructive)) 0%, hsl(var(--destructive))/0.8 100%)';
    };
    
    el.style.cssText = `
      width: ${size}px;
      height: ${size}px;
      border-radius: 50%;
      background: ${getClusterColor(pointCount)};
      border: 4px solid rgba(255,255,255,0.95);
      cursor: pointer;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      color: white;
      font-size: ${size > 60 ? '16px' : '14px'};
      box-shadow: 
        0 12px 40px rgba(0,0,0,0.15),
        0 4px 12px rgba(0,0,0,0.1),
        inset 0 2px 0 rgba(255,255,255,0.3);
      backdrop-filter: blur(12px);
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      position: relative;
      z-index: 15;
    `;
    
    // Main count number
    const countElement = document.createElement('div');
    countElement.textContent = pointCount.toString();
    countElement.style.cssText = `
      font-size: ${size > 60 ? '18px' : '16px'};
      font-weight: 800;
      line-height: 1;
      text-shadow: 0 1px 2px rgba(0,0,0,0.3);
    `;
    el.appendChild(countElement);
    
    // "stories" label for larger clusters
    if (size > 50) {
      const label = document.createElement('div');
      label.textContent = 'stories';
      label.style.cssText = `
        font-size: 9px;
        font-weight: 600;
        opacity: 0.9;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        margin-top: -2px;
      `;
      el.appendChild(label);
    }
    
    // Pulse animation for large clusters
    if (pointCount > 50) {
      el.style.animation = 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite';
    }
    
    // Enhanced hover effects
    el.addEventListener('mouseenter', () => {
      el.style.transform = 'scale(1.1)';
      el.style.boxShadow = `
        0 16px 50px rgba(0,0,0,0.2),
        0 6px 16px rgba(0,0,0,0.15),
        inset 0 2px 0 rgba(255,255,255,0.4)
      `;
      el.style.zIndex = '25';
    });
    
    el.addEventListener('mouseleave', () => {
      el.style.transform = 'scale(1)';
      el.style.boxShadow = `
        0 12px 40px rgba(0,0,0,0.15),
        0 4px 12px rgba(0,0,0,0.1),
        inset 0 2px 0 rgba(255,255,255,0.3)
      `;
      el.style.zIndex = '15';
    });
    
    // Click to expand cluster with smooth animation
    el.addEventListener('click', () => {
      if (map.current && superclusterRef.current) {
        // Add click animation
        el.style.transform = 'scale(0.9)';
        setTimeout(() => el.style.transform = 'scale(1.1)', 100);
        
        const expansionZoom = Math.min(
          superclusterRef.current.getClusterExpansionZoom(cluster.properties.cluster_id),
          20
        );
        
        map.current.easeTo({
          center: [cluster.geometry.coordinates[0], cluster.geometry.coordinates[1]],
          zoom: expansionZoom,
          duration: 800,
          essential: true
        });
      }
    });
    
    return el;
  }, []);

  // Update markers based on current map view
  const updateMarkers = useCallback(() => {
    if (!map.current || !superclusterRef.current || !superclusterLoadedRef.current || !clusterPoints.length) {
      console.log('⚠️ Cannot update markers: missing requirements', {
        map: !!map.current,
        supercluster: !!superclusterRef.current,
        loaded: superclusterLoadedRef.current,
        points: clusterPoints.length
      });
      return;
    }
    
    startRenderMeasurement?.();
    
    try {
      const bounds = map.current.getBounds();
      const zoom = Math.floor(map.current.getZoom());
      
      const bbox = [
        bounds.getWest(),
        bounds.getSouth(), 
        bounds.getEast(),
        bounds.getNorth()
      ] as [number, number, number, number];
      
      const clusters = superclusterRef.current.getClusters(bbox, zoom);
      console.log(`🗺️ Updating markers: ${clusters.length} clusters/points at zoom ${zoom}`, { bbox, zoom, totalPoints: clusterPoints.length });
      
      // Clear existing markers efficiently
      markersRef.current.forEach(marker => marker.remove());
      markersRef.current = [];
      
      // Add new markers with optimized rendering
      const newMarkers: mapboxgl.Marker[] = [];
      
      clusters.forEach((cluster: any) => {
        let marker;
        
        if (cluster.properties?.cluster) {
          // This is a cluster
          const el = createClusterElement(cluster);
          marker = new mapboxgl.Marker({ 
            element: el,
            anchor: 'center'
          })
            .setLngLat([cluster.geometry.coordinates[0], cluster.geometry.coordinates[1]])
            .addTo(map.current!);
        } else {
          // This is an individual point
          const el = createMarkerElement(cluster);
          marker = new mapboxgl.Marker({ 
            element: el,
            anchor: 'center'
          })
            .setLngLat([cluster.geometry.coordinates[0], cluster.geometry.coordinates[1]])
            .addTo(map.current!);
        }
        
        newMarkers.push(marker);
      });
      
      markersRef.current = newMarkers;
      console.log(`✅ Added ${newMarkers.length} markers to map`);
      
    } catch (error) {
      console.error('❌ Error updating markers:', error);
    } finally {
      endRenderMeasurement?.();
    }
  }, [createMarkerElement, createClusterElement, startRenderMeasurement, endRenderMeasurement, clusterPoints.length]);

  // Map style change handler
  const handleStyleChange = useCallback(() => {
    if (!map.current) return;
    
    const styles = [
      'mapbox://styles/mapbox/light-v11',
      'mapbox://styles/mapbox/dark-v11',
      'mapbox://styles/mapbox/satellite-streets-v12',
      'mapbox://styles/mapbox/outdoors-v12'
    ];
    
    const currentIndex = styles.indexOf(mapStyle);
    const nextIndex = (currentIndex + 1) % styles.length;
    const newStyle = styles[nextIndex];
    
    setMapStyle(newStyle);
    map.current.setStyle(newStyle);
    
    // Show style change feedback
    const styleName = newStyle.split('/').pop()?.replace('-v11', '').replace('-v12', '') || 'Unknown';
    toast({
      title: "Map style changed",
      description: `Switched to ${styleName} theme`,
      duration: 2000
    });
  }, [mapStyle]);

  // Reset view handler
  const handleResetView = useCallback(() => {
    if (!map.current) return;
    map.current.easeTo({
      center: [0, 20],
      zoom: 2,
      duration: 1000
    });
  }, []);

  // Zoom handlers
  const handleZoomIn = useCallback(() => {
    if (!map.current) return;
    map.current.zoomIn();
  }, []);

  const handleZoomOut = useCallback(() => {
    if (!map.current) return;
    map.current.zoomOut();
  }, []);

  // My location handler
  const handleMyLocation = useCallback(() => {
    if (!map.current) return;
    
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          map.current!.easeTo({
            center: [longitude, latitude],
            zoom: 14,
            duration: 1000
          });
          
          toast({
            title: "Location found",
            description: "Centered map on your location",
            duration: 2000
          });
        },
        (error) => {
          console.error('Geolocation error:', error);
          toast({
            title: "Location error",
            description: "Could not get your location",
            variant: "destructive",
            duration: 3000
          });
        }
      );
    }
  }, []);

  // Initialize map when component becomes visible
  useEffect(() => {
    if (isVisible && !isInitializedRef.current) {
      initializeMap();
    }
  }, [isVisible, initializeMap]);

  // Update markers when facts change or map loads
  useEffect(() => {
    if (map.current && superclusterRef.current && superclusterLoadedRef.current && clusterPoints.length > 0 && isVisible && !isMapLoading) {
      updateMarkers();
    }
  }, [clusterPoints, updateMarkers, isVisible, isMapLoading]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      markersRef.current.forEach(marker => marker.remove());
      markersRef.current = [];
      map.current?.remove();
      map.current = null;
      isInitializedRef.current = false;
    };
  }, []);

  if (!isVisible) {
    return <div className={className} />;
  }

  return (
    <div className={`relative h-full w-full ${className}`}>
      <div ref={mapContainer} className="h-full w-full rounded-lg overflow-hidden" />
      
      {/* Enhanced Map Controls */}
      <EnhancedMapControls
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onRecenter={handleResetView}
        onMyLocation={handleMyLocation}
        onStyleChange={handleStyleChange}
        onResetView={handleResetView}
        position="right"
      />

      {/* Loading States */}
      {(loading || isMapLoading) && (
        <MapLoadingState 
          message={loading ? "Loading stories..." : "Initializing map..."}
          showProgress={loading}
          progress={facts.length > 0 ? 100 : 0}
        />
      )}

      {/* Debug info in development */}
      {process.env.NODE_ENV === 'development' && (
        <div className="absolute top-20 left-4 z-20 bg-black/80 text-white p-3 rounded-xl text-xs font-mono space-y-1">
          <div>📊 Facts: {facts.length}</div>
          <div>🗺️ Cluster Points: {clusterPoints.length}</div>
          <div>📍 Markers: {markersRef.current.length}</div>
          <div>🔍 Zoom: {map.current?.getZoom()?.toFixed(1) || 'N/A'}</div>
          <div>🎯 Style: {mapStyle.split('/').pop()}</div>
        </div>
      )}
    </div>
  );
});

ClusteredMap.displayName = 'ClusteredMap';

// Wrap with error boundary
const ClusteredMapWithErrorBoundary: React.FC<ClusteredMapProps> = (props) => (
  <ErrorBoundary FallbackComponent={MapErrorFallback}>
    <ClusteredMap {...props} />
  </ErrorBoundary>
);

export default ClusteredMapWithErrorBoundary;