
import React, { useState, useRef, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Crop, RotateCw, Palette, Download, Undo, Redo } from 'lucide-react';
import { motion } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';

interface MediaEditorProps {
  imageUrl: string;
  onSave?: (editedImageUrl: string) => void;
  onCancel?: () => void;
}

export const MediaEditor: React.FC<MediaEditorProps> = ({
  imageUrl,
  onSave,
  onCancel
}) => {
  const { toast } = useToast();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [editing, setEditing] = useState(false);
  const [activeFilter, setActiveFilter] = useState<string>('none');
  const [brightness, setBrightness] = useState([100]);
  const [contrast, setContrast] = useState([100]);
  const [saturation, setSaturation] = useState([100]);
  const [rotation, setRotation] = useState(0);
  const [cropMode, setCropMode] = useState(false);
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  const filters = [
    { name: 'None', value: 'none' },
    { name: 'Grayscale', value: 'grayscale(100%)' },
    { name: 'Sepia', value: 'sepia(100%)' },
    { name: 'Vintage', value: 'sepia(50%) contrast(120%) brightness(110%)' },
    { name: 'Cool', value: 'hue-rotate(180deg) saturate(120%)' },
    { name: 'Warm', value: 'hue-rotate(30deg) saturate(110%) brightness(105%)' }
  ];

  const applyFilters = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const filterString = [
      `brightness(${brightness[0]}%)`,
      `contrast(${contrast[0]}%)`,
      `saturate(${saturation[0]}%)`,
      activeFilter !== 'none' ? activeFilter : ''
    ].filter(Boolean).join(' ');

    ctx.filter = filterString;
    
    // Save state for undo/redo
    const imageData = canvas.toDataURL();
    setHistory(prev => [...prev.slice(0, historyIndex + 1), imageData]);
    setHistoryIndex(prev => prev + 1);
  }, [brightness, contrast, saturation, activeFilter, historyIndex]);

  const rotateImage = () => {
    setRotation(prev => (prev + 90) % 360);
    applyFilters();
  };

  const undo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(prev => prev - 1);
      // Apply previous state
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(prev => prev + 1);
      // Apply next state
    }
  };

  const saveImage = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    try {
      setEditing(true);
      
      // Convert canvas to blob
      canvas.toBlob(async (blob) => {
        if (!blob) return;
        
        // Create object URL for the edited image
        const editedUrl = URL.createObjectURL(blob);
        onSave?.(editedUrl);
        
        toast({
          title: "Success",
          description: "Image edited successfully"
        });
      }, 'image/jpeg', 0.9);
    } catch (error) {
      console.error('Error saving image:', error);
      toast({
        title: "Error",
        description: "Failed to save edited image",
        variant: "destructive"
      });
    } finally {
      setEditing(false);
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Palette className="w-5 h-5" />
            Media Editor
          </span>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={undo}
              disabled={historyIndex <= 0}
            >
              <Undo className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={redo}
              disabled={historyIndex >= history.length - 1}
            >
              <Redo className="w-4 h-4" />
            </Button>
          </div>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Image Preview */}
        <div className="relative bg-checkered rounded-lg overflow-hidden">
          <canvas
            ref={canvasRef}
            className="max-w-full h-auto mx-auto"
            style={{
              transform: `rotate(${rotation}deg)`,
              filter: `brightness(${brightness[0]}%) contrast(${contrast[0]}%) saturate(${saturation[0]}%) ${activeFilter !== 'none' ? activeFilter : ''}`
            }}
          />
          <img
            src={imageUrl}
            alt="Original"
            className="hidden"
            onLoad={(e) => {
              const canvas = canvasRef.current;
              const img = e.target as HTMLImageElement;
              if (canvas) {
                canvas.width = img.naturalWidth;
                canvas.height = img.naturalHeight;
                const ctx = canvas.getContext('2d');
                if (ctx) {
                  ctx.drawImage(img, 0, 0);
                }
              }
            }}
          />
        </div>

        {/* Filter Presets */}
        <div className="space-y-3">
          <h3 className="font-semibold">Filters</h3>
          <div className="flex flex-wrap gap-2">
            {filters.map((filter) => (
              <Badge
                key={filter.name}
                variant={activeFilter === filter.value ? "default" : "outline"}
                className="cursor-pointer hover:bg-primary/80"
                onClick={() => {
                  setActiveFilter(filter.value);
                  applyFilters();
                }}
              >
                {filter.name}
              </Badge>
            ))}
          </div>
        </div>

        {/* Adjustment Controls */}
        <div className="grid md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium">Brightness</label>
            <Slider
              value={brightness}
              onValueChange={(value) => {
                setBrightness(value);
                applyFilters();
              }}
              min={0}
              max={200}
              step={1}
              className="w-full"
            />
            <span className="text-xs text-muted-foreground">{brightness[0]}%</span>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Contrast</label>
            <Slider
              value={contrast}
              onValueChange={(value) => {
                setContrast(value);
                applyFilters();
              }}
              min={0}
              max={200}
              step={1}
              className="w-full"
            />
            <span className="text-xs text-muted-foreground">{contrast[0]}%</span>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Saturation</label>
            <Slider
              value={saturation}
              onValueChange={(value) => {
                setSaturation(value);
                applyFilters();
              }}
              min={0}
              max={200}
              step={1}
              className="w-full"
            />
            <span className="text-xs text-muted-foreground">{saturation[0]}%</span>
          </div>
        </div>

        {/* Tools */}
        <div className="flex flex-wrap gap-3">
          <Button
            variant="outline"
            onClick={rotateImage}
            className="flex items-center gap-2"
          >
            <RotateCw className="w-4 h-4" />
            Rotate
          </Button>

          <Button
            variant="outline"
            onClick={() => setCropMode(!cropMode)}
            className={`flex items-center gap-2 ${cropMode ? 'bg-primary text-primary-foreground' : ''}`}
          >
            <Crop className="w-4 h-4" />
            {cropMode ? 'Exit Crop' : 'Crop'}
          </Button>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between pt-4 border-t">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button
            onClick={saveImage}
            disabled={editing}
            className="flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            {editing ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
