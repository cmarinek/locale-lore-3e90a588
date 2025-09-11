/**
 * Safe React component wrapper to prevent forwardRef TDZ errors
 */

import React from 'react';
import { appInitManager } from '@/utils/app-initialization';

interface SafeReactWrapperProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

// Safe forwardRef implementation with proper TypeScript typing
export function safeForwardRef<T, P = {}>(
  render: (props: P, ref: React.Ref<T>) => React.ReactNode,
  displayName?: string
): React.ForwardRefExoticComponent<React.PropsWithoutRef<P> & React.RefAttributes<T>> {
  // Check if React.forwardRef is available
  if (typeof React.forwardRef === 'function') {
    const component = React.forwardRef<T, P>((props, ref) => render(props as P, ref));
    if (displayName) {
      component.displayName = displayName;
    }
    return component as React.ForwardRefExoticComponent<React.PropsWithoutRef<P> & React.RefAttributes<T>>;
  }

  // Fallback: return a regular component without ref forwarding
  console.warn('React.forwardRef not available, using fallback');
  const component = ((props: React.PropsWithoutRef<P> & React.RefAttributes<T>) => 
    render(props as P, null)) as React.ForwardRefExoticComponent<React.PropsWithoutRef<P> & React.RefAttributes<T>>;
  
  if (displayName) {
    component.displayName = displayName;
  }
  return component;
}

// Safe React wrapper component
export const SafeReactWrapper: React.FC<SafeReactWrapperProps> = ({
  children,
  fallback = <div>Loading...</div>
}) => {
  const [isReady, setIsReady] = React.useState(appInitManager.isReactReady());

  React.useEffect(() => {
    if (!isReady) {
      appInitManager.onReady(() => setIsReady(true));
    }
  }, [isReady]);

  if (!isReady) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};

// Higher-order component for safe React API usage
export function withSafeReact<P extends object>(
  Component: React.ComponentType<P>,
  fallback?: React.ReactNode
) {
  const WrappedComponent = (props: P) => (
    <SafeReactWrapper fallback={fallback}>
      <Component {...props} />
    </SafeReactWrapper>
  );

  WrappedComponent.displayName = `withSafeReact(${Component.displayName || Component.name})`;
  
  return WrappedComponent;
}