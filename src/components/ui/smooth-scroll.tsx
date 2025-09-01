
import React, { useRef, useEffect } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import { useAnimations } from '@/hooks/useAnimations';

interface SmoothScrollProps {
  children: React.ReactNode;
  className?: string;
}

export const SmoothScroll: React.FC<SmoothScrollProps> = ({
  children,
  className = ""
}) => {
  const { shouldReduceMotion } = useAnimations();
  const ref = useRef<HTMLDivElement>(null);

  if (shouldReduceMotion) {
    return <div className={className} ref={ref}>{children}</div>;
  }

  return (
    <motion.div
      ref={ref}
      className={className}
      style={{ 
        overflow: 'auto',
        scrollBehavior: 'smooth'
      }}
    >
      {children}
    </motion.div>
  );
};

interface ParallaxProps {
  children: React.ReactNode;
  offset?: number;
  className?: string;
}

export const Parallax: React.FC<ParallaxProps> = ({
  children,
  offset = 50,
  className = ""
}) => {
  const { shouldReduceMotion } = useAnimations();
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  });

  const y = useTransform(scrollYProgress, [0, 1], [offset, -offset]);
  const ySmooth = useSpring(y, { stiffness: 100, damping: 30 });

  if (shouldReduceMotion) {
    return <div className={className} ref={ref}>{children}</div>;
  }

  return (
    <motion.div
      ref={ref}
      className={className}
      style={{ y: ySmooth }}
    >
      {children}
    </motion.div>
  );
};

interface ScrollProgressProps {
  className?: string;
}

export const ScrollProgress: React.FC<ScrollProgressProps> = ({
  className = ""
}) => {
  const { shouldReduceMotion } = useAnimations();
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30 });

  if (shouldReduceMotion) {
    return null;
  }

  return (
    <motion.div
      className={`fixed top-0 left-0 right-0 h-1 bg-primary z-50 origin-left ${className}`}
      style={{ scaleX }}
    />
  );
};
