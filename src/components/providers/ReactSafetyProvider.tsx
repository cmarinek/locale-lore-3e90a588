/**
 * Safety wrapper to ensure React is available before rendering children
 */
import React from 'react';

interface ReactSafetyProviderProps {
  children: React.ReactNode;
}

const ReactLoadingFallback = () => (
  <div style={{ 
    minHeight: '100vh', 
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'center',
    flexDirection: 'column',
    gap: '16px'
  }}>
    <div style={{ 
      width: '32px', 
      height: '32px', 
      border: '4px solid #e5e7eb', 
      borderTop: '4px solid #3b82f6',
      borderRadius: '50%',
      animation: 'spin 1s linear infinite'
    }} />
    <p style={{ color: '#6b7280' }}>Initializing React...</p>
    <style>{`
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `}</style>
  </div>
);

export const ReactSafetyProvider: React.FC<ReactSafetyProviderProps> = ({ children }) => {
  // Check if React and its essential APIs are available
  if (!React || 
      typeof React.useState !== 'function' || 
      typeof React.useEffect !== 'function' ||
      typeof React.createContext !== 'function') {
    console.warn('React APIs not fully available, showing fallback');
    return <ReactLoadingFallback />;
  }

  return <>{children}</>;
};