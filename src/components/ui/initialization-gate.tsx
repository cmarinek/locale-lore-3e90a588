/**
 * Initialization Gate - Blocks component rendering until all APIs are ready
 */

import React from 'react';
import { useInitialization } from '@/utils/initialization-manager';

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
  const { isReady, phase, completed, failed } = useInitialization();

  if (!isReady) {
    if (fallback) {
      return <>{fallback}</>;
    }

    return (
      <div className="fixed inset-0 bg-background flex items-center justify-center z-50">
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
    );
  }

  return <>{children}</>;
};

export default InitializationGate;