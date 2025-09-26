/**
 * Simplified initialization system to replace multiple overlapping systems
 * This consolidates app-initialization, initialization-manager, and initialization-monitor
 */

interface InitResult {
  success: boolean;
  issues: string[];
  duration: number;
}

class SimplifiedInitializer {
  private isReady = false;
  private isInitializing = false;
  private readyCallbacks: (() => void)[] = [];
  private initStartTime = 0;

  async initialize(): Promise<InitResult> {
    console.log('🔧 SimplifiedInitializer: Starting initialization...');
    
    if (this.isReady) {
      console.log('✅ SimplifiedInitializer: Already initialized');
      return { success: true, issues: [], duration: 0 };
    }

    if (this.isInitializing) {
      console.log('⏳ SimplifiedInitializer: Already initializing, waiting...');
      // Wait for current initialization to complete
      return new Promise((resolve) => {
        this.onReady(() => {
          console.log('✅ SimplifiedInitializer: Waited initialization completed');
          resolve({ success: true, issues: [], duration: 0 });
        });
      });
    }

    this.isInitializing = true;
    this.initStartTime = performance.now();
    const issues: string[] = [];

    try {
      console.log('🔍 SimplifiedInitializer: Checking DOM ready...');
      await this.checkDOMReady();
      console.log('✅ SimplifiedInitializer: DOM ready');

      console.log('🔍 SimplifiedInitializer: Validating environment...');
      await this.validateEnvironment();
      console.log('✅ SimplifiedInitializer: Environment validated');

      console.log('🔍 SimplifiedInitializer: Setting up browser APIs...');
      await this.setupBrowserAPIs();
      console.log('✅ SimplifiedInitializer: Browser APIs setup');

      this.isReady = true;
      this.isInitializing = false;

      // Execute ready callbacks
      console.log(`🎯 SimplifiedInitializer: Executing ${this.readyCallbacks.length} ready callbacks...`);
      this.readyCallbacks.forEach((callback, index) => {
        try {
          console.log(`🎯 SimplifiedInitializer: Executing callback ${index + 1}`);
          callback();
        } catch (error) {
          console.warn(`⚠️ SimplifiedInitializer: Ready callback ${index + 1} failed:`, error);
        }
      });
      this.readyCallbacks = [];

      const duration = performance.now() - this.initStartTime;
      console.log(`🎉 SimplifiedInitializer: Initialization completed successfully in ${duration.toFixed(2)}ms`);
      return { success: true, issues, duration };

    } catch (error) {
      this.isInitializing = false;
      issues.push(String(error));
      const duration = performance.now() - this.initStartTime;
      console.error(`💥 SimplifiedInitializer: Initialization failed after ${duration.toFixed(2)}ms:`, error);
      return { success: false, issues, duration };
    }
  }

  private async checkDOMReady(): Promise<void> {
    if (document.readyState === 'loading') {
      await new Promise(resolve => {
        document.addEventListener('DOMContentLoaded', resolve, { once: true });
      });
    }
  }

  private async validateEnvironment(): Promise<void> {
    // Basic environment checks
    if (typeof window === 'undefined') {
      throw new Error('Window not available');
    }
    
    if (!document.getElementById('root')) {
      throw new Error('Root element not found');
    }
  }

  private async setupBrowserAPIs(): Promise<void> {
    // Setup safe browser API access without throwing
    if (!navigator.geolocation) {
      console.warn('Geolocation API not available');
    }
  }

  isInitialized(): boolean {
    return this.isReady;
  }

  onReady(callback: () => void): void {
    if (this.isReady) {
      callback();
    } else {
      this.readyCallbacks.push(callback);
    }
  }

  async safeGetLocation(): Promise<{ latitude: number; longitude: number } | null> {
    if (!this.isReady) {
      await this.initialize();
    }

    if (!navigator.geolocation) {
      return null;
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
          // Fallback to default location (London)
          resolve({ latitude: 51.5074, longitude: -0.1278 });
        },
        { timeout: 5000 }
      );
    });
  }
}

// Export singleton instance
export const simplifiedInitializer = new SimplifiedInitializer();