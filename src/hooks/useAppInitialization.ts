import { useState, useEffect } from 'react';
import { appInitializer } from '@/utils/app-initialization';

interface InitializationState {
  isReady: boolean;
  isLoading: boolean;
  issues: string[];
  duration: number;
}

export const useAppInitialization = () => {
  const [state, setState] = useState<InitializationState>({
    isReady: false,
    isLoading: true,
    issues: [],
    duration: 0
  });

  useEffect(() => {
    let mounted = true;

    // Check if already initialized
    if (appInitializer.isReady()) {
      setState({
        isReady: true,
        isLoading: false,
        issues: [],
        duration: 0
      });
      return;
    }

    // Initialize and update state
    appInitializer.initialize().then((result) => {
      if (!mounted) return;
      
      setState({
        isReady: result.success,
        isLoading: false,
        issues: result.issues,
        duration: result.duration
      });
    });

    // Set up ready callback for future ready state
    appInitializer.onReady(() => {
      if (!mounted) return;
      
      setState(prev => ({
        ...prev,
        isReady: true,
        isLoading: false
      }));
    });

    return () => {
      mounted = false;
    };
  }, []);

  return {
    ...state,
    safeGetLocation: appInitializer.safeGetLocation.bind(appInitializer)
  };
};