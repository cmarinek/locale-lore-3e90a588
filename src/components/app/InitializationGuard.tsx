import React, { useState, useEffect } from 'react';
import i18n from '@/utils/i18n';

interface InitializationGuardProps {
  children: React.ReactNode;
}

/**
 * Safety guard that ensures critical services are initialized
 * before rendering the application
 */
export const InitializationGuard: React.FC<InitializationGuardProps> = ({ children }) => {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Double-check that i18n is initialized
    const checkInitialization = () => {
      if (i18n.isInitialized) {
        console.log('[InitializationGuard] Services ready');
        setReady(true);
      } else {
        console.warn('[InitializationGuard] i18n not initialized, retrying...');
        setTimeout(checkInitialization, 100);
      }
    };

    checkInitialization();
  }, []);

  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <div className="animate-spin h-12 w-12 border-4 border-primary border-t-transparent rounded-full mx-auto" />
          <p className="text-muted-foreground">Initializing LocaleLore...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
