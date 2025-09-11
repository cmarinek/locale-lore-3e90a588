// Reusable base card component using our design system
import React from 'react';
import { cn } from '@/lib/utils';
import { cardVariants, type CardVariants } from '@/styles/components';
import { BaseComponentProps } from '@/types/shared';

interface BaseCardProps extends BaseComponentProps, CardVariants {
  onClick?: () => void;
  disabled?: boolean;
}

export const BaseCard: React.FC<BaseCardProps> = ({
  children,
  className,
  variant,
  padding,
  radius,
  onClick,
  disabled,
  ...props
}) => {
  const isInteractive = onClick && !disabled;
  
  return (
    <div
      className={cn(
        cardVariants({ 
          variant: isInteractive ? 'interactive' : variant, 
          padding, 
          radius 
        }),
        disabled && 'opacity-50 cursor-not-allowed',
        className
      )}
      onClick={disabled ? undefined : onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick && !disabled ? 0 : undefined}
      onKeyDown={onClick && !disabled ? (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      } : undefined}
      {...props}
    >
      {children}
    </div>
  );
};