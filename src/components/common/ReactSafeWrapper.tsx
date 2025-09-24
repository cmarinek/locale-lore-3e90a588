import React from 'react';

interface ReactSafeWrapperProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const ReactSafeWrapper: React.FC<ReactSafeWrapperProps> = ({ 
  children, 
  fallback = null 
}) => {
  // Simplified - just render children directly since React is already loaded
  return <>{children}</>;
};