import React, { useEffect, useRef, useState, useCallback } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { mapboxService } from '@/services/mapboxService';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthProvider';
import { Sun, Moon, Map, Satellite } from 'lucide-react';
import { useFavoriteCities } from '@/hooks/useFavoriteCities';
import { FactMarker } from '@/types/map';

interface MapStyle {
  id: string;
  name: string;
  style: string;
  icon: any;
}

interface FavoriteCity {
  name: string;
  emoji: string;
  lat: number;
  lng: number;
}

const mapStyles: MapStyle[] = [
  { id: 'light', name: 'Light', style: 'mapbox://styles/mapbox/light-v11', icon: Sun },
  { id: 'dark', name: 'Dark', style: 'mapbox://styles/mapbox/dark-v11', icon: Moon },
  { id: 'streets', name: 'Streets', style: 'mapbox://styles/mapbox/streets-v12', icon: Map },
  { id: 'satellite', name: 'Satellite', style: 'mapbox://styles/mapbox/satellite-v9', icon: Satellite },
];

interface SimpleMapProps {
  onFactClick?: (fact: FactMarker) => void;
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
  const [facts, setFacts] = useState<FactMarker[]>([]);
  const { user } = useAuth();
  const { favoriteCities } = useFavoriteCities();

  // Fetch real facts from database
  const fetchRealFacts = useCallback(async () => {
    try {
      console.log('🔄 Fetching real facts from database...');
      const { data: factData, error } = await supabase
        .from('facts')
        .select(`
          id,
          title,
          description,
          latitude,
          longitude,
          category_id,
          status,
          vote_count_up,
          vote_count_down,
          categories!facts_category_id_fkey(
            slug,
            icon,
            color
          ),
          profiles!facts_author_id_fkey(
            username,
            avatar_url
          )
        `)
        .not('latitude', 'is', null)
        .not('longitude', 'is', null)
        .in('status', ['verified', 'pending']);

      if (error) throw error;
      
      const transformedFacts: FactMarker[] = (factData || []).map(fact => ({
        id: fact.id,
        title: fact.title,
        latitude: typeof fact.latitude === 'string' ? parseFloat(fact.latitude) : fact.latitude,
        longitude: typeof fact.longitude === 'string' ? parseFloat(fact.longitude) : fact.longitude,
        category: fact.categories?.slug || 'default',
        verified: fact.status === 'verified',
        voteScore: (fact.vote_count_up || 0) - (fact.vote_count_down || 0),
        authorName: fact.profiles?.username || 'Anonymous'
      }));
      
      console.log(`✅ Loaded ${transformedFacts.length} real facts`);
      setFacts(transformedFacts);
      return transformedFacts;
    } catch (error) {
      console.error('❌ Error fetching facts:', error);
      setError('Failed to load fact data');
      return [];
    }
  }, []);

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

        // Add navigation controls at 50vh
        mapInstance.addControl(new mapboxgl.NavigationControl({ 
          showCompass: true,
          showZoom: true 
        }), 'top-right');

        // Position native controls at 50vh via CSS
        setTimeout(() => {
          const controls = mapContainer.current?.querySelector('.mapboxgl-ctrl-top-right');
          if (controls) {
            (controls as HTMLElement).style.top = '50vh';
            (controls as HTMLElement).style.transform = 'translateY(-50%)';
          }
        }, 100);

        mapInstance.on('load', async () => {
          if (!mounted) return;
          
          console.log('🗺️ SimpleMap: Map loaded successfully');
          
          // Load real facts from database
          const realFacts = await fetchRealFacts();
          
          // Convert facts to GeoJSON features
          const features = realFacts.map(fact => ({
            type: 'Feature' as const,
            properties: {
              id: fact.id,
              title: fact.title,
              category: fact.category,
              verified: fact.verified,
              voteScore: fact.voteScore,
              authorName: fact.authorName
            },
            geometry: {
              type: 'Point' as const,
              coordinates: [fact.longitude, fact.latitude]
            }
          }));
          
          // Add real data source for clustering
          mapInstance.addSource('facts', {
            type: 'geojson',
            data: {
              type: 'FeatureCollection',
              features
            },
            cluster: true,
            clusterMaxZoom: 14,
            clusterRadius: 50
          });

          // Modern gradient-based cluster circles with glassmorphism
          mapInstance.addLayer({
            id: 'clusters',
            type: 'circle',
            source: 'facts',
            filter: ['has', 'point_count'],
            paint: {
              'circle-color': [
                'interpolate',
                ['linear'],
                ['get', 'point_count'],
                2, 'hsl(200, 80%, 60%)',
                5, 'hsl(280, 70%, 65%)',
                10, 'hsl(320, 75%, 60%)',
                20, 'hsl(350, 80%, 65%)',
                50, 'hsl(20, 85%, 60%)'
              ],
              'circle-radius': [
                'interpolate',
                ['exponential', 1.5],
                ['get', 'point_count'],
                2, 25,
                5, 35,
                10, 45,
                20, 55,
                50, 70
              ],
              'circle-stroke-width': 3,
              'circle-stroke-color': 'rgba(255, 255, 255, 0.8)',
              'circle-opacity': 0.85,
              'circle-stroke-opacity': 0.9
            }
          });

          // Add inner glow effect for clusters
          mapInstance.addLayer({
            id: 'clusters-glow',
            type: 'circle',
            source: 'facts',
            filter: ['has', 'point_count'],
            paint: {
              'circle-color': [
                'interpolate',
                ['linear'],
                ['get', 'point_count'],
                2, 'hsl(200, 80%, 60%)',
                5, 'hsl(280, 70%, 65%)',
                10, 'hsl(320, 75%, 60%)',
                20, 'hsl(350, 80%, 65%)',
                50, 'hsl(20, 85%, 60%)'
              ],
              'circle-radius': [
                'interpolate',
                ['exponential', 1.5],
                ['get', 'point_count'],
                2, 15,
                5, 22,
                10, 28,
                20, 35,
                50, 45
              ],
              'circle-opacity': 0.4,
              'circle-blur': 1
            }
          });

          // Modern cluster count with better typography
          mapInstance.addLayer({
            id: 'cluster-count',
            type: 'symbol',
            source: 'facts',
            filter: ['has', 'point_count'],
            layout: {
              'text-field': '{point_count_abbreviated}',
              'text-font': ['DIN Offc Pro Bold', 'Arial Unicode MS Bold'],
              'text-size': [
                'interpolate',
                ['linear'],
                ['get', 'point_count'],
                2, 14,
                10, 16,
                50, 18
              ]
            },
            paint: {
              'text-color': 'rgba(255, 255, 255, 0.95)',
              'text-halo-color': 'rgba(0, 0, 0, 0.4)',
              'text-halo-width': 1
            }
          });

          // Modern individual points with category-based colors
          mapInstance.addLayer({
            id: 'unclustered-point',
            type: 'circle',
            source: 'facts',
            filter: ['!', ['has', 'point_count']],
            paint: {
              'circle-color': [
                'case',
                ['==', ['get', 'verified'], true], 'hsl(142, 70%, 50%)',
                'hsl(210, 80%, 55%)'
              ],
              'circle-radius': [
                'interpolate',
                ['linear'],
                ['zoom'],
                10, 8,
                14, 12,
                16, 16
              ],
              'circle-stroke-width': 2,
              'circle-stroke-color': 'rgba(255, 255, 255, 0.9)',
              'circle-opacity': 0.9,
              'circle-stroke-opacity': 1
            }
          });

          // Add verified badge layer for individual points
          mapInstance.addLayer({
            id: 'verified-points',
            type: 'symbol',
            source: 'facts',
            filter: ['all', ['!', ['has', 'point_count']], ['==', ['get', 'verified'], true]],
            layout: {
              'icon-image': 'custom-verified-icon',
              'icon-size': 0.8,
              'icon-allow-overlap': true,
              'icon-ignore-placement': true
            }
          });

          // Enhanced click events with smooth animations
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
                zoom: Math.min(zoom + 1, 16),
                duration: 800,
                curve: 1.4
              });
            });
          });

          mapInstance.on('click', 'unclustered-point', (e) => {
            const feature = e.features[0];
            if (onFactClick && feature.properties) {
              // Convert to FactMarker format
              const factMarker: FactMarker = {
                id: feature.properties.id,
                title: feature.properties.title,
                latitude: (feature.geometry as any).coordinates[1],
                longitude: (feature.geometry as any).coordinates[0],
                category: feature.properties.category,
                verified: feature.properties.verified,
                voteScore: feature.properties.voteScore,
                authorName: feature.properties.authorName
              };
              onFactClick(factMarker);
            }
          });

          // Enhanced hover effects with smooth transitions
          ['clusters', 'clusters-glow'].forEach(layerId => {
            mapInstance.on('mouseenter', layerId, () => {
              mapInstance.getCanvas().style.cursor = 'pointer';
              mapInstance.setPaintProperty(layerId, 'circle-opacity', 1);
            });
            mapInstance.on('mouseleave', layerId, () => {
              mapInstance.getCanvas().style.cursor = '';
              mapInstance.setPaintProperty(layerId, 'circle-opacity', layerId === 'clusters' ? 0.85 : 0.4);
            });
          });

          mapInstance.on('mouseenter', 'unclustered-point', () => {
            mapInstance.getCanvas().style.cursor = 'pointer';
            mapInstance.setPaintProperty('unclustered-point', 'circle-radius', [
              'interpolate',
              ['linear'],
              ['zoom'],
              10, 10,
              14, 15,
              16, 20
            ]);
          });
          mapInstance.on('mouseleave', 'unclustered-point', () => {
            mapInstance.getCanvas().style.cursor = '';
            mapInstance.setPaintProperty('unclustered-point', 'circle-radius', [
              'interpolate',
              ['linear'],
              ['zoom'],
              10, 8,
              14, 12,
              16, 16
            ]);
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
        
        // Re-add sources and layers after style change with modern design
        map.current.once('style.load', () => {
          if (!map.current) return;
          
          // Convert current facts to GeoJSON features
          const features = facts.map(fact => ({
            type: 'Feature' as const,
            properties: {
              id: fact.id,
              title: fact.title,
              category: fact.category,
              verified: fact.verified,
              voteScore: fact.voteScore,
              authorName: fact.authorName
            },
            geometry: {
              type: 'Point' as const,
              coordinates: [fact.longitude, fact.latitude]
            }
          }));
          
          // Re-add the facts source and layers with modern styling
          map.current.addSource('facts', {
            type: 'geojson',
            data: {
              type: 'FeatureCollection',
              features
            },
            cluster: true,
            clusterMaxZoom: 14,
            clusterRadius: 50
          });

          // Re-add all modern layers
          map.current.addLayer({
            id: 'clusters',
            type: 'circle',
            source: 'facts',
            filter: ['has', 'point_count'],
            paint: {
              'circle-color': [
                'interpolate',
                ['linear'],
                ['get', 'point_count'],
                2, 'hsl(200, 80%, 60%)',
                5, 'hsl(280, 70%, 65%)',
                10, 'hsl(320, 75%, 60%)',
                20, 'hsl(350, 80%, 65%)',
                50, 'hsl(20, 85%, 60%)'
              ],
              'circle-radius': [
                'interpolate',
                ['exponential', 1.5],
                ['get', 'point_count'],
                2, 25,
                5, 35,
                10, 45,
                20, 55,
                50, 70
              ],
              'circle-stroke-width': 3,
              'circle-stroke-color': 'rgba(255, 255, 255, 0.8)',
              'circle-opacity': 0.85,
              'circle-stroke-opacity': 0.9
            }
          });

          map.current.addLayer({
            id: 'clusters-glow',
            type: 'circle',
            source: 'facts',
            filter: ['has', 'point_count'],
            paint: {
              'circle-color': [
                'interpolate',
                ['linear'],
                ['get', 'point_count'],
                2, 'hsl(200, 80%, 60%)',
                5, 'hsl(280, 70%, 65%)',
                10, 'hsl(320, 75%, 60%)',
                20, 'hsl(350, 80%, 65%)',
                50, 'hsl(20, 85%, 60%)'
              ],
              'circle-radius': [
                'interpolate',
                ['exponential', 1.5],
                ['get', 'point_count'],
                2, 15,
                5, 22,
                10, 28,
                20, 35,
                50, 45
              ],
              'circle-opacity': 0.4,
              'circle-blur': 1
            }
          });

          map.current.addLayer({
            id: 'cluster-count',
            type: 'symbol',
            source: 'facts',
            filter: ['has', 'point_count'],
            layout: {
              'text-field': '{point_count_abbreviated}',
              'text-font': ['DIN Offc Pro Bold', 'Arial Unicode MS Bold'],
              'text-size': [
                'interpolate',
                ['linear'],
                ['get', 'point_count'],
                2, 14,
                10, 16,
                50, 18
              ]
            },
            paint: {
              'text-color': 'rgba(255, 255, 255, 0.95)',
              'text-halo-color': 'rgba(0, 0, 0, 0.4)',
              'text-halo-width': 1
            }
          });

          map.current.addLayer({
            id: 'unclustered-point',
            type: 'circle',
            source: 'facts',
            filter: ['!', ['has', 'point_count']],
            paint: {
              'circle-color': [
                'case',
                ['==', ['get', 'verified'], true], 'hsl(142, 70%, 50%)',
                'hsl(210, 80%, 55%)'
              ],
              'circle-radius': [
                'interpolate',
                ['linear'],
                ['zoom'],
                10, 8,
                14, 12,
                16, 16
              ],
              'circle-stroke-width': 2,
              'circle-stroke-color': 'rgba(255, 255, 255, 0.9)',
              'circle-opacity': 0.9,
              'circle-stroke-opacity': 1
            }
          });
        });
      }
    }
  };

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
        <div className="absolute inset-0 bg-background/90 backdrop-blur-sm flex items-center justify-center z-10">
          <div className="text-center space-y-4 p-6 bg-card/95 rounded-xl shadow-xl max-w-sm">
            <div className="relative">
              <div className="animate-spin h-12 w-12 border-4 border-primary/30 border-t-primary rounded-full mx-auto" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="animate-pulse h-4 w-4 bg-primary rounded-full" />
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-lg font-semibold">Loading World-Class Map</p>
              <p className="text-sm text-muted-foreground">Fetching {facts.length > 0 ? facts.length : '60+'} real stories from around the world...</p>
            </div>
            <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-primary to-primary/60 rounded-full animate-pulse" style={{ width: '75%' }} />
            </div>
          </div>
        </div>
      )}
        
        {/* Modern Map Style Controls - Left side at 50vh */}
        {showControls && !isLoading && !error && (
          <div className="absolute left-4 z-20 flex flex-col gap-3" style={{ top: '50vh', transform: 'translateY(-50%)' }}>
            <Card className="p-3 shadow-xl backdrop-blur-md bg-background/95 border-primary/20 rounded-xl">
              <div className="flex flex-col gap-2">
                {mapStyles.map((style) => {
                  const IconComponent = style.icon;
                  return (
                    <Button
                      key={style.id}
                      variant={currentStyle === style.id ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleStyleChange(style.id)}
                      className={`p-2 h-auto min-h-[44px] w-[44px] justify-center transition-all duration-200 hover:scale-105 ${
                        currentStyle === style.id 
                          ? 'shadow-lg bg-gradient-to-br from-primary to-primary/80 border-primary/30' 
                          : 'hover:shadow-md hover:bg-accent/50 border-border/50'
                      }`}
                      title={style.name}
                    >
                      <IconComponent size={18} />
                    </Button>
                  );
                })}
              </div>
            </Card>
          </div>
        )}

        {/* Quick Location Controls - Only for authenticated users with favorite cities */}
        {showControls && !isLoading && !error && user && favoriteCities.length > 0 && (
          <div className="absolute left-4 z-20 flex flex-col gap-2" style={{ top: '50vh', transform: 'translateY(-50%) translateY(140px)' }}>
            <Card className="p-2 shadow-lg backdrop-blur-sm bg-background/90 border-primary/20">
              <div className="flex flex-col gap-1">
                {favoriteCities.map((city, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    onClick={() => map.current?.flyTo({ 
                      center: [city.lng, city.lat], 
                      zoom: 10,
                      duration: 1200,
                      curve: 1.4
                    })}
                    className="text-sm p-2 h-auto min-h-[40px] w-[40px] justify-center hover:scale-110 transition-all duration-200 hover:shadow-lg"
                    title={`Fly to ${city.name}`}
                  >
                    {city.emoji}
                  </Button>
                ))}
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default SimpleMap;