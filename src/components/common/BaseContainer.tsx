// Reusable container component using our design system
import React from 'react';
import { cn } from '@/lib/utils';
import { containerVariants, type ContainerVariants } from '@/styles/components';
import { BaseComponentProps } from '@/types/shared';

interface BaseContainerProps extends BaseComponentProps, ContainerVariants {
  as?: 'div' | 'section' | 'main' | 'article' | 'aside';
}

export const BaseContainer: React.FC<BaseContainerProps> = ({
  children,
  className,
  size,
  padding,
  as: Component = 'div',
  ...props
}) => {
  return (
    <Component
      className={cn(
        containerVariants({ size, padding }),
        className
      )}
      {...props}
    >
      {children}
    </Component>
  );
};