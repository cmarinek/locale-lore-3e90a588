
import React from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { useAnimations } from '@/hooks/useAnimations';

interface AnimatedPageProps {
  children: React.ReactNode;
  className?: string;
  direction?: 'left' | 'right';
  type?: 'page' | 'slide' | 'fade';
}

export const AnimatedPage: React.FC<AnimatedPageProps> = ({
  children,
  className = "",
  direction = 'right',
  type = 'page'
}) => {
  const { pageVariants, slideVariants, shouldReduceMotion } = useAnimations();

  const slideVariantsFixed: Variants = {
    initial: (direction: 'left' | 'right') => shouldReduceMotion ? {} : ({
      x: direction === 'left' ? -300 : 300,
      opacity: 0
    }),
    animate: {
      x: 0,
      opacity: 1,
      transition: {
        type: "spring" as const,
        stiffness: 300,
        damping: 30
      }
    },
    exit: (direction: 'left' | 'right') => shouldReduceMotion ? {} : ({
      x: direction === 'left' ? 300 : -300,
      opacity: 0,
      transition: { duration: 0.3 }
    })
  };

  const pageVariantsFixed: Variants = {
    initial: shouldReduceMotion ? {} : { 
      opacity: 0, 
      y: 20,
      scale: 0.98
    },
    animate: { 
      opacity: 1, 
      y: 0,
      scale: 1,
      transition: {
        duration: shouldReduceMotion ? 0 : 0.4,
        ease: [0.4, 0.0, 0.2, 1] as const
      }
    },
    exit: shouldReduceMotion ? {} : { 
      opacity: 0, 
      y: -20,
      scale: 0.98,
      transition: {
        duration: 0.3,
        ease: [0.4, 0.0, 1, 1] as const
      }
    }
  };

  const getVariants = (): Variants => {
    switch (type) {
      case 'slide':
        return slideVariantsFixed;
      case 'fade':
        return {
          initial: { opacity: 0 },
          animate: { opacity: 1 },
          exit: { opacity: 0 }
        };
      default:
        return pageVariantsFixed;
    }
  };

  if (shouldReduceMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      custom={direction}
      variants={getVariants()}
      initial="initial"
      animate="animate"
      exit="exit"
      layout
    >
      {children}
    </motion.div>
  );
};

interface PageTransitionProps {
  children: React.ReactNode;
  location: string;
}

export const PageTransition: React.FC<PageTransitionProps> = ({
  children,
  location
}) => {
  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div key={location}>
        {children}
      </motion.div>
    </AnimatePresence>
  );
};
