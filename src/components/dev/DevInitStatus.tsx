import React, { useState } from 'react';
import { useInitialization } from '@/utils/initialization-manager';

export const DevInitStatus: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const initData = useInitialization();
  const isReady = initData.isReady;

  // Only show in development
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  const toggleExpanded = () => setIsExpanded(!isExpanded);

  return (
    <div
      style={{
        position: 'fixed',
        top: '10px',
        right: '10px',
        zIndex: 9999,
        fontSize: '12px',
        fontFamily: 'monospace',
        backgroundColor: isReady ? '#10b981' : '#f59e0b',
        color: 'white',
        padding: '8px 12px',
        borderRadius: '6px',
        cursor: 'pointer',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        maxWidth: isExpanded ? '300px' : '120px',
        overflow: 'hidden',
        transition: 'all 0.3s ease'
      }}
      onClick={toggleExpanded}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        <div style={{ 
          width: '8px', 
          height: '8px', 
          borderRadius: '50%', 
          backgroundColor: isReady ? '#ffffff' : '#ef4444' 
        }}></div>
        <span>{isReady ? 'Ready' : 'Initializing...'}</span>
        <span style={{ fontSize: '10px' }}>
          {isExpanded ? '▼' : '▶'}
        </span>
      </div>
      
      {isExpanded && (
        <div style={{ marginTop: '8px', fontSize: '10px' }}>
          <div><strong>Completed:</strong> {initData.completed.join(', ')}</div>
          <div><strong>Failed:</strong> {initData.failed.join(', ')}</div>
          <div><strong>Current Phase:</strong> {initData.phase}</div>
        </div>
      )}
    </div>
  );
};