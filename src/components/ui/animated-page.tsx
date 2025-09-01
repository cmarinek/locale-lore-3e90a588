
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

  const getVariants = (): Variants => {
    switch (type) {
      case 'slide':
        return slideVariants;
      case 'fade':
        return {
          initial: { opacity: 0 },
          animate: { opacity: 1 },
          exit: { opacity: 0 }
        };
      default:
        return pageVariants;
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
