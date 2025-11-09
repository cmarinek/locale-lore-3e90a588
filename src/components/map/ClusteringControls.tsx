import React from 'react';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Settings2, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';

interface ClusteringControlsProps {
  clusterRadius: number;
  onClusterRadiusChange: (value: number) => void;
  animationSpeed: number;
  onAnimationSpeedChange: (value: number) => void;
  enableClustering: boolean;
  onClusteringToggle: (enabled: boolean) => void;
  className?: string;
}

export const ClusteringControls: React.FC<ClusteringControlsProps> = ({
  clusterRadius,
  onClusterRadiusChange,
  animationSpeed,
  onAnimationSpeedChange,
  enableClustering,
  onClusteringToggle,
  className = ''
}) => {
  const [isExpanded, setIsExpanded] = React.useState(false);

  return (
    <div className={`relative ${className}`}>
      {/* Toggle Button */}
      <Button
        variant="outline"
        size="icon"
        onClick={() => setIsExpanded(!isExpanded)}
        className="h-10 w-10 rounded-lg shadow-lg hover:shadow-xl bg-background/95 backdrop-blur-xl border-border/50"
        aria-label="Clustering settings"
      >
        <Settings2 className={`h-4 w-4 transition-transform duration-300 ${isExpanded ? 'rotate-90' : ''}`} />
      </Button>

      {/* Expanded Controls */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute top-12 left-0 z-40"
          >
            <Card className="p-4 w-64 bg-background/95 backdrop-blur-xl border-border/50 shadow-xl">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold flex items-center gap-2">
                    <Settings2 className="h-4 w-4" />
                    Clustering Settings
                  </h3>
                </div>

                {/* Enable/Disable Clustering */}
                <div className="flex items-center justify-between">
                  <Label htmlFor="clustering-toggle" className="text-sm">
                    Enable Clustering
                  </Label>
                  <Switch
                    id="clustering-toggle"
                    checked={enableClustering}
                    onCheckedChange={onClusteringToggle}
                  />
                </div>

                {/* Cluster Radius Control */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="cluster-radius" className="text-sm">
                      Cluster Size
                    </Label>
                    <span className="text-xs text-muted-foreground">{clusterRadius}px</span>
                  </div>
                  <Slider
                    id="cluster-radius"
                    min={20}
                    max={150}
                    step={10}
                    value={[clusterRadius]}
                    onValueChange={(values) => onClusterRadiusChange(values[0])}
                    disabled={!enableClustering}
                    className="w-full"
                  />
                  <p className="text-xs text-muted-foreground">
                    Smaller = more clusters, larger = fewer clusters
                  </p>
                </div>

                {/* Animation Speed Control */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="animation-speed" className="text-sm flex items-center gap-1">
                      <Zap className="h-3 w-3" />
                      Animation Speed
                    </Label>
                    <span className="text-xs text-muted-foreground">{animationSpeed}ms</span>
                  </div>
                  <Slider
                    id="animation-speed"
                    min={200}
                    max={2000}
                    step={100}
                    value={[animationSpeed]}
                    onValueChange={(values) => onAnimationSpeedChange(values[0])}
                    disabled={!enableClustering}
                    className="w-full"
                  />
                  <p className="text-xs text-muted-foreground">
                    Faster = smoother transitions, slower = more detail
                  </p>
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
