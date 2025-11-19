import React, { useCallback, useEffect, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import { Button } from '@/components/ui/button';
import { Pencil, Square, Trash2, Save } from 'lucide-react';
import { toast } from 'sonner';

interface DrawingToolsProps {
  map: mapboxgl.Map | null;
  onSaveDrawing?: (drawing: GeoJSON.Feature) => void;
  initialDrawing?: GeoJSON.Feature;
}

export const MapDrawingTools: React.FC<DrawingToolsProps> = ({ 
  map, 
  onSaveDrawing,
  initialDrawing 
}) => {
  const [drawingMode, setDrawingMode] = useState<'line' | 'polygon' | null>(null);
  const [currentPoints, setCurrentPoints] = useState<[number, number][]>([]);
  const [isDrawing, setIsDrawing] = useState(false);

  // Initialize drawing layers
  useEffect(() => {
    if (!map) return;

    // Add drawing source
    if (!map.getSource('drawing')) {
      map.addSource('drawing', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: initialDrawing ? [initialDrawing] : []
        }
      });
    }

    // Add line layer
    if (!map.getLayer('drawing-line')) {
      map.addLayer({
        id: 'drawing-line',
        type: 'line',
        source: 'drawing',
        paint: {
          'line-color': '#FF6B6B',
          'line-width': 3,
          'line-opacity': 0.8
        },
        filter: ['==', ['geometry-type'], 'LineString']
      });
    }

    // Add polygon layer
    if (!map.getLayer('drawing-fill')) {
      map.addLayer({
        id: 'drawing-fill',
        type: 'fill',
        source: 'drawing',
        paint: {
          'fill-color': '#4ECDC4',
          'fill-opacity': 0.3
        },
        filter: ['==', ['geometry-type'], 'Polygon']
      });
    }

    // Add polygon outline
    if (!map.getLayer('drawing-outline')) {
      map.addLayer({
        id: 'drawing-outline',
        type: 'line',
        source: 'drawing',
        paint: {
          'line-color': '#4ECDC4',
          'line-width': 2,
          'line-opacity': 0.8
        },
        filter: ['==', ['geometry-type'], 'Polygon']
      });
    }

    // Add point markers for vertices
    if (!map.getLayer('drawing-points')) {
      map.addLayer({
        id: 'drawing-points',
        type: 'circle',
        source: 'drawing',
        paint: {
          'circle-radius': 5,
          'circle-color': '#fff',
          'circle-stroke-width': 2,
          'circle-stroke-color': '#FF6B6B'
        },
        filter: ['==', ['geometry-type'], 'Point']
      });
    }
  }, [map, initialDrawing]);

  // Handle map clicks for drawing
  const handleMapClick = useCallback((e: mapboxgl.MapMouseEvent) => {
    if (!drawingMode || !map) return;

    const { lng, lat } = e.lngLat;
    const newPoints = [...currentPoints, [lng, lat] as [number, number]];
    setCurrentPoints(newPoints);

    // Update the drawing on the map
    const source = map.getSource('drawing');
    if (!source) return;

    if (drawingMode === 'line' && newPoints.length >= 2) {
      source.setData({
        type: 'FeatureCollection',
        features: [{
          type: 'Feature',
          properties: {},
          geometry: {
            type: 'LineString',
            coordinates: newPoints
          }
        }]
      });
    } else if (drawingMode === 'polygon' && newPoints.length >= 3) {
      // Close the polygon by adding the first point at the end
      const closedPoints = [...newPoints, newPoints[0]];
      source.setData({
        type: 'FeatureCollection',
        features: [{
          type: 'Feature',
          properties: {},
          geometry: {
            type: 'Polygon',
            coordinates: [closedPoints]
          }
        }]
      });
    }

    toast.info(`Point ${newPoints.length} added`);
  }, [drawingMode, currentPoints, map]);

  // Attach/detach click handler
  useEffect(() => {
    if (!map || !isDrawing) return;

    map.on('click', handleMapClick);
    map.getCanvas().style.cursor = 'crosshair';

    return () => {
      map.off('click', handleMapClick);
      map.getCanvas().style.cursor = '';
    };
  }, [map, isDrawing, handleMapClick]);

  const startDrawing = (mode: 'line' | 'polygon') => {
    setDrawingMode(mode);
    setCurrentPoints([]);
    setIsDrawing(true);
    toast.info(`${mode === 'line' ? 'Route' : 'Area'} drawing started. Click on map to add points.`);
  };

  const finishDrawing = () => {
    if (!map) return;

    const source = map.getSource('drawing');
    if (!source) return;

    const data = source._data as GeoJSON.FeatureCollection;
    if (data.features.length > 0 && onSaveDrawing) {
      onSaveDrawing(data.features[0]);
      toast.success('Drawing saved!');
    }

    setIsDrawing(false);
    setDrawingMode(null);
  };

  const clearDrawing = () => {
    if (!map) return;

    const source = map.getSource('drawing');
    if (source) {
      source.setData({
        type: 'FeatureCollection',
        features: []
      });
    }

    setCurrentPoints([]);
    setIsDrawing(false);
    setDrawingMode(null);
    toast.info('Drawing cleared');
  };

  if (!map) return null;

  return (
    <div className="absolute top-4 right-4 bg-background/95 backdrop-blur-sm rounded-lg shadow-lg p-3 space-y-2 z-10">
      <h3 className="text-sm font-semibold mb-2">Drawing Tools</h3>
      
      <div className="flex flex-col gap-2">
        {!isDrawing ? (
          <>
            <Button
              size="sm"
              variant="outline"
              onClick={() => startDrawing('line')}
              className="justify-start gap-2"
            >
              <Pencil className="h-4 w-4" />
              Draw Route
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => startDrawing('polygon')}
              className="justify-start gap-2"
            >
              <Square className="h-4 w-4" />
              Draw Area
            </Button>
          </>
        ) : (
          <>
            <div className="text-xs text-muted-foreground mb-2">
              {currentPoints.length} point{currentPoints.length !== 1 ? 's' : ''} added
              <br />
              {drawingMode === 'polygon' ? 'Need 3+ for area' : 'Need 2+ for route'}
            </div>
            <Button
              size="sm"
              variant="default"
              onClick={finishDrawing}
              disabled={
                (drawingMode === 'line' && currentPoints.length < 2) ||
                (drawingMode === 'polygon' && currentPoints.length < 3)
              }
              className="justify-start gap-2"
            >
              <Save className="h-4 w-4" />
              Finish Drawing
            </Button>
          </>
        )}
        
        <Button
          size="sm"
          variant="destructive"
          onClick={clearDrawing}
          className="justify-start gap-2"
        >
          <Trash2 className="h-4 w-4" />
          Clear
        </Button>
      </div>
    </div>
  );
};
