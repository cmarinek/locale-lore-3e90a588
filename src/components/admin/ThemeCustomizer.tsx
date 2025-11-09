import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useSiteConfiguration } from '@/hooks/useSiteConfiguration';
import { Palette, Loader2, RotateCcw } from 'lucide-react';

export const ThemeCustomizer: React.FC = () => {
  const { themeColors, isLoading, updateConfig } = useSiteConfiguration();
  const [colors, setColors] = useState({
    primary: '#007AFF',
    secondary: '#5856D6',
    accent: '#FF9500',
  });
  const [previewMode, setPreviewMode] = useState(false);

  useEffect(() => {
    if (themeColors) {
      setColors(themeColors);
    }
  }, [themeColors]);

  const applyPreview = () => {
    setPreviewMode(true);
    document.documentElement.style.setProperty('--color-primary', colors.primary);
    document.documentElement.style.setProperty('--color-secondary', colors.secondary);
    document.documentElement.style.setProperty('--color-accent', colors.accent);
  };

  const resetPreview = () => {
    setPreviewMode(false);
    if (themeColors) {
      setColors(themeColors);
      document.documentElement.style.setProperty('--color-primary', themeColors.primary);
      document.documentElement.style.setProperty('--color-secondary', themeColors.secondary);
      document.documentElement.style.setProperty('--color-accent', themeColors.accent);
    }
  };

  const saveColors = () => {
    updateConfig({ key: 'theme_colors', value: colors });
    setPreviewMode(false);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-foreground flex items-center gap-2">
          <Palette className="h-8 w-8" />
          Theme Customizer
        </h2>
        <p className="text-muted-foreground mt-2">
          Customize your site's color scheme with live preview
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Theme Colors</CardTitle>
            <CardDescription>Customize your brand colors</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="primary">Primary Color</Label>
                <div className="flex gap-4 mt-2">
                  <Input
                    id="primary"
                    type="color"
                    value={colors.primary}
                    onChange={(e) => setColors({ ...colors, primary: e.target.value })}
                    className="w-20 h-10"
                  />
                  <Input
                    value={colors.primary}
                    onChange={(e) => setColors({ ...colors, primary: e.target.value })}
                    placeholder="#007AFF"
                    className="flex-1"
                  />
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  Main brand color for buttons, links, and accents
                </p>
              </div>

              <div>
                <Label htmlFor="secondary">Secondary Color</Label>
                <div className="flex gap-4 mt-2">
                  <Input
                    id="secondary"
                    type="color"
                    value={colors.secondary}
                    onChange={(e) => setColors({ ...colors, secondary: e.target.value })}
                    className="w-20 h-10"
                  />
                  <Input
                    value={colors.secondary}
                    onChange={(e) => setColors({ ...colors, secondary: e.target.value })}
                    placeholder="#5856D6"
                    className="flex-1"
                  />
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  Secondary UI elements and surfaces
                </p>
              </div>

              <div>
                <Label htmlFor="accent">Accent Color</Label>
                <div className="flex gap-4 mt-2">
                  <Input
                    id="accent"
                    type="color"
                    value={colors.accent}
                    onChange={(e) => setColors({ ...colors, accent: e.target.value })}
                    className="w-20 h-10"
                  />
                  <Input
                    value={colors.accent}
                    onChange={(e) => setColors({ ...colors, accent: e.target.value })}
                    placeholder="#FF9500"
                    className="flex-1"
                  />
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  Highlights and special elements
                </p>
              </div>
            </div>

            <div className="flex gap-2 pt-4 border-t">
              <Button onClick={applyPreview} variant="outline" className="flex-1">
                Preview Changes
              </Button>
              {previewMode && (
                <Button onClick={resetPreview} variant="outline" size="icon">
                  <RotateCcw className="h-4 w-4" />
                </Button>
              )}
              <Button onClick={saveColors} className="flex-1">
                Save Colors
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Color Preview</CardTitle>
            <CardDescription>See how your colors look</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div 
                className="p-6 rounded-lg text-white font-semibold flex items-center justify-between"
                style={{ backgroundColor: colors.primary }}
              >
                <span>Primary Color</span>
                <Button 
                  size="sm" 
                  className="bg-white/20 hover:bg-white/30 text-white border-white/20"
                >
                  Button
                </Button>
              </div>
              <div 
                className="p-6 rounded-lg text-white font-semibold flex items-center justify-between"
                style={{ backgroundColor: colors.secondary }}
              >
                <span>Secondary Color</span>
                <Button 
                  size="sm" 
                  className="bg-white/20 hover:bg-white/30 text-white border-white/20"
                >
                  Button
                </Button>
              </div>
              <div 
                className="p-6 rounded-lg text-white font-semibold flex items-center justify-between"
                style={{ backgroundColor: colors.accent }}
              >
                <span>Accent Color</span>
                <Button 
                  size="sm" 
                  className="bg-white/20 hover:bg-white/30 text-white border-white/20"
                >
                  Button
                </Button>
              </div>
            </div>

            {previewMode && (
              <div className="bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mt-4">
                <p className="text-sm text-yellow-800 dark:text-yellow-200">
                  <strong>Preview Mode Active:</strong> Colors are temporarily applied. Save to make them permanent.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
