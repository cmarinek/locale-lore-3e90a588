/**
 * Application initialization manager to prevent TDZ errors
 * Ensures proper loading order of React APIs and browser features
 */

import React from 'react';
import { BrowserSafetyWrapper } from './browser-safety';

interface InitializationState {
  react: boolean;
  browser: boolean;
  location: boolean;
  ready: boolean;
}

class AppInitializationManager {
  private state: InitializationState = {
    react: false,
    browser: false,
    location: false,
    ready: false
  };

  private callbacks: Array<() => void> = [];
  private readyPromise: Promise<void>;
  private readyResolve!: () => void;

  constructor() {
    this.readyPromise = new Promise((resolve) => {
      this.readyResolve = resolve;
    });
    
    this.initialize();
  }

  private async initialize() {
    try {
      // Phase 1: Check React availability
      await this.checkReactReady();
      
      // Phase 2: Check browser APIs
      await this.checkBrowserReady();
      
      // Phase 3: Initialize location services (delayed)
      setTimeout(() => this.initializeLocationServices(), 100);
      
    } catch (error) {
      console.error('App initialization failed:', error);
      // Continue with partial initialization
      this.markReady();
    }
  }

  private async checkReactReady(): Promise<void> {
    return new Promise((resolve) => {
      const checkReact = () => {
        if (
          typeof React !== 'undefined' && 
          React.forwardRef && 
          React.createElement &&
          React.Component
        ) {
          console.log('✅ React APIs available');
          this.state.react = true;
          resolve();
        } else {
          console.log('⏳ Waiting for React APIs...');
          setTimeout(checkReact, 10);
        }
      };
      checkReact();
    });
  }

  private async checkBrowserReady(): Promise<void> {
    return new Promise((resolve) => {
      const checkBrowser = () => {
        if (typeof window !== 'undefined' && typeof document !== 'undefined') {
          console.log('✅ Browser APIs available');
          this.state.browser = true;
          resolve();
        } else {
          setTimeout(checkBrowser, 10);
        }
      };
      checkBrowser();
    });
  }

  private async initializeLocationServices(): Promise<void> {
    try {
      // Only initialize if geolocation is available
      if (BrowserSafetyWrapper.isGeolocationAvailable()) {
        console.log('✅ Location services available');
        this.state.location = true;
      } else {
        console.log('⚠️ Location services not available, using fallback');
        this.state.location = false; // Still mark as "ready" but with fallback
      }
    } catch (error) {
      console.warn('Location initialization failed:', error);
      this.state.location = false;
    } finally {
      this.markReady();
    }
  }

  private markReady() {
    this.state.ready = true;
    console.log('🚀 App initialization complete:', this.state);
    this.readyResolve();
    this.callbacks.forEach(callback => {
      try {
        callback();
      } catch (error) {
        console.error('Initialization callback failed:', error);
      }
    });
    this.callbacks.length = 0;
  }

  // Public API
  public isReady(): boolean {
    return this.state.ready;
  }

  public isReactReady(): boolean {
    return this.state.react;
  }

  public isBrowserReady(): boolean {
    return this.state.browser;
  }

  public isLocationReady(): boolean {
    return this.state.location;
  }

  public onReady(callback: () => void): void {
    if (this.state.ready) {
      callback();
    } else {
      this.callbacks.push(callback);
    }
  }

  public waitForReady(): Promise<void> {
    return this.readyPromise;
  }

  public getState(): InitializationState {
    return { ...this.state };
  }
}

// Global instance
export const appInitManager = new AppInitializationManager();

// React hook for components
export function useAppInitialization() {
  const [isReady, setIsReady] = React.useState(appInitManager.isReady());
  
  React.useEffect(() => {
    if (!isReady) {
      appInitManager.onReady(() => setIsReady(true));
    }
  }, [isReady]);

  return {
    isReady,
    isReactReady: appInitManager.isReactReady(),
    isBrowserReady: appInitManager.isBrowserReady(),
    isLocationReady: appInitManager.isLocationReady(),
    state: appInitManager.getState()
  };
}

// Safe location service access
export async function safeGetLocation() {
  await appInitManager.waitForReady();
  
  if (!appInitManager.isLocationReady()) {
    console.warn('Location services not available, using fallback');
    return {
      coordinates: [-0.1276, 51.5074] as [number, number], // London fallback
      accuracy: 'fallback' as const,
      source: 'fallback' as const
    };
  }

  try {
    const { locationService } = await import('./location');
    return await locationService.getDeviceLocation();
  } catch (error) {
    console.error('Location access failed:', error);
    throw error;
  }
}