import React, { useState } from 'react';
import { Card } from '@/components/ui/ios-card';
import { Input } from '@/components/ui/ios-input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/ios-badge';
import { UnifiedMap } from '@/components/map/UnifiedMap';
import { MapPin, Search } from 'lucide-react';
import { motion } from 'framer-motion';

interface StepLocationProps {
  data: {
    location_name: string;
    latitude: number | null;
    longitude: number | null;
  };
  onChange: (updates: { 
    location_name?: string; 
    latitude?: number | null; 
    longitude?: number | null; 
  }) => void;
  isContributor: boolean;
}

export const StepLocation: React.FC<StepLocationProps> = ({
  data,
  onChange,
  isContributor
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const handleMapClick = (fact: any) => {
    // This would be triggered by map clicks in a real implementation
    // For now, we'll just handle location selection through the map component
  };

  const handleLocationSelect = (lat: number, lng: number, locationName: string) => {
    onChange({
      latitude: lat,
      longitude: lng,
      location_name: locationName
    });
  };

  const clearLocation = () => {
    onChange({
      latitude: null,
      longitude: null,
      location_name: ''
    });
  };

  return (
    <div className="space-y-6">
      <Card className="p-6 bg-card/50 backdrop-blur">
        <div className="space-y-4">
          <div className="space-y-2">
            <h3 className="text-xl font-semibold text-foreground">Location & Geography</h3>
            <p className="text-muted-foreground">
              Pinpoint the exact location where your lore takes place. This helps others discover location-based stories.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="location_name" className="text-foreground">Location Name *</Label>
                <Input
                  id="location_name"
                  placeholder="e.g., Ancient Roman Forum, Rome, Italy"
                  value={data.location_name}
                  onChange={(e) => onChange({ location_name: e.target.value })}
                  className="bg-background/50"
                />
              </div>

              {data.latitude && data.longitude && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-2"
                >
                  <Label className="text-foreground">Coordinates</Label>
                  <div className="text-sm text-muted-foreground font-mono bg-background/50 p-3 rounded-lg border border-border">
                    <div>Latitude: {data.latitude.toFixed(6)}</div>
                    <div>Longitude: {data.longitude.toFixed(6)}</div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={clearLocation}
                    className="w-full"
                  >
                    Clear Location
                  </Button>
                </motion.div>
              )}

              {isContributor && (
                <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="default" className="bg-primary/20 text-primary">
                      Contributor
                    </Badge>
                    <span className="text-sm font-medium text-foreground">Enhanced Map</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Click on the map to precisely select your location. Drag to pan and scroll to zoom.
                  </p>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label className="text-foreground">Interactive Map</Label>
              <div className="aspect-square rounded-lg overflow-hidden border border-border">
                <UnifiedMap
                  className="w-full h-full"
                  center={
                    data.latitude && data.longitude
                      ? [data.longitude, data.latitude]
                      : [-74.0060, 40.7128] // Default to NYC
                  }
                  zoom={data.latitude && data.longitude ? 15 : 10}
                  onFactClick={handleMapClick}
                  showHeatmap={false}
                  enableClustering={false}
                  useScalableLoading={false}
                />
              </div>
            </div>
          </div>

          {!data.latitude && (
            <div className="text-center py-8 border-2 border-dashed border-border rounded-lg">
              <MapPin className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-foreground font-medium mb-2">No location selected</p>
              <p className="text-sm text-muted-foreground">
                {!isContributor 
                  ? 'Enter a location name above to continue'
                  : 'Click on the map above or enter a location name to select a precise location'
                }
              </p>
            </div>
          )}
        </div>
      </Card>

      {!isContributor && (
        <Card className="p-6 bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
              <MapPin className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-2">Become a Contributor for Interactive Maps</h4>
              <p className="text-sm text-muted-foreground mb-4">
                Contributors get access to interactive maps with precise coordinate selection, 
                multiple map styles, and enhanced location features.
              </p>
              <Button variant="outline" className="border-primary/30 text-primary hover:bg-primary/10">
                Learn More About Contributing
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};