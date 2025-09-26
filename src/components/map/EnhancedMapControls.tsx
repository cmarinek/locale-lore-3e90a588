import React from 'react';
import { Button } from '@/components/ui/button';
import { 
  ZoomIn, 
  ZoomOut, 
  Navigation, 
  MapPin, 
  Layers, 
  RotateCcw,
  Compass
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useAnimations } from '@/hooks/useAnimations';

interface EnhancedMapControlsProps {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onRecenter: () => void;
  onMyLocation: () => void;
  onStyleChange: () => void;
  onResetView: () => void;
  position?: 'right' | 'left';
  className?: string;
}

export const EnhancedMapControls: React.FC<EnhancedMapControlsProps> = ({
  onZoomIn,
  onZoomOut,
  onRecenter,
  onMyLocation,
  onStyleChange,
  onResetView,
  position = 'right',
  className = ''
}) => {
  const { cardVariants, shouldReduceMotion } = useAnimations();

  const containerVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: shouldReduceMotion ? 0 : 0.3,
        staggerChildren: shouldReduceMotion ? 0 : 0.05
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: shouldReduceMotion ? 0 : 0.2 }
    }
  };

  const controls = [
    { icon: ZoomIn, action: onZoomIn, label: 'Zoom In', variant: 'default' as const },
    { icon: ZoomOut, action: onZoomOut, label: 'Zoom Out', variant: 'default' as const },
    { icon: Navigation, action: onMyLocation, label: 'My Location', variant: 'secondary' as const },
    { icon: MapPin, action: onRecenter, label: 'Recenter', variant: 'secondary' as const },
    { icon: Layers, action: onStyleChange, label: 'Map Style', variant: 'outline' as const },
    { icon: RotateCcw, action: onResetView, label: 'Reset View', variant: 'outline' as const }
  ];

  return (
    <motion.div
      className={`
        fixed ${position === 'right' ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 z-30
        flex flex-col gap-0.5 p-1 
        bg-background/95 backdrop-blur-xl
        border border-border/50
        rounded-xl shadow-lg
        ${className}
      `}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {controls.map((control, index) => (
        <motion.div key={control.label} variants={itemVariants}>
          <Button
            variant={control.variant}
            size="icon"
            onClick={control.action}
            className={`
              h-10 w-10 rounded-lg
              shadow-md hover:shadow-lg
              transition-all duration-200
              hover:scale-105 active:scale-95
              backdrop-blur-sm
              ${control.variant === 'default' ? 'bg-primary hover:bg-primary/90' : ''}
              ${control.variant === 'secondary' ? 'bg-secondary hover:bg-secondary/90' : ''}
              ${control.variant === 'outline' ? 'hover:bg-accent' : ''}
            `}
            aria-label={control.label}
          >
            <control.icon className="h-4 w-4" />
          </Button>
        </motion.div>
      ))}
      
      {/* Compass indicator */}
      <motion.div 
        className="mt-1 flex justify-center"
        variants={itemVariants}
      >
        <div className="w-6 h-6 rounded-full bg-accent/20 flex items-center justify-center">
          <Compass className="h-3 w-3 text-muted-foreground" />
        </div>
      </motion.div>
    </motion.div>
  );
};