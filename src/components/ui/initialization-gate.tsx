/**
 * Initialization Gate - Blocks component rendering until all APIs are ready
 */

import React from 'react';
import { useSafeInitialization } from '@/hooks/useSafeInitialization';

interface InitializationGateProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  showProgress?: boolean;
}

export const InitializationGate: React.FC<InitializationGateProps> = ({
  children,
  fallback,
  showProgress = false
}) => {
  const { isReady, phase, completed, failed } = useSafeInitialization();

  // Render children immediately; show a non-blocking overlay while initializing
  return (
    <>
      {children}
      {!isReady && (
        fallback ? (
          <>{fallback}</>
        ) : (
          <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50" aria-hidden="true">
            <div className="text-center space-y-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
              <div className="text-lg font-medium">Initializing Application...</div>
              {showProgress && (
                <div className="text-sm text-muted-foreground space-y-2">
                  <div>Phase: {phase}</div>
                  <div>✅ Completed: {completed.join(', ')}</div>
                  {failed.length > 0 && (
                    <div className="text-destructive">⚠️ Failed: {failed.join(', ')}</div>
                  )}
                </div>
              )}
            </div>
          </div>
        )
      )}
    </>
  );
};

export default InitializationGate;