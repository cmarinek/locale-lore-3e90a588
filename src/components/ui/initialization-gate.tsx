/**
 * Initialization gate with React availability checks
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
  // Check if React is properly loaded
  if (!React || typeof React.useState !== 'function') {
    console.error('React is not properly loaded in InitializationGate');
    return fallback || (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <h3>Loading React...</h3>
        <p>Please wait while the application initializes.</p>
      </div>
    );
  }

  return <>{children}</>;
};

export default InitializationGate;