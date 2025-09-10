import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface LoadingIntroductionProps {
  className?: string;
  onComplete?: () => void;
  minDisplayTime?: number;
}

export const LoadingIntroduction: React.FC<LoadingIntroductionProps> = ({ 
  className,
  onComplete,
  minDisplayTime = 4000
}) => {
  const [shouldFadeOut, setShouldFadeOut] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShouldFadeOut(true);
      // Call onComplete after fade out animation
      setTimeout(() => {
        onComplete?.();
      }, 1500);
    }, minDisplayTime);

    return () => clearTimeout(timer);
  }, [minDisplayTime, onComplete]);

  return (
    <AnimatePresence>
      {!shouldFadeOut && (
        <motion.div 
          className={cn(
            "fixed inset-0 z-50 min-h-screen bg-background flex items-center justify-center overflow-hidden",
            className
          )}
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.5, ease: "easeInOut" }}
        >
          {/* Background gradient animation */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/5" />
          
          {/* Floating particles */}
          <div className="absolute inset-0 pointer-events-none">
            {[...Array(15)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 bg-primary/30 rounded-full"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                }}
                animate={{
                  opacity: [0.3, 1, 0.3],
                  scale: [1, 1.2, 1],
                }}
                transition={{
                  duration: 2 + Math.random() * 4,
                  repeat: Infinity,
                  delay: Math.random() * 3,
                }}
              />
            ))}
          </div>

          {/* Main content */}
          <div className="relative z-10 text-center max-w-4xl mx-auto px-4">
            {/* Brand name animation */}
            <div className="mb-8">
              <h1 className="text-6xl md:text-8xl font-bold leading-none">
                {/* "Locale" with staggered character animation */}
                <span className="inline-block">
                  {"Locale".split('').map((char, index) => (
                    <motion.span
                      key={`locale-${index}`}
                      className="inline-block text-primary"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{
                        duration: 0.6,
                        delay: index * 0.1,
                        ease: "easeOut"
                      }}
                    >
                      {char}
                    </motion.span>
                  ))}
                </span>
                
                {/* "Lore" with different timing */}
                <span className="inline-block ml-2">
                  {"Lore".split('').map((char, index) => (
                    <motion.span
                      key={`lore-${index}`}
                      className="inline-block text-secondary"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{
                        duration: 0.6,
                        delay: 0.6 + index * 0.1,
                        ease: "easeOut"
                      }}
                    >
                      {char}
                    </motion.span>
                  ))}
                </span>
              </h1>
            </div>

            {/* Tagline with smooth reveal */}
            <div className="relative">
              <motion.p 
                className="text-xl md:text-2xl text-muted-foreground font-light tracking-wide"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.8,
                  delay: 1.2,
                  ease: "easeOut"
                }}
              >
                learn what&apos;s around
              </motion.p>
              
              {/* Underline animation */}
              <motion.div 
                className="h-0.5 bg-primary mx-auto mt-4"
                initial={{ width: "0%" }}
                animate={{ width: "50%" }}
                transition={{
                  duration: 1,
                  delay: 2,
                  ease: "easeInOut"
                }}
              />
            </div>

            {/* Pulsing loading indicator */}
            <motion.div 
              className="mt-12 flex justify-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{
                duration: 0.5,
                delay: 2.5,
              }}
            >
              <div className="flex space-x-2">
                {[...Array(3)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="w-3 h-3 bg-primary rounded-full"
                    animate={{
                      opacity: [0.3, 1, 0.3],
                      scale: [0.8, 1.2, 0.8],
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      delay: 2.8 + i * 0.2,
                    }}
                  />
                ))}
              </div>
            </motion.div>

            {/* Subtitle hint */}
            <motion.p 
              className="mt-8 text-sm text-muted-foreground/60"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{
                duration: 0.8,
                delay: 3.2,
                ease: "easeOut"
              }}
            >
              Discovering hidden stories and urban legends
            </motion.p>
          </div>

          {/* Bottom glow effect */}
          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-96 h-32 bg-gradient-radial from-primary/20 to-transparent rounded-full blur-3xl" />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default LoadingIntroduction;