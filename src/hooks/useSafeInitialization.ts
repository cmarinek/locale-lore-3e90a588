/**
 * Safe initialization hook that doesn't depend on React being available at module load
 */

import { initManager } from '@/utils/initialization-manager';

interface SafeInitializationState {
  isReady: boolean;
  phase: string;
  completed: string[];
  failed: string[];
  safeGetLocation: () => Promise<{ latitude: number; longitude: number } | null>;
}

// Safe hook that handles React not being available
export function useSafeInitialization(): SafeInitializationState {
  // Check if React hooks are available
  if (typeof window === 'undefined' || !window.React) {
    console.warn('🔧 SAFE_INIT: React not available, using fallback state');
    return {
      isReady: false,
      phase: 'waiting-for-react',
      completed: [],
      failed: ['react-unavailable'],
      safeGetLocation: initManager.safeGetLocation.bind(initManager)
    };
  }

  try {
    // Dynamically import React hooks to avoid module-level dependency
    const React = window.React;
    const [state, setState] = React.useState(initManager.getState());

    React.useEffect(() => {
      const updateState = () => setState(initManager.getState());
      
      if (!initManager.isReady()) {
        initManager.onReady(updateState);
        // Start initialization if not already started
        initManager.initialize().catch(console.error);
      }

      return () => {
        // No cleanup needed for now
      };
    }, []);

    return {
      isReady: state.isReady,
      phase: state.phase,
      completed: state.completed,
      failed: state.failed,
      safeGetLocation: initManager.safeGetLocation.bind(initManager)
    };
  } catch (error) {
    console.error('🔧 SAFE_INIT: Hook error, using fallback:', error);
    return {
      isReady: false,
      phase: 'hook-error',
      completed: [],
      failed: ['hook-error'],
      safeGetLocation: initManager.safeGetLocation.bind(initManager)
    };
  }
}