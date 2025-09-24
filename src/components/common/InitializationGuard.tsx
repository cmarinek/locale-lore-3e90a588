import React, { useState, useEffect } from 'react';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';

interface InitializationGuardProps {
  children: React.ReactNode;
  initSteps: Array<{
    name: string;
    check: () => boolean | Promise<boolean>;
  }>;
  fallback?: React.ReactNode;
}

export const InitializationGuard: React.FC<InitializationGuardProps> = ({
  children,
  initSteps,
  fallback
}) => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const runInitialization = async () => {
      try {
        console.log('🔄 Starting initialization...');
        
        for (let i = 0; i < initSteps.length; i++) {
          const step = initSteps[i];
          setCurrentStep(i);
          console.log(`⏳ Initializing: ${step.name}`);
          
          const result = await Promise.resolve(step.check());
          if (!result) {
            throw new Error(`Initialization failed at step: ${step.name}`);
          }
          
          console.log(`✅ Completed: ${step.name}`);
        }
        
        console.log('✅ All initialization steps completed');
        setIsInitialized(true);
      } catch (err) {
        console.error('❌ Initialization failed:', err);
        setError(err instanceof Error ? err : new Error('Unknown initialization error'));
      }
    };

    runInitialization();
  }, [initSteps]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center space-y-4 max-w-md">
          <div className="text-4xl">⚠️</div>
          <h2 className="text-xl font-semibold">Initialization Failed</h2>
          <p className="text-muted-foreground">{error.message}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!isInitialized) {
    return fallback || (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center space-y-4">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto" />
          <p className="text-muted-foreground">
            Initializing... {initSteps[currentStep]?.name}
          </p>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary enableRecovery={true}>
      {children}
    </ErrorBoundary>
  );
};