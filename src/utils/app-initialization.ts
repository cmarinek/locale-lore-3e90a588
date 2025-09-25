/**
 * Simplified App Initialization System
 * Replaces the complex multi-layer initialization with a single, coordinated flow
 */

import { SecurityUtils } from './security';
import { seoManager, optimizeCriticalResources } from './seo';

interface InitializationResult {
  success: boolean;
  issues: string[];
  duration: number;
}

class AppInitializer {
  private isInitialized = false;
  private isInitializing = false;
  private callbacks: (() => void)[] = [];

  async initialize(): Promise<InitializationResult> {
    if (this.isInitialized) {
      return { success: true, issues: [], duration: 0 };
    }

    if (this.isInitializing) {
      return this.waitForInitialization();
    }

    this.isInitializing = true;
    const startTime = Date.now();
    const issues: string[] = [];

    try {
      // Phase 1: Critical DOM checks
      if (!this.isDOMReady()) {
        await this.waitForDOM();
      }

      // Phase 2: Environment validation (without aggressive failures)
      const envValid = SecurityUtils.validateEnvironment();
      if (!envValid) {
        issues.push('Environment validation failed - continuing with degraded functionality');
      }

      // Phase 3: SEO and performance optimization
      try {
        seoManager.preloadCriticalResources();
        optimizeCriticalResources();
        seoManager.updateMeta({
          title: 'GeoCache Lore - Discover Hidden Stories Around the World',
          description: 'Explore fascinating facts and hidden stories about locations worldwide.',
        });
      } catch (error) {
        issues.push('SEO initialization had issues - non-critical');
      }

      // Phase 4: Mark as ready
      this.isInitialized = true;
      this.isInitializing = false;

      // Trigger callbacks
      this.callbacks.forEach(callback => {
        try {
          callback();
        } catch (error) {
          console.warn('Initialization callback error:', error);
        }
      });

      const duration = Date.now() - startTime;
      console.log(`✅ App initialized successfully in ${duration}ms`, { issues });

      return { success: true, issues, duration };
    } catch (error) {
      this.isInitializing = false;
      console.error('❌ App initialization failed:', error);
      
      return { 
        success: false, 
        issues: [...issues, `Critical error: ${error}`], 
        duration: Date.now() - startTime 
      };
    }
  }

  private isDOMReady(): boolean {
    return document.readyState === 'complete' && 
           document.getElementById('root') !== null;
  }

  private async waitForDOM(): Promise<void> {
    return new Promise((resolve) => {
      if (this.isDOMReady()) {
        resolve();
        return;
      }

      const checkInterval = setInterval(() => {
        if (this.isDOMReady()) {
          clearInterval(checkInterval);
          resolve();
        }
      }, 50);

      // Timeout after 10 seconds
      setTimeout(() => {
        clearInterval(checkInterval);
        resolve();
      }, 10000);
    });
  }

  private async waitForInitialization(): Promise<InitializationResult> {
    return new Promise((resolve) => {
      const checkInterval = setInterval(() => {
        if (!this.isInitializing) {
          clearInterval(checkInterval);
          resolve(this.isInitialized 
            ? { success: true, issues: [], duration: 0 }
            : { success: false, issues: ['Initialization failed'], duration: 0 }
          );
        }
      }, 100);
    });
  }

  isReady(): boolean {
    return this.isInitialized;
  }

  onReady(callback: () => void): void {
    if (this.isInitialized) {
      callback();
    } else {
      this.callbacks.push(callback);
    }
  }

  // Safe API access with fallbacks
  async safeGetLocation(): Promise<{ latitude: number; longitude: number } | null> {
    try {
      if (!navigator.geolocation) {
        return { latitude: 40.7128, longitude: -74.0060 }; // NYC fallback
      }

      return new Promise((resolve) => {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            resolve({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude
            });
          },
          () => {
            resolve({ latitude: 40.7128, longitude: -74.0060 }); // Fallback on error
          },
          { timeout: 5000 }
        );
      });
    } catch (error) {
      console.warn('Location access failed, using fallback', error);
      return { latitude: 40.7128, longitude: -74.0060 };
    }
  }
}

// Global singleton instance
export const appInitializer = new AppInitializer();