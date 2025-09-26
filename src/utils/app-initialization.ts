/**
 * Simplified App Initialization System
 * Replaces the complex multi-layer initialization with a single, coordinated flow
 */

import { SecurityUtils } from './security';
import { seoManager, optimizeCriticalResources } from './seo';
import { initMonitor } from './initialization-monitor';

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
      console.log('🚀 Starting app initialization...');
      initMonitor.startPhase('total');

      // Phase 1: Critical DOM checks with timeout
      initMonitor.startPhase('dom');
      if (!this.isDOMReady()) {
        console.log('⏳ Waiting for DOM...');
        await this.waitForDOM();
      }
      initMonitor.endPhase('dom', true);

      // Phase 2: Environment validation (non-blocking)
      initMonitor.startPhase('environment');
      try {
        const envValid = SecurityUtils.validateEnvironment();
        if (!envValid) {
          issues.push('Environment validation failed - continuing with degraded functionality');
          initMonitor.logWarning('Environment validation failed, continuing anyway');
          initMonitor.endPhase('environment', false, 'Validation failed');
        } else {
          initMonitor.endPhase('environment', true);
        }
      } catch (error) {
        issues.push('Environment check error - non-critical');
        initMonitor.endPhase('environment', false, String(error));
      }

      // Phase 3: SEO and performance optimization (non-blocking)
      initMonitor.startPhase('seo');
      try {
        seoManager.preloadCriticalResources();
        optimizeCriticalResources();
        seoManager.updateMeta({
          title: 'GeoCache Lore - Discover Hidden Stories Around the World',
          description: 'Explore fascinating facts and hidden stories about locations worldwide.',
        });
        initMonitor.endPhase('seo', true);
      } catch (error) {
        issues.push('SEO initialization had issues - non-critical');
        initMonitor.endPhase('seo', false, String(error));
      }

      // Phase 4: Additional safety checks
      initMonitor.startPhase('safety');
      try {
        // Ensure critical browser APIs are available
        if (typeof window !== 'undefined') {
          // Check for essential APIs
          const criticalAPIs = ['localStorage', 'sessionStorage', 'fetch', 'URL'];
          const missingAPIs = criticalAPIs.filter(api => !(api in window));
          
          if (missingAPIs.length > 0) {
            issues.push(`Missing browser APIs: ${missingAPIs.join(', ')}`);
            initMonitor.logWarning(`Missing browser APIs: ${missingAPIs.join(', ')}`);
            initMonitor.endPhase('safety', false, 'Missing APIs');
          } else {
            initMonitor.endPhase('safety', true);
          }
        } else {
          initMonitor.endPhase('safety', true);
        }
      } catch (error) {
        issues.push('Browser API check failed - non-critical');
        initMonitor.endPhase('safety', false, String(error));
      }

      // Phase 5: Mark as ready
      initMonitor.startPhase('callbacks');
      this.isInitialized = true;
      this.isInitializing = false;

      // Trigger callbacks with error protection
      this.callbacks.forEach((callback, index) => {
        try {
          callback();
        } catch (error) {
          initMonitor.logError(`Callback ${index} failed: ${error}`, 'callbacks');
          issues.push(`Callback ${index} failed`);
        }
      });
      initMonitor.endPhase('callbacks', true);

      initMonitor.endPhase('total', true);
      const duration = Date.now() - startTime;
      
      // Print detailed report
      initMonitor.printReport();
      initMonitor.storeReport();

      return { success: true, issues, duration };
    } catch (error) {
      this.isInitializing = false;
      initMonitor.logError(`Critical initialization error: ${error}`);
      initMonitor.endPhase('total', false, String(error));
      initMonitor.printReport();
      initMonitor.storeReport();
      
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