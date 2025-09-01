
import React from 'react';
import { motion } from 'framer-motion';
import { useAnimations } from '@/hooks/useAnimations';
import { useAppStore } from '@/stores/appStore';

interface InteractiveButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'default' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  haptic?: 'light' | 'medium' | 'heavy';
}

export const InteractiveButton: React.FC<InteractiveButtonProps> = ({
  children,
  variant = 'default',
  size = 'md',
  haptic = 'light',
  className = "",
  onClick,
  disabled,
  ...props
}) => {
  const { triggerHapticFeedback, handleTouchInteraction } = useAppStore();
  const { shouldReduceMotion } = useAnimations();

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!disabled) {
      triggerHapticFeedback(haptic);
      handleTouchInteraction('tap');
      onClick?.(e);
    }
  };

  const baseClasses = "inline-flex items-center justify-center rounded-lg font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50";
  
  const variantClasses = {
    default: "bg-primary text-primary-foreground hover:bg-primary/90",
    ghost: "hover:bg-accent hover:text-accent-foreground",
    outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground"
  };

  const sizeClasses = {
    sm: "h-9 px-3 text-sm",
    md: "h-10 px-4 py-2",
    lg: "h-11 px-8 text-lg"
  };

  const motionProps = shouldReduceMotion ? {} : {
    whileHover: { scale: 1.02 },
    whileTap: { scale: 0.98 },
    transition: { type: "spring", stiffness: 400, damping: 25 }
  };

  return (
    <motion.button
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      onClick={handleClick}
      disabled={disabled}
      {...motionProps}
      {...props}
    >
      {children}
    </motion.button>
  );
};

interface FloatingActionButtonProps {
  onClick: () => void;
  children: React.ReactNode;
  className?: string;
}

export const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({
  onClick,
  children,
  className = ""
}) => {
  const { triggerHapticFeedback } = useAppStore();
  const { shouldReduceMotion } = useAnimations();

  const handleClick = () => {
    triggerHapticFeedback('medium');
    onClick();
  };

  const motionProps = shouldReduceMotion ? {} : {
    whileHover: { scale: 1.1, y: -2 },
    whileTap: { scale: 0.95 },
    initial: { scale: 0 },
    animate: { scale: 1 },
    transition: { type: "spring", stiffness: 400, damping: 25 }
  };

  return (
    <motion.button
      className={`fixed bottom-6 right-6 w-14 h-14 bg-primary text-primary-foreground rounded-full shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 z-50 ${className}`}
      onClick={handleClick}
      {...motionProps}
    >
      {children}
    </motion.button>
  );
};

interface PulseIndicatorProps {
  size?: 'sm' | 'md' | 'lg';
  color?: string;
  className?: string;
}

export const PulseIndicator: React.FC<PulseIndicatorProps> = ({
  size = 'md',
  color = 'bg-primary',
  className = ""
}) => {
  const { shouldReduceMotion } = useAnimations();

  const sizeClasses = {
    sm: 'w-2 h-2',
    md: 'w-3 h-3',
    lg: 'w-4 h-4'
  };

  if (shouldReduceMotion) {
    return <div className={`${sizeClasses[size]} ${color} rounded-full ${className}`} />;
  }

  return (
    <motion.div
      className={`${sizeClasses[size]} ${color} rounded-full ${className}`}
      animate={{
        scale: [1, 1.5, 1],
        opacity: [1, 0.5, 1]
      }}
      transition={{
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut"
      }}
    />
  );
};
