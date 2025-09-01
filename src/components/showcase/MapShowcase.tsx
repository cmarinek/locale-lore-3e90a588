import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/ios-card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/ios-badge';
import AdvancedMap from '@/components/ui/AdvancedMap';
import { FactMarker } from '@/types/map';
import { 
  Map as MapIcon, 
  MapPin, 
  Zap, 
  Eye,
  Navigation,
  Layers
} from 'lucide-react';

const MapShowcase = () => {
  const [selectedFact, setSelectedFact] = useState<FactMarker | null>(null);
  const [showHeatmap, setShowHeatmap] = useState(false);

  const handleFactClick = (fact: FactMarker) => {
    setSelectedFact(fact);
  };

  const categoryColors: Record<string, string> = {
    history: 'hsl(211 100% 50%)',
    culture: 'hsl(262 52% 47%)', 
    legend: 'hsl(45 93% 47%)',
    nature: 'hsl(142 71% 45%)',
    mystery: 'hsl(0 84% 60%)'
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
            <MapIcon className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-3xl font-bold">Advanced Map Component</h2>
            <p className="text-muted-foreground">Sophisticated mapping with Mapbox GL JS</p>
          </div>
        </div>
      </div>

      {/* Features Overview */}
      <div className="grid md:grid-cols-3 gap-6">
        <Card variant="glass">
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Zap className="w-6 h-6 text-blue-500" />
            </div>
            <h3 className="font-semibold mb-2">Performance Optimized</h3>
            <p className="text-sm text-muted-foreground">Handles 1000+ markers with smooth clustering and animations</p>
          </CardContent>
        </Card>

        <Card variant="glass">
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Navigation className="w-6 h-6 text-green-500" />
            </div>
            <h3 className="font-semibold mb-2">Smart Geolocation</h3>
            <p className="text-sm text-muted-foreground">Precise location detection with smooth navigation controls</p>
          </CardContent>
        </Card>

        <Card variant="glass">
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 bg-purple-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Layers className="w-6 h-6 text-purple-500" />
            </div>
            <h3 className="font-semibold mb-2">Multiple Styles</h3>
            <p className="text-sm text-muted-foreground">Light, dark, satellite, and terrain map styles</p>
          </CardContent>
        </Card>
      </div>

      {/* Map Controls */}
      <Card variant="elevated">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full" />
            Interactive Map Demo
          </CardTitle>
          <CardDescription>
            Explore the map with clustering, search, and multiple view modes
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-3">
            <Button
              variant={showHeatmap ? 'ios' : 'outline'}
              size="sm"
              onClick={() => setShowHeatmap(!showHeatmap)}
            >
              <Eye className="w-4 h-4 mr-2" />
              {showHeatmap ? 'Hide' : 'Show'} Heatmap
            </Button>
            <Badge variant="notification">
              100+ Facts
            </Badge>
            <Badge variant="chip">
              Live Clustering
            </Badge>
            <Badge variant="glass">
              Smooth Animations
            </Badge>
          </div>
          
          {/* Map Container */}
          <div className="h-[500px] w-full rounded-xl overflow-hidden border">
            <AdvancedMap
              className="w-full h-full"
              initialCenter={[-74.0060, 40.7128]}
              initialZoom={10}
              onFactClick={handleFactClick}
              showHeatmap={showHeatmap}
            />
          </div>

          {/* Selected Fact Info */}
          {selectedFact && (
            <Card variant="glass" className="mt-4">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div 
                    className="w-4 h-4 rounded-full border-2 border-white shadow-sm mt-1"
                    style={{ backgroundColor: categoryColors[selectedFact.category] }}
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold">{selectedFact.title}</h4>
                      {selectedFact.verified && (
                        <Badge variant="ios" size="sm">Verified</Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground capitalize">
                      {selectedFact.category} • Score: {selectedFact.voteScore}
                      {selectedFact.authorName && ` • by ${selectedFact.authorName}`}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedFact(null)}
                  >
                    ×
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>

      {/* Features List */}
      <Card variant="elevated">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full" />
            Advanced Features
          </CardTitle>
          <CardDescription>
            Built-in capabilities for a production-ready mapping experience
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="font-semibold">Core Features</h4>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full" />
                  Smooth cluster animations for fact markers
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full" />
                  Custom marker designs matching app theme
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full" />
                  Gesture controls (pinch-to-zoom, smooth panning)
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full" />
                  Multiple map styles (light/dark/satellite/terrain)
                </li>
              </ul>
            </div>
            
            <div className="space-y-4">
              <h4 className="font-semibold">Advanced Capabilities</h4>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                  Geolocation integration with precise detection
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                  Search autocomplete for locations
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                  Heat map overlay for fact density
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                  Performance optimized for 1000+ markers
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Setup Instructions */}
      <Card variant="glass">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            Setup Instructions
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-amber-50 dark:bg-amber-950 rounded-lg border border-amber-200 dark:border-amber-800">
            <h4 className="font-semibold text-amber-800 dark:text-amber-200 mb-2">
              🔑 Mapbox Token Required
            </h4>
            <p className="text-sm text-amber-700 dark:text-amber-300">
              To use this map component, you need to:
            </p>
            <ol className="list-decimal list-inside text-sm text-amber-700 dark:text-amber-300 mt-2 space-y-1">
              <li>Get your Mapbox public token from <a href="https://mapbox.com/" target="_blank" rel="noopener noreferrer" className="underline">mapbox.com</a></li>
              <li>Add it to your Supabase Edge Function Secrets as <code className="bg-amber-200 dark:bg-amber-900 px-1 rounded">MAPBOX_PUBLIC_TOKEN</code></li>
              <li>The map component will automatically use the secure token</li>
            </ol>
          </div>
          
          <div className="text-sm text-muted-foreground">
            <p>
              <strong>✅ Real-time Integration:</strong> This map is now connected to your Supabase facts table 
              with live updates and clustering. New facts will appear automatically!
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MapShowcase;