import React from 'react';
import { Button } from './button';
import { cn } from '@/lib/utils';

// Enhanced button with proper touch targets (minimum 44px)
interface TouchButtonProps extends React.ComponentProps<typeof Button> {
  touchSize?: 'sm' | 'md' | 'lg';
}

export const TouchButton: React.FC<TouchButtonProps> = ({
  className,
  touchSize = 'md',
  children,
  ...props
}) => {
  const touchSizeClasses = {
    sm: "min-h-[44px] min-w-[44px] text-sm",
    md: "min-h-[48px] min-w-[48px]", 
    lg: "min-h-[56px] min-w-[56px] text-lg"
  };

  return (
    <Button
      className={cn(touchSizeClasses[touchSize], className)}
      {...props}
    >
      {children}
    </Button>
  );
};

// Enhanced icon button for touch interfaces
interface TouchIconButtonProps extends React.ComponentProps<typeof Button> {
  icon: React.ReactNode;
  label: string; // For accessibility
  touchSize?: 'sm' | 'md' | 'lg';
}

export const TouchIconButton: React.FC<TouchIconButtonProps> = ({
  icon,
  label,
  className,
  touchSize = 'md',
  ...props
}) => {
  const touchSizeClasses = {
    sm: "min-h-[44px] min-w-[44px] p-2",
    md: "min-h-[48px] min-w-[48px] p-3", 
    lg: "min-h-[56px] min-w-[56px] p-4"
  };

  return (
    <Button
      className={cn(touchSizeClasses[touchSize], "flex items-center justify-center", className)}
      aria-label={label}
      {...props}
    >
      {icon}
      <span className="sr-only">{label}</span>
    </Button>
  );
};

// Enhanced floating action button
interface FloatingActionButtonProps {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  className?: string;
  position?: 'bottom-right' | 'bottom-left' | 'bottom-center';
}

export const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({
  icon,
  label,
  onClick,
  className,
  position = 'bottom-right'
}) => {
  const positionClasses = {
    'bottom-right': 'fixed bottom-6 right-6 z-50',
    'bottom-left': 'fixed bottom-6 left-6 z-50',
    'bottom-center': 'fixed bottom-6 left-1/2 -translate-x-1/2 z-50'
  };

  return (
    <TouchButton
      onClick={onClick}
      className={cn(
        positionClasses[position],
        "rounded-full shadow-lg hover:shadow-xl transition-shadow",
        "min-h-[56px] min-w-[56px] p-4",
        className
      )}
      aria-label={label}
    >
      {icon}
      <span className="sr-only">{label}</span>
    </TouchButton>
  );
};

// Enhanced tab button for bottom navigation
interface TouchTabButtonProps {
  icon: React.ReactNode;
  label: string;
  isActive?: boolean;
  onClick: () => void;
  className?: string;
}

export const TouchTabButton: React.FC<TouchTabButtonProps> = ({
  icon,
  label,
  isActive,
  onClick,
  className
}) => {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex flex-col items-center justify-center gap-1",
        "min-h-[56px] px-2 py-2",
        "transition-colors duration-200",
        isActive 
          ? "text-primary" 
          : "text-muted-foreground hover:text-foreground",
        className
      )}
      aria-label={label}
      aria-pressed={isActive}
    >
      <div className="flex items-center justify-center w-6 h-6">
        {icon}
      </div>
      <span className="text-xs font-medium truncate max-w-full">
        {label}
      </span>
    </button>
  );
};

// Enhanced card with proper touch targets
interface TouchCardProps extends React.HTMLAttributes<HTMLDivElement> {
  onPress?: () => void;
  pressable?: boolean;
}

export const TouchCard: React.FC<TouchCardProps> = ({
  children,
  onPress,
  pressable = true,
  className,
  ...props
}) => {
  if (onPress) {
    return (
      <button
        onClick={onPress}
        className={cn(
          "block w-full text-left",
          pressable && [
            "min-h-[44px] cursor-pointer",
            "transition-transform duration-150",
            "hover:scale-[1.02] active:scale-[0.98]",
            "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
          ],
          className
        )}
      >
        {children}
      </button>
    );
  }
  
  return (
    <div
      className={cn("block w-full", className)}
      {...props}
    >
      {children}
    </div>
  );
};