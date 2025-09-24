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
  const markersRef = useRef<Map<string, mapboxgl.Marker>>(new Map());
  const superclusterRef = useRef<Supercluster | null>(null);
  const superclusterLoadedRef = useRef<boolean>(false);
  const isInitializedRef = useRef(false);
  const lastZoomRef = useRef(0);
  const lastBoundsRef = useRef<string>('');
  const updateTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isUpdatingRef = useRef(false);
  const isAnimatingRef = useRef(false);
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
      
      // Update markers after loading data with debouncing
      if (map.current && !isMapLoading) {
        debouncedUpdateMarkers();
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

      // Initialize Supercluster with optimized configuration
      superclusterRef.current = new Supercluster({
        radius: 60, // Optimal clustering radius
        maxZoom: 16, // Higher max zoom for better detail
        minZoom: 0,
        minPoints: 2, // Will be dynamically adjusted based on zoom
        extent: 512,
        nodeSize: 64
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
        debouncedUpdateMarkers();
      });

      // Smart event handling with debouncing
      map.current.on('zoomstart', () => {
        isUpdatingRef.current = true;
      });

      map.current.on('zoomend', () => {
        isUpdatingRef.current = false;
        const currentZoom = map.current!.getZoom();
        const shouldUpdate = Math.abs(currentZoom - lastZoomRef.current) > 0.8; // More selective updates
        if (shouldUpdate) {
          lastZoomRef.current = currentZoom;
          debouncedUpdateMarkers();
        }
      });

      map.current.on('dragstart', () => {
        isUpdatingRef.current = true;
      });

      map.current.on('moveend', () => {
        isUpdatingRef.current = false;
        const bounds = map.current!.getBounds();
        const boundsKey = `${bounds.getWest()}_${bounds.getSouth()}_${bounds.getEast()}_${bounds.getNorth()}`;
        
        // Only update if bounds changed significantly
        if (shouldUpdateForBoundsChange(lastBoundsRef.current, boundsKey)) {
          lastBoundsRef.current = boundsKey;
          debouncedUpdateMarkers();
        }
      });

      map.current.on('error', (e) => {
        console.error('Map error:', e);
      });

    } catch (error) {
      console.error('Failed to initialize clustered map:', error);
      isInitializedRef.current = false;
    }
  }, [startRenderMeasurement, endRenderMeasurement, mapStyle]);

  // Utility function to check if bounds changed significantly
  const shouldUpdateForBoundsChange = useCallback((oldBounds: string, newBounds: string) => {
    if (!oldBounds) return true;
    
    const oldParts = oldBounds.split('_').map(Number);
    const newParts = newBounds.split('_').map(Number);
    
    if (oldParts.length !== 4 || newParts.length !== 4) return true;
    
    // Check if any bound changed by more than 20% of the viewport
    for (let i = 0; i < 4; i++) {
      const change = Math.abs(newParts[i] - oldParts[i]);
      const range = Math.abs(oldParts[i]);
      if (change > range * 0.2) return true;
    }
    
    return false;
  }, []);

  // Debounced update function
  const debouncedUpdateMarkers = useCallback(() => {
    if (updateTimeoutRef.current) {
      clearTimeout(updateTimeoutRef.current);
    }
    
    updateTimeoutRef.current = setTimeout(() => {
      if (!isUpdatingRef.current) {
        updateMarkers();
      }
    }, 200); // 200ms debounce for smoother performance
  }, []);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
      }
    };
  }, []);

  // Create marker element for individual points
  const createMarkerElement = useCallback((point: ClusterPoint) => {
    const el = document.createElement('div');
    el.className = 'fact-marker';
    
    // Modern glassmorphism design with proper centering
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
      transform-origin: center center;
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
        // Add subtle click animation without displacement
        el.style.transform = 'scale(0.95)';
        setTimeout(() => el.style.transform = 'scale(1)', 150);
        
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
    
    // Enhanced hover effects without position shifts
    el.addEventListener('mouseenter', () => {
      el.style.transform = 'scale(1.1)';
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
      transform-origin: center center;
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
    
    // Click to expand cluster with comprehensive validation and error handling
    el.addEventListener('click', () => {
      // Prevent clicks during animations or if required objects are missing
      if (isAnimatingRef.current || !map.current || !superclusterRef.current) {
        console.log('🚫 Cluster click blocked: animation in progress or missing dependencies');
        return;
      }

      try {
        // Validate cluster properties
        const clusterId = cluster.properties?.cluster_id;
        const coordinates = cluster.geometry?.coordinates;
        
        if (!clusterId || typeof clusterId !== 'number') {
          console.error('❌ Invalid cluster_id:', clusterId);
          toast({
            title: "Cluster Error",
            description: "Unable to expand cluster - invalid cluster ID",
            variant: "destructive"
          });
          return;
        }

        if (!Array.isArray(coordinates) || coordinates.length !== 2 || 
            typeof coordinates[0] !== 'number' || typeof coordinates[1] !== 'number' ||
            isNaN(coordinates[0]) || isNaN(coordinates[1])) {
          console.error('❌ Invalid cluster coordinates:', coordinates);
          toast({
            title: "Cluster Error", 
            description: "Unable to expand cluster - invalid coordinates",
            variant: "destructive"
          });
          return;
        }

        console.log('🎯 Cluster click:', {
          clusterId,
          coordinates,
          pointCount: cluster.properties?.point_count
        });

        // Add visual feedback
        el.style.transform = 'scale(0.95)';
        setTimeout(() => {
          if (el.style) el.style.transform = 'scale(1)';
        }, 150);

        // Set animation flag to prevent race conditions
        isAnimatingRef.current = true;

        // Get expansion zoom with error handling
        let expansionZoom: number;
        try {
          expansionZoom = superclusterRef.current.getClusterExpansionZoom(clusterId);
          
          // Validate expansion zoom
          if (typeof expansionZoom !== 'number' || isNaN(expansionZoom)) {
            throw new Error(`Invalid expansion zoom: ${expansionZoom}`);
          }
          
          // Ensure zoom is within reasonable bounds
          expansionZoom = Math.max(1, Math.min(expansionZoom, 20));
          
        } catch (error) {
          console.error('❌ Failed to get cluster expansion zoom:', error);
          // Fallback: zoom in by 2 levels from current zoom
          const currentZoom = map.current.getZoom();
          expansionZoom = Math.min(currentZoom + 2, 20);
          console.log(`🔄 Using fallback zoom: ${expansionZoom}`);
        }

        console.log(`📍 Expanding cluster to zoom ${expansionZoom} at [${coordinates[0]}, ${coordinates[1]}]`);

        // Animate to cluster location
        map.current.easeTo({
          center: [coordinates[0], coordinates[1]],
          zoom: expansionZoom,
          duration: 800,
          essential: true
        });

        // Clear animation flag when animation completes
        setTimeout(() => {
          isAnimatingRef.current = false;
        }, 1000); // Slightly longer than animation duration

      } catch (error) {
        console.error('❌ Cluster click error:', error);
        isAnimatingRef.current = false;
        
        toast({
          title: "Cluster Error",
          description: "Failed to expand cluster. Please try again.",
          variant: "destructive"
        });
      }
    });
    
    return el;
  }, []);

  // Enhanced marker update with recycling and performance optimization
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
    
    // Prevent updates during active interaction
    if (isUpdatingRef.current) {
      console.log('⏸️ Skipping update during interaction');
      return;
    }
    
    startRenderMeasurement?.();
    
    try {
      const bounds = map.current.getBounds();
      const zoom = Math.floor(map.current.getZoom());
      
      // Dynamic clustering would require reinitializing Supercluster
      // For now, we use the optimized static configuration
      
      const bbox = [
        bounds.getWest(),
        bounds.getSouth(), 
        bounds.getEast(),
        bounds.getNorth()
      ] as [number, number, number, number];
      
      const clusters = superclusterRef.current.getClusters(bbox, zoom);
      console.log(`🗺️ Updating markers: ${clusters.length} clusters/points at zoom ${zoom}`, { 
        bbox, zoom, totalPoints: clusterPoints.length 
      });
      
      // Create marker ID map for efficient recycling
      const currentMarkerIds = new Set<string>();
      const newMarkers = new Map<string, mapboxgl.Marker>();
      
      clusters.forEach((cluster: any) => {
        const isCluster = cluster.properties?.cluster;
        const markerId = isCluster 
          ? `cluster_${cluster.properties.cluster_id}` 
          : `point_${cluster.properties.id}`;
          
        currentMarkerIds.add(markerId);
        
        // Try to reuse existing marker
        const existingMarker = markersRef.current.get(markerId);
        if (existingMarker) {
          // Update position if needed
          const currentLngLat = existingMarker.getLngLat();
          const newLngLat = [cluster.geometry.coordinates[0], cluster.geometry.coordinates[1]] as [number, number];
          
          if (Math.abs(currentLngLat.lng - newLngLat[0]) > 0.0001 || 
              Math.abs(currentLngLat.lat - newLngLat[1]) > 0.0001) {
            existingMarker.setLngLat(newLngLat);
          }
          
          newMarkers.set(markerId, existingMarker);
        } else {
          // Create new marker
          let marker;
          
          if (isCluster) {
            const el = createClusterElement(cluster);
            marker = new mapboxgl.Marker({ 
              element: el,
              anchor: 'center',
              offset: [0, 0]
            })
              .setLngLat([cluster.geometry.coordinates[0], cluster.geometry.coordinates[1]])
              .addTo(map.current!);
          } else {
            const el = createMarkerElement(cluster);
            marker = new mapboxgl.Marker({ 
              element: el,
              anchor: 'center',
              offset: [0, 0]
            })
              .setLngLat([cluster.geometry.coordinates[0], cluster.geometry.coordinates[1]])
              .addTo(map.current!);
          }
          
          newMarkers.set(markerId, marker);
        }
      });
      
      // Remove markers that are no longer needed
      markersRef.current.forEach((marker, id) => {
        if (!currentMarkerIds.has(id)) {
          marker.remove();
        }
      });
      
      // Update markers reference
      markersRef.current = newMarkers;
      console.log(`✅ Updated ${newMarkers.size} markers (${clusters.length} total features)`);
      
    } catch (error) {
      console.error('❌ Error updating markers:', error);
      
      // Fallback: clear all markers and try simple update
      markersRef.current.forEach(marker => marker.remove());
      markersRef.current.clear();
    } finally {
      endRenderMeasurement?.();
    }
  }, [createMarkerElement, createClusterElement, startRenderMeasurement, endRenderMeasurement, clusterPoints, debouncedUpdateMarkers]);

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
      markersRef.current.clear();
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
          <div>📍 Markers: {markersRef.current.size}</div>
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