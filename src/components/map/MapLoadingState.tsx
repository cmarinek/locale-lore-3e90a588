import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, Loader2 } from 'lucide-react';
import { useAnimations } from '@/hooks/useAnimations';

interface MapLoadingStateProps {
  message?: string;
  showProgress?: boolean;
  progress?: number;
}

export const MapLoadingState: React.FC<MapLoadingStateProps> = ({
  message = "Loading amazing stories...",
  showProgress = false,
  progress = 0
}) => {
  const { shimmerVariants, shouldReduceMotion } = useAnimations();

  const pulseVariants = shouldReduceMotion ? {} : {
    scale: [1, 1.2, 1],
    opacity: [0.7, 1, 0.7],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: "easeInOut" as const
    }
  };

  return (
    <div className="absolute inset-0 z-20 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <motion.div
        className="flex flex-col items-center gap-6 p-8 bg-card/95 backdrop-blur-xl rounded-3xl border border-border/50 shadow-2xl max-w-sm mx-4"
        initial={{ opacity: 0, scale: 0.8, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: shouldReduceMotion ? 0 : 0.5, ease: "easeOut" }}
      >
        {/* Animated Map Icon */}
        <div className="relative">
          <motion.div
            className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center"
            animate={shouldReduceMotion ? {} : pulseVariants}
          >
            <MapPin className="h-8 w-8 text-primary" />
          </motion.div>
          
          {/* Spinning loader overlay */}
          <motion.div
            className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center"
            animate={shouldReduceMotion ? {} : { rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          >
            <Loader2 className="h-4 w-4 text-primary" />
          </motion.div>
        </div>

        {/* Loading Text */}
        <div className="text-center space-y-2">
          <h3 className="text-lg font-semibold text-foreground">
            {message}
          </h3>
          <p className="text-sm text-muted-foreground">
            Discovering local stories and legends
          </p>
        </div>

        {/* Progress Bar */}
        {showProgress && (
          <div className="w-full space-y-2">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Loading</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-primary to-primary/80 rounded-full"
                style={{
                  background: 'linear-gradient(90deg, hsl(var(--primary)), hsl(var(--primary))/0.8)'
                }}
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              />
            </div>
          </div>
        )}

        {/* Shimmer Effect */}
        <motion.div
          className="w-full h-1 bg-gradient-to-r from-transparent via-primary/30 to-transparent rounded-full"
          variants={shimmerVariants}
          animate="shimmer"
        />
      </motion.div>
    </div>
  );
};