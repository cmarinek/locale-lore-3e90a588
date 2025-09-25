import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { mapboxService } from '@/services/mapboxService';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface MapStyle {
  id: string;
  name: string;
  style: string;
}

const mapStyles: MapStyle[] = [
  { id: 'light', name: 'Light', style: 'mapbox://styles/mapbox/light-v11' },
  { id: 'dark', name: 'Dark', style: 'mapbox://styles/mapbox/dark-v11' },
  { id: 'streets', name: 'Streets', style: 'mapbox://styles/mapbox/streets-v12' },
  { id: 'satellite', name: 'Satellite', style: 'mapbox://styles/mapbox/satellite-v9' },
];

interface SimpleMapProps {
  onFactClick?: (fact: any) => void;
  className?: string;
  center?: [number, number];
  zoom?: number;
  showControls?: boolean;
}

export const SimpleMap: React.FC<SimpleMapProps> = ({ 
  onFactClick, 
  className = "w-full h-full", 
  center = [-74.5, 40],
  zoom = 9,
  showControls = true
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentStyle, setCurrentStyle] = useState('light');

  useEffect(() => {
    let mounted = true;
    let mapInstance: mapboxgl.Map | null = null;

    const initializeMap = async () => {
      if (!mapContainer.current) return;

      try {
        setIsLoading(true);
        console.log('🗺️ SimpleMap: Starting initialization...');
        
        // Get Mapbox token
        const token = await mapboxService.getToken();
        console.log('🗺️ SimpleMap: Token received:', !!token);
        if (!token) {
          throw new Error('Mapbox token not available');
        }

        mapboxgl.accessToken = token;
        console.log('🗺️ SimpleMap: Creating map instance...');

        // Create map with performance optimizations
        mapInstance = new mapboxgl.Map({
          container: mapContainer.current,
          style: mapStyles.find(s => s.id === currentStyle)?.style || 'mapbox://styles/mapbox/light-v11',
          center: center,
          zoom: zoom,
          // Performance optimizations
          antialias: false,
          maxTileCacheSize: 50,
          preserveDrawingBuffer: false,
          fadeDuration: 0,
          attributionControl: false
        });

        if (!mounted) {
          mapInstance.remove();
          return;
        }

        map.current = mapInstance;

        // Add navigation controls
        mapInstance.addControl(new mapboxgl.NavigationControl({ 
          showCompass: false,
          showZoom: true 
        }), 'top-right');

        mapInstance.on('load', () => {
          if (!mounted) return;
          
          console.log('🗺️ SimpleMap: Map loaded successfully');
          
          // Add sample data source for clustering
          mapInstance.addSource('facts', {
            type: 'geojson',
            data: {
              type: 'FeatureCollection',
              features: generateSampleFacts()
            },
            cluster: true,
            clusterMaxZoom: 14,
            clusterRadius: 50
          });

          // Add cluster circles
          mapInstance.addLayer({
            id: 'clusters',
            type: 'circle',
            source: 'facts',
            filter: ['has', 'point_count'],
            paint: {
              'circle-color': [
                'step',
                ['get', 'point_count'],
                '#51bbd6',
                100,
                '#f1f075',
                750,
                '#f28cb1'
              ],
              'circle-radius': [
                'step',
                ['get', 'point_count'],
                20,
                100,
                30,
                750,
                40
              ]
            }
          });

          // Add cluster count
          mapInstance.addLayer({
            id: 'cluster-count',
            type: 'symbol',
            source: 'facts',
            filter: ['has', 'point_count'],
            layout: {
              'text-field': '{point_count_abbreviated}',
              'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
              'text-size': 12
            }
          });

          // Add individual points
          mapInstance.addLayer({
            id: 'unclustered-point',
            type: 'circle',
            source: 'facts',
            filter: ['!', ['has', 'point_count']],
            paint: {
              'circle-color': '#11b4da',
              'circle-radius': 8,
              'circle-stroke-width': 2,
              'circle-stroke-color': '#fff'
            }
          });

          // Click events
          mapInstance.on('click', 'clusters', (e) => {
            const features = mapInstance.queryRenderedFeatures(e.point, {
              layers: ['clusters']
            });
            
            const clusterId = features[0].properties.cluster_id;
            const source = mapInstance.getSource('facts') as mapboxgl.GeoJSONSource;
            source.getClusterExpansionZoom(clusterId, (err, zoom) => {
              if (err) return;
              
              mapInstance.easeTo({
                center: (features[0].geometry as any).coordinates,
                zoom: zoom
              });
            });
          });

          mapInstance.on('click', 'unclustered-point', (e) => {
            const feature = e.features[0];
            if (onFactClick) {
              onFactClick(feature.properties);
            }
          });

          // Change cursor on hover
          mapInstance.on('mouseenter', 'clusters', () => {
            mapInstance.getCanvas().style.cursor = 'pointer';
          });
          mapInstance.on('mouseleave', 'clusters', () => {
            mapInstance.getCanvas().style.cursor = '';
          });
          mapInstance.on('mouseenter', 'unclustered-point', () => {
            mapInstance.getCanvas().style.cursor = 'pointer';
          });
          mapInstance.on('mouseleave', 'unclustered-point', () => {
            mapInstance.getCanvas().style.cursor = '';
          });

          console.log('🗺️ SimpleMap: All layers added successfully');
          setIsLoading(false);
        });

        mapInstance.on('error', (e) => {
          console.error('🗺️ SimpleMap: Map error:', e);
          setError('Failed to load map');
          setIsLoading(false);
        });

      } catch (error) {
        console.error('🗺️ SimpleMap: Failed to initialize map:', error);
        setError(error instanceof Error ? error.message : 'Unknown error');
        setIsLoading(false);
      }
    };

    initializeMap();

    return () => {
      mounted = false;
      if (mapInstance) {
        mapInstance.remove();
        mapInstance = null;
      }
      if (map.current) {
        map.current = null;
      }
    };
  }, []); // Empty dependency array - only run once

  // Handle prop updates without recreating the map
  useEffect(() => {
    if (map.current && center) {
      map.current.setCenter(center);
    }
  }, [center]);

  useEffect(() => {
    if (map.current && typeof zoom === 'number') {
      map.current.setZoom(zoom);
    }
  }, [zoom]);

  // Handle style changes
  const handleStyleChange = (styleId: string) => {
    if (map.current) {
      const style = mapStyles.find(s => s.id === styleId);
      if (style) {
        setCurrentStyle(styleId);
        map.current.setStyle(style.style);
        
        // Re-add sources and layers after style change
        map.current.once('style.load', () => {
          if (!map.current) return;
          
          // Re-add the facts source and layers
          map.current.addSource('facts', {
            type: 'geojson',
            data: {
              type: 'FeatureCollection',
              features: generateSampleFacts()
            },
            cluster: true,
            clusterMaxZoom: 14,
            clusterRadius: 50
          });

          // Re-add all layers
          map.current.addLayer({
            id: 'clusters',
            type: 'circle',
            source: 'facts',
            filter: ['has', 'point_count'],
            paint: {
              'circle-color': [
                'step',
                ['get', 'point_count'],
                '#51bbd6',
                100,
                '#f1f075',
                750,
                '#f28cb1'
              ],
              'circle-radius': [
                'step',
                ['get', 'point_count'],
                20,
                100,
                30,
                750,
                40
              ]
            }
          });

          map.current.addLayer({
            id: 'cluster-count',
            type: 'symbol',
            source: 'facts',
            filter: ['has', 'point_count'],
            layout: {
              'text-field': '{point_count_abbreviated}',
              'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
              'text-size': 12
            }
          });

          map.current.addLayer({
            id: 'unclustered-point',
            type: 'circle',
            source: 'facts',
            filter: ['!', ['has', 'point_count']],
            paint: {
              'circle-color': '#11b4da',
              'circle-radius': 8,
              'circle-stroke-width': 2,
              'circle-stroke-color': '#fff'
            }
          });
        });
      }
    }
  };
  // Generate sample data for testing
  function generateSampleFacts() {
    const features = [];
    for (let i = 0; i < 100; i++) {
      features.push({
        type: 'Feature',
        properties: {
          id: i,
          title: `Sample Story ${i + 1}`,
          description: `This is a sample local story at location ${i + 1}`,
          category: ['urban_legend', 'historical', 'mystery'][Math.floor(Math.random() * 3)]
        },
        geometry: {
          type: 'Point',
          coordinates: [
            center[0] + (Math.random() - 0.5) * 0.1,
            center[1] + (Math.random() - 0.5) * 0.1
          ]
        }
      });
    }
    return features;
  }

  if (error) {
    return (
      <div className={`${className} flex items-center justify-center bg-muted`}>
        <Card className="p-6 max-w-md">
          <div className="text-center space-y-4">
            <h3 className="text-lg font-semibold text-destructive">Map Error</h3>
            <p className="text-sm text-muted-foreground">{error}</p>
            <Button onClick={() => window.location.reload()} size="sm">
              Retry
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className={className}>
      <div ref={mapContainer} className="w-full h-full relative">
        {isLoading && (
          <div className="absolute inset-0 bg-background/80 flex items-center justify-center z-10">
            <div className="text-center space-y-2">
              <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto" />
              <p className="text-sm text-muted-foreground">Loading map...</p>
            </div>
          </div>
        )}
        
        {/* Map Style Controls */}
        {showControls && !isLoading && !error && (
          <div className="absolute top-4 left-4 z-20 flex flex-col gap-2">
            <Card className="p-2">
              <div className="text-xs font-medium mb-2 text-muted-foreground">Map Style</div>
              <div className="grid grid-cols-2 gap-1">
                {mapStyles.map((style) => (
                  <Button
                    key={style.id}
                    variant={currentStyle === style.id ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleStyleChange(style.id)}
                    className="text-xs px-2 py-1 h-auto"
                  >
                    {style.name}
                  </Button>
                ))}
              </div>
            </Card>
          </div>
        )}

        {/* Zoom Controls */}
        {showControls && !isLoading && !error && (
          <div className="absolute top-4 right-4 z-20 flex flex-col gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => map.current?.zoomIn()}
              className="w-8 h-8 p-0"
            >
              +
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => map.current?.zoomOut()}
              className="w-8 h-8 p-0"
            >
              −
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => map.current?.resetNorth()}
              className="w-8 h-8 p-0"
              title="Reset bearing"
            >
              ⊙
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SimpleMap;