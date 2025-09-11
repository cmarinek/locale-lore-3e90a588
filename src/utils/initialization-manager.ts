/**
 * Unified initialization manager for coordinated app startup
 * Replaces multiple initialization systems with a single, robust one
 */

import { GlobalAPIChecker } from './global-polyfills';
import * as React from 'react';
import { locationService } from './location';

interface InitializationPhase {
  name: string;
  check: () => boolean;
  timeout: number;
  critical: boolean;
}

interface InitializationState {
  phase: string;
  completed: string[];
  failed: string[];
  isReady: boolean;
  startTime: number;
}

class InitializationManager {
  private state: InitializationState = {
    phase: 'starting',
    completed: [],
    failed: [],
    isReady: false,
    startTime: Date.now()
  };

  private callbacks: (() => void)[] = [];
  private phases: InitializationPhase[] = [
    {
      name: 'dom',
      check: () => GlobalAPIChecker.isDOMReady(),
      timeout: 5000,
      critical: true
    },
    // React readiness check removed to avoid dependency on window.React
    {
      name: 'navigator',
      check: () => GlobalAPIChecker.isNavigatorReady(),
      timeout: 2000,
      critical: false // Non-critical, can continue without it
    }
  ];

  private isInitializing = false;

  async initialize(): Promise<void> {
    if (this.isInitializing) {
      return this.waitForReady();
    }

    this.isInitializing = true;
    console.log('🚀 INIT_MANAGER: Starting unified initialization...');

    let criticalFailure = false;

    for (const phase of this.phases) {
      this.state.phase = phase.name;
      console.log(`⏳ INIT_MANAGER: Phase ${phase.name} starting...`);

      try {
        const success = await this.waitForPhase(phase);
        if (success) {
          this.state.completed.push(phase.name);
          console.log(`✅ INIT_MANAGER: Phase ${phase.name} completed`);
        } else {
          this.state.failed.push(phase.name);
          console.warn(`⚠️ INIT_MANAGER: Phase ${phase.name} failed`);
          
          if (phase.critical) {
            criticalFailure = true;
            console.error(`💥 INIT_MANAGER: Critical phase ${phase.name} failed - marking as not ready`);
          }
        }
      } catch (error) {
        this.state.failed.push(phase.name);
        console.error(`❌ INIT_MANAGER: Phase ${phase.name} error:`, error);
        
        if (phase.critical) {
          criticalFailure = true;
        }
      }
    }

    // Only mark as ready if no critical phases failed
    this.state.isReady = !criticalFailure;
    this.state.phase = this.state.isReady ? 'ready' : 'failed';
    
    const duration = Date.now() - this.state.startTime;
    console.log(`✅ INIT_MANAGER: Initialization complete in ${duration}ms`, {
      completed: this.state.completed,
      failed: this.state.failed
    });

    // Trigger all callbacks
    this.callbacks.forEach(callback => {
      try {
        callback();
      } catch (error) {
        console.error('❌ INIT_MANAGER: Callback error:', error);
      }
    });
  }

  private async waitForPhase(phase: InitializationPhase): Promise<boolean> {
    const startTime = Date.now();
    
    return new Promise((resolve) => {
      const checkPhase = () => {
        const elapsed = Date.now() - startTime;
        
        if (phase.check()) {
          resolve(true);
          return;
        }
        
        if (elapsed >= phase.timeout) {
          console.warn(`⏰ INIT_MANAGER: Phase ${phase.name} timed out after ${elapsed}ms`);
          resolve(false);
          return;
        }
        
        setTimeout(checkPhase, 25);
      };
      
      checkPhase();
    });
  }

  isReady(): boolean {
    return this.state.isReady;
  }

  getState(): InitializationState {
    return { ...this.state };
  }

  onReady(callback: () => void): void {
    if (this.state.isReady) {
      callback();
    } else {
      this.callbacks.push(callback);
    }
  }

  async waitForReady(): Promise<void> {
    if (this.state.isReady) {
      return;
    }

    return new Promise((resolve) => {
      this.onReady(resolve);
    });
  }

  // Safe API access methods
  async safeGetLocation(): Promise<{ latitude: number; longitude: number } | null> {
    await this.waitForReady();

    try {
      const result = await locationService.getDeviceLocation();
      const [lng, lat] = result.coordinates;
      return { latitude: lat, longitude: lng };
    } catch (error) {
      console.warn('🌍 INIT_MANAGER: safeGetLocation failed, using fallback', error);
      return { latitude: 40.7128, longitude: -74.0060 }; // NYC fallback
    }
  }
}

// Global singleton instance
export const initManager = new InitializationManager();

// React hook for components
export function useInitialization() {
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
}
