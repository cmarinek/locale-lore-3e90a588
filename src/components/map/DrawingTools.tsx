import React, { useState, useCallback, useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Pencil,
  Circle,
  Square,
  Minus,
  Save,
  Trash2,
  Share2,
  X,
  Check
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthProvider';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

type DrawingType = 'line' | 'polygon' | 'circle' | 'rectangle' | null;

interface DrawingToolsProps {
  map: mapboxgl.Map | null;
  className?: string;
}

interface Drawing {
  id?: string;
  name: string;
  description: string;
  type: DrawingType;
  coordinates: number[][];
  color: string;
  isPublic: boolean;
}

export const DrawingTools: React.FC<DrawingToolsProps> = ({ map, className }) => {
  const { user } = useAuth();
  const [activeDrawingType, setActiveDrawingType] = useState<DrawingType>(null);
  const [currentDrawing, setCurrentDrawing] = useState<Drawing | null>(null);
  const [drawings, setDrawings] = useState<Drawing[]>([]);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [saveForm, setSaveForm] = useState({ name: '', description: '', isPublic: false });
  
  const drawingCoordinates = useRef<number[][]>([]);
  const tempLayerIds = useRef<string[]>([]);

  // Colors for drawing
  const colors = [
    'hsl(var(--primary))',
    'hsl(var(--accent))',
    'hsl(var(--destructive))',
    'hsl(var(--success))',
    'hsl(var(--warning))'
  ];
  const [selectedColor, setSelectedColor] = useState(colors[0]);

  // Clear temporary layers
  const clearTempLayers = useCallback(() => {
    if (!map) return;
    
    tempLayerIds.current.forEach(id => {
      if (map.getLayer(id)) map.removeLayer(id);
      if (map.getSource(id)) map.removeSource(id);
    });
    tempLayerIds.current = [];
  }, [map]);

  // Add point to current drawing
  const addDrawingPoint = useCallback((lngLat: mapboxgl.LngLat) => {
    if (!map || !activeDrawingType) return;

    const coords = [lngLat.lng, lngLat.lat];
    drawingCoordinates.current.push(coords);

    // Update visualization
    const sourceId = 'temp-drawing';
    const layerId = 'temp-drawing-layer';

    if (!tempLayerIds.current.includes(layerId)) {
      tempLayerIds.current.push(layerId);
    }

    if (map.getSource(sourceId)) {
      (map.getSource(sourceId)).setData({
        type: 'Feature',
        properties: {},
        geometry: activeDrawingType === 'line' 
          ? {
              type: 'LineString',
              coordinates: drawingCoordinates.current
            }
          : {
              type: 'Polygon',
              coordinates: [drawingCoordinates.current]
            }
      } as GeoJSON.Feature);
    } else {
      map.addSource(sourceId, {
        type: 'geojson',
        data: {
          type: 'Feature',
          properties: {},
          geometry: activeDrawingType === 'line'
            ? {
                type: 'LineString',
                coordinates: drawingCoordinates.current
              }
            : {
                type: 'Polygon',
                coordinates: [drawingCoordinates.current]
              }
        } as GeoJSON.Feature
      });

      if (activeDrawingType === 'line') {
        map.addLayer({
          id: layerId,
          type: 'line',
          source: sourceId,
          paint: {
            'line-color': selectedColor,
            'line-width': 3
          }
        });
      } else {
        map.addLayer({
          id: layerId,
          type: 'fill',
          source: sourceId,
          paint: {
            'fill-color': selectedColor,
            'fill-opacity': 0.3
          }
        });
        map.addLayer({
          id: `${layerId}-outline`,
          type: 'line',
          source: sourceId,
          paint: {
            'line-color': selectedColor,
            'line-width': 2
          }
        });
        tempLayerIds.current.push(`${layerId}-outline`);
      }
    }
  }, [map, activeDrawingType, selectedColor]);

  // Handle map click for drawing
  useEffect(() => {
    if (!map || !activeDrawingType) return;

    const handleClick = (e: mapboxgl.MapMouseEvent) => {
      addDrawingPoint(e.lngLat);
    };

    map.on('click', handleClick);
    map.getCanvas().style.cursor = 'crosshair';

    return () => {
      map.off('click', handleClick);
      map.getCanvas().style.cursor = '';
    };
  }, [map, activeDrawingType, addDrawingPoint]);

  // Start drawing
  const startDrawing = (type: DrawingType) => {
    if (!user) {
      toast.error('Please sign in to use drawing tools');
      return;
    }

    clearTempLayers();
    drawingCoordinates.current = [];
    setActiveDrawingType(type);
    toast.info(`Click on map to draw ${type}`);
  };

  // Finish drawing
  const finishDrawing = () => {
    if (drawingCoordinates.current.length < 2) {
      toast.error('Draw at least 2 points');
      return;
    }

    setCurrentDrawing({
      name: '',
      description: '',
      type: activeDrawingType,
      coordinates: [...drawingCoordinates.current],
      color: selectedColor,
      isPublic: false
    });
    setShowSaveDialog(true);
  };

  // Cancel drawing
  const cancelDrawing = () => {
    clearTempLayers();
    drawingCoordinates.current = [];
    setActiveDrawingType(null);
  };

  // Save drawing
  const saveDrawing = async () => {
    if (!currentDrawing || !user) return;

    try {
      const { data, error } = await supabase
        .from('map_drawings')
        .insert({
          user_id: user.id,
          name: saveForm.name,
          description: saveForm.description,
          drawing_type: currentDrawing.type,
          coordinates: currentDrawing.coordinates,
          style_properties: { color: currentDrawing.color },
          is_public: saveForm.isPublic
        })
        .select()
        .single();

      if (error) throw error;

      toast.success('Drawing saved!');
      setDrawings(prev => [...prev, { ...currentDrawing, id: data.id, ...saveForm }]);
      setShowSaveDialog(false);
      setSaveForm({ name: '', description: '', isPublic: false });
      cancelDrawing();
    } catch (error) {
      console.error('Error saving drawing:', error);
      toast.error('Failed to save drawing');
    }
  };

  // Share drawing
  const shareDrawing = async (drawingId: string) => {
    try {
      const shareToken = crypto.randomUUID();
      const { error } = await supabase
        .from('map_drawings')
        .update({ share_token: shareToken })
        .eq('id', drawingId);

      if (error) throw error;

      const shareUrl = `${window.location.origin}/map?drawing=${shareToken}`;
      await navigator.clipboard.writeText(shareUrl);
      toast.success('Share link copied to clipboard!');
    } catch (error) {
      console.error('Error sharing drawing:', error);
      toast.error('Failed to create share link');
    }
  };

  if (!user) return null;

  return (
    <>
      <Card className={`p-4 bg-background/95 backdrop-blur-sm border-border shadow-lg ${className}`}>
        <div className="space-y-4">
          {/* Drawing tools */}
          <div>
            <Label className="text-sm font-medium mb-2 block">Drawing Tools</Label>
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant={activeDrawingType === 'line' ? 'default' : 'outline'}
                size="sm"
                onClick={() => startDrawing('line')}
                disabled={!!activeDrawingType}
              >
                <Minus className="w-4 h-4 mr-2" />
                Line
              </Button>
              <Button
                variant={activeDrawingType === 'polygon' ? 'default' : 'outline'}
                size="sm"
                onClick={() => startDrawing('polygon')}
                disabled={!!activeDrawingType}
              >
                <Pencil className="w-4 h-4 mr-2" />
                Polygon
              </Button>
              <Button
                variant={activeDrawingType === 'circle' ? 'default' : 'outline'}
                size="sm"
                onClick={() => startDrawing('circle')}
                disabled={!!activeDrawingType}
              >
                <Circle className="w-4 h-4 mr-2" />
                Circle
              </Button>
              <Button
                variant={activeDrawingType === 'rectangle' ? 'default' : 'outline'}
                size="sm"
                onClick={() => startDrawing('rectangle')}
                disabled={!!activeDrawingType}
              >
                <Square className="w-4 h-4 mr-2" />
                Rectangle
              </Button>
            </div>
          </div>

          {/* Color picker */}
          <div>
            <Label className="text-sm font-medium mb-2 block">Color</Label>
            <div className="flex gap-2">
              {colors.map(color => (
                <button
                  key={color}
                  className={`w-8 h-8 rounded-full border-2 transition-all ${
                    selectedColor === color ? 'border-foreground scale-110' : 'border-border'
                  }`}
                  style={{ backgroundColor: color }}
                  onClick={() => setSelectedColor(color)}
                />
              ))}
            </div>
          </div>

          {/* Active drawing controls */}
          {activeDrawingType && (
            <div className="flex gap-2 pt-2 border-t border-border">
              <Button size="sm" variant="default" onClick={finishDrawing}>
                <Check className="w-4 h-4 mr-2" />
                Finish
              </Button>
              <Button size="sm" variant="outline" onClick={cancelDrawing}>
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
            </div>
          )}
        </div>
      </Card>

      {/* Save dialog */}
      <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save Drawing</DialogTitle>
            <DialogDescription>
              Give your drawing a name and description
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={saveForm.name}
                onChange={(e) => setSaveForm(prev => ({ ...prev, name: e.target.value }))}
                placeholder="My Drawing"
              />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={saveForm.description}
                onChange={(e) => setSaveForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Description..."
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="public"
                checked={saveForm.isPublic}
                onCheckedChange={(checked) => setSaveForm(prev => ({ ...prev, isPublic: checked }))}
              />
              <Label htmlFor="public">Make public</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSaveDialog(false)}>
              Cancel
            </Button>
            <Button onClick={saveDrawing} disabled={!saveForm.name}>
              <Save className="w-4 h-4 mr-2" />
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
