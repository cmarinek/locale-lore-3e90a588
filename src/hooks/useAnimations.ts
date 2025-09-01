
import { useReducedMotion } from 'framer-motion';
import { useAppStore } from '@/stores/appStore';

export const useAnimations = () => {
  const prefersReducedMotion = useReducedMotion();
  const { mobile } = useAppStore();

  const shouldReduceMotion = prefersReducedMotion || mobile.reduceAnimations;

  // Base animation variants
  const pageVariants = {
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
        ease: [0.4, 0.0, 0.2, 1]
      }
    },
    exit: shouldReduceMotion ? {} : { 
      opacity: 0, 
      y: -20,
      scale: 0.98,
      transition: {
        duration: 0.3,
        ease: [0.4, 0.0, 1, 1]
      }
    }
  };

  const slideVariants = {
    initial: (direction: 'left' | 'right') => shouldReduceMotion ? {} : ({
      x: direction === 'left' ? -300 : 300,
      opacity: 0
    }),
    animate: {
      x: 0,
      opacity: 1,
      transition: {
        type: shouldReduceMotion ? 'tween' : 'spring',
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

  const cardVariants = {
    hidden: shouldReduceMotion ? {} : { 
      opacity: 0, 
      y: 20,
      scale: 0.95
    },
    visible: (index: number) => ({
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        delay: shouldReduceMotion ? 0 : index * 0.1,
        duration: shouldReduceMotion ? 0 : 0.5,
        ease: [0.4, 0.0, 0.2, 1]
      }
    }),
    hover: shouldReduceMotion ? {} : {
      y: -5,
      scale: 1.02,
      transition: { duration: 0.2 }
    },
    tap: shouldReduceMotion ? {} : {
      scale: 0.98
    }
  };

  const shimmerVariants = {
    shimmer: shouldReduceMotion ? {} : {
      x: ["-100%", "100%"],
      transition: {
        repeat: Infinity,
        duration: 1.5,
        ease: "linear"
      }
    }
  };

  return {
    shouldReduceMotion,
    pageVariants,
    slideVariants,
    cardVariants,
    shimmerVariants
  };
};
