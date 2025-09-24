import React, { useEffect, useState } from 'react';

interface ReactSafeWrapperProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const ReactSafeWrapper: React.FC<ReactSafeWrapperProps> = ({ 
  children, 
  fallback = null 
}) => {
  const [isReactReady, setIsReactReady] = useState(false);

  useEffect(() => {
    // Ensure React and its APIs are fully loaded
    if (typeof React !== 'undefined' && 
        typeof React.createContext === 'function' &&
        typeof React.useEffect === 'function' &&
        typeof React.useState === 'function') {
      setIsReactReady(true);
    } else {
      console.warn('React APIs not fully loaded, waiting...');
      // Try again after a short delay
      const timer = setTimeout(() => {
        setIsReactReady(true);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, []);

  if (!isReactReady) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};