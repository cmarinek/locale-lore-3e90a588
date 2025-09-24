import React, { useEffect, useCallback, useState, useMemo } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { useMapContext } from '@/contexts/MapContext';
import { useDiscoveryStore } from '@/stores/discoveryStore';
import { geoService, ViewportBounds, GeoCluster } from '@/services/geoService';
import { FactMarker } from '@/types/map';
import { Coordinate, isValidCoordinate, toLatLng } from '@/utils/coordinates';
import { useMapCoordinateValidation } from '@/hooks/useMapCoordinateValidation';
import mapboxgl from 'mapbox-gl';

interface ImprovedClusteredMapProps {
  onFactClick?: (fact: FactMarker) => void;
  className?: string;
  isVisible?: boolean;
}

interface MapErrorFallbackProps {
  error: Error;
  resetErrorBoundary: () => void;
}

function MapErrorFallback({ error, resetErrorBoundary }: MapErrorFallbackProps) {
  return (
    <div className="flex items-center justify-center h-full bg-muted rounded-lg">
      <div className="text-center p-6">
        <div className="text-destructive mb-4">
          <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.996-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold mb-2">Map Error</h3>
        <p className="text-sm text-muted-foreground mb-4">
          {error.message || 'Something went wrong with the map'}
        </p>
        <button 
          onClick={resetErrorBoundary}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
        >
          Try Again
        </button>
      </div>
    </div>
  );
}

function ClusteredMapContent({ onFactClick, className, isVisible }: ImprovedClusteredMapProps) {
  const { map, mapContainer, isMapReady, mapError, initializeMap } = useMapContext();
  const { facts } = useDiscoveryStore();
  const { validateCoordinateInput } = useMapCoordinateValidation();
  
  const [clusters, setClusters] = useState<GeoCluster[]>([]);
  const [markers, setMarkers] = useState<mapboxgl.Marker[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Convert facts to valid coordinates only
  const validFacts = useMemo(() => {
    return facts.filter(fact => {
      const validation = validateCoordinateInput([fact.longitude, fact.latitude]);
      if (!validation.isValid) {
        console.warn('Invalid fact coordinates:', fact.id, validation.errors);
        return false;
      }
      return true;
    }).map(fact => ({
      id: fact.id,
      title: fact.title,
      latitude: fact.latitude,
      longitude: fact.longitude,
      category: fact.categories?.slug || 'unknown',
      verified: fact.status === 'verified',
      voteScore: fact.vote_count_up - fact.vote_count_down,
      authorName: fact.profiles?.username
    }));
  }, [facts, validateCoordinateInput]);

  // Initialize map when component becomes visible
  useEffect(() => {
    if (isVisible && !map) {
      initializeMap({
        center: [-74.006, 40.7128], // NYC default
        zoom: 2
      });
    }
  }, [isVisible, map, initializeMap]);

  // Update markers when map is ready and facts change
  const updateMarkers = useCallback(async () => {
    if (!map || !isMapReady) return;

    setIsLoading(true);
    
    try {
      // Clear existing markers
      markers.forEach(marker => marker.remove());
      setMarkers([]);

      const bounds = map.getBounds();
      const zoom = map.getZoom();
      
      const viewport: ViewportBounds = {
        north: bounds.getNorth(),
        south: bounds.getSouth(),
        east: bounds.getEast(),
        west: bounds.getWest()
      };

      // Get clustered data from service
      const { facts: viewportFacts, clusters: viewportClusters } = await geoService.getFactsInViewport(
        viewport, 
        zoom, 
        { includeCount: true }
      );

      const newMarkers: mapboxgl.Marker[] = [];

      // Add cluster markers
      viewportClusters.forEach(cluster => {
        const [lng, lat] = cluster.center;
        if (!isValidCoordinate(lng, lat)) return;

        const clusterElement = document.createElement('div');
        clusterElement.className = 'cluster-marker';
        clusterElement.innerHTML = `
          <div class="flex items-center justify-center w-10 h-10 bg-primary text-primary-foreground rounded-full border-2 border-background shadow-lg hover:scale-110 transition-transform cursor-pointer">
            <span class="text-sm font-bold">${cluster.count}</span>
          </div>
        `;

        clusterElement.addEventListener('click', () => {
          // Zoom into cluster bounds
          if (cluster.bounds) {
            map.fitBounds([
              [cluster.bounds.west, cluster.bounds.south],
              [cluster.bounds.east, cluster.bounds.north]
            ], { padding: 50 });
          }
        });

        const marker = new mapboxgl.Marker({ element: clusterElement })
          .setLngLat([lng, lat])
          .addTo(map);

        newMarkers.push(marker);
      });

      // Add individual fact markers for high zoom levels
      if (zoom >= 12) {
        viewportFacts.forEach(fact => {
          if (!isValidCoordinate(fact.longitude, fact.latitude)) return;

          const markerElement = document.createElement('div');
          markerElement.className = 'fact-marker';
          markerElement.innerHTML = `
            <div class="flex items-center justify-center w-8 h-8 rounded-full border-2 border-background shadow-lg hover:scale-110 transition-transform cursor-pointer ${
              fact.verified ? 'bg-green-500' : 'bg-blue-500'
            } text-white">
              <span class="text-xs">📍</span>
            </div>
          `;

          markerElement.addEventListener('click', () => {
            if (onFactClick) {
              onFactClick(fact);
            }
          });

          const marker = new mapboxgl.Marker({ element: markerElement })
            .setLngLat([fact.longitude, fact.latitude])
            .addTo(map);

          newMarkers.push(marker);
        });
      }

      setMarkers(newMarkers);
      setClusters(viewportClusters);
      
    } catch (error) {
      console.error('Error updating markers:', error);
    } finally {
      setIsLoading(false);
    }
  }, [map, isMapReady, validFacts, onFactClick, markers]);

  // Update markers when map moves or zooms
  useEffect(() => {
    if (!map || !isMapReady) return;

    const handleMapUpdate = () => {
      updateMarkers();
    };

    map.on('moveend', handleMapUpdate);
    map.on('zoomend', handleMapUpdate);

    // Initial load
    updateMarkers();

    return () => {
      map.off('moveend', handleMapUpdate);
      map.off('zoomend', handleMapUpdate);
    };
  }, [map, isMapReady, updateMarkers]);

  // Cleanup markers on unmount
  useEffect(() => {
    return () => {
      markers.forEach(marker => marker.remove());
    };
  }, [markers]);

  if (mapError) {
    return (
      <div className={`relative ${className}`}>
        <div className="absolute inset-0 flex items-center justify-center bg-muted">
          <div className="text-center p-4">
            <p className="text-destructive mb-2">Map Error</p>
            <p className="text-sm text-muted-foreground">{mapError}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      <div ref={mapContainer} className="absolute inset-0 w-full h-full rounded-lg" />
      
      {/* Loading indicator */}
      {(isLoading || !isMapReady) && (
        <div className="absolute top-4 left-4 bg-background/80 backdrop-blur-sm rounded-lg px-3 py-2 shadow-lg">
          <div className="flex items-center gap-2">
            <div className="animate-spin w-4 h-4 border-2 border-primary border-t-transparent rounded-full" />
            <span className="text-sm">
              {!isMapReady ? 'Loading map...' : 'Updating markers...'}
            </span>
          </div>
        </div>
      )}

      {/* Fact count */}
      {isMapReady && (
        <div className="absolute bottom-4 left-4 bg-background/80 backdrop-blur-sm rounded-lg px-3 py-2 shadow-lg">
          <span className="text-sm">
            {validFacts.length} facts • {clusters.length} clusters
          </span>
        </div>
      )}
    </div>
  );
}

export function ImprovedClusteredMap(props: ImprovedClusteredMapProps) {
  return (
    <ErrorBoundary FallbackComponent={MapErrorFallback}>
      <ClusteredMapContent {...props} />
    </ErrorBoundary>
  );
}

export default ImprovedClusteredMap;