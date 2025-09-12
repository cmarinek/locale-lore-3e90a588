/**
 * Simple initialization gate that just renders children
 */

import React from 'react';

interface InitializationGateProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const InitializationGate: React.FC<InitializationGateProps> = ({
  children,
  fallback
}) => {
  // Simply render children - no complex initialization needed
  return <>{children}</>;
};

export default InitializationGate;