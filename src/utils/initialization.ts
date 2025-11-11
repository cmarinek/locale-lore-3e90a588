/**
 * Unified Initialization System
 * Consolidates all app initialization into a single, robust manager
 * Fixes: duplicate systems, incomplete methods, missing error handling
 */
import { initI18n } from '@/utils/i18n';
import { analytics } from '@/utils/analytics';
import { initializeErrorTracking, initializePerformanceMonitoring } from '@/utils/monitoring';
import { registerServiceWorker } from '@/utils/pwa';
import { config } from '@/config/environments';

interface InitResult {
  success: boolean;
  issues: string[];
  duration: number;
}

interface InitModule {
  name: string;
  init: () => Promise<void>;
  critical: boolean;
}

class UnifiedInitializer {
  private isReady = false;
  private isInitializing = false;
  private readyCallbacks: (() => void)[] = [];
  private initStartTime = 0;
  private initModules: InitModule[] = [];

  constructor() {
    this.registerModules();
  }

  private registerModules(): void {
    this.initModules = [
      {
        name: 'DOM',
        init: () => this.checkDOMReady(),
        critical: true,
      },
      {
        name: 'Environment',
        init: () => this.validateEnvironment(),
        critical: true,
      },
      {
        name: 'Browser APIs',
        init: () => this.setupBrowserAPIs(),
        critical: false,
      },
      {
        name: 'i18n',
        init: () => this.initializeI18n(),
        critical: false,
      },
      {
        name: 'Error Tracking',
        init: () => this.initializeErrorTracking(),
        critical: false,
      },
      {
        name: 'Performance Monitoring',
        init: () => this.initializePerformanceMonitoring(),
        critical: false,
      },
      {
        name: 'Analytics',
        init: () => this.initializeAnalytics(),
        critical: false,
      },
      {
        name: 'Service Worker',
        init: () => this.initializeServiceWorker(),
        critical: false,
      },
    ];
  }

  async initialize(): Promise<InitResult> {
    if (this.isReady) {
      return { success: true, issues: [], duration: 0 };
    }

    if (this.isInitializing) {
      return new Promise((resolve) => {
        this.onReady(() => {
          resolve({ success: true, issues: [], duration: 0 });
        });
      });
    }

    this.isInitializing = true;
    this.initStartTime = performance.now();
    const issues: string[] = [];

    console.log('🚀 Starting unified app initialization...');

    try {
      for (const module of this.initModules) {
        try {
          console.log(`  ⏳ Initializing ${module.name}...`);
          await module.init();
          console.log(`  ✅ ${module.name} initialized`);
        } catch (error) {
          const errorMsg = `${module.name} initialization failed: ${error instanceof Error ? error.message : String(error)}`;
          console.error(`  ❌ ${errorMsg}`);

          if (module.critical) {
            throw new Error(errorMsg);
          } else {
            issues.push(errorMsg);
          }
        }
      }

      this.isReady = true;
      this.isInitializing = false;

      this.readyCallbacks.forEach((callback) => {
        try {
          callback();
        } catch (error) {
          console.warn('Ready callback failed:', error);
        }
      });
      this.readyCallbacks = [];

      const duration = performance.now() - this.initStartTime;
      console.log(`✅ Initialization completed in ${duration.toFixed(2)}ms`);

      if (issues.length > 0) {
        console.warn(`⚠️ ${issues.length} non-critical issues encountered:`, issues);
      }

      return { success: true, issues, duration };
    } catch (error) {
      this.isInitializing = false;
      const errorMsg = error instanceof Error ? error.message : String(error);
      issues.push(errorMsg);
      const duration = performance.now() - this.initStartTime;
      console.error(`❌ Critical initialization failure after ${duration.toFixed(2)}ms:`, error);
      return { success: false, issues, duration };
    }
  }

  // Module initialization methods
  private async checkDOMReady(): Promise<void> {
    if (document.readyState === 'loading') {
      await new Promise<void>((resolve) => {
        document.addEventListener('DOMContentLoaded', () => resolve(), { once: true });
      });
    }
  }

  private async validateEnvironment(): Promise<void> {
    if (typeof window === 'undefined') {
      throw new Error('Window not available');
    }

    if (!document.getElementById('root')) {
      throw new Error('Root element not found');
    }

    // Validate required environment variables
    const requiredEnvVars = ['VITE_SUPABASE_URL', 'VITE_SUPABASE_ANON_KEY'];
    const missing = requiredEnvVars.filter((key) => !import.meta.env[key]);

    if (missing.length > 0) {
      console.warn(`Missing environment variables: ${missing.join(', ')}`);
    }
  }

  private async setupBrowserAPIs(): Promise<void> {
    // Safely detect browser API availability
    if (!navigator.geolocation) {
      console.warn('Geolocation API not available');
    }

    if (!('localStorage' in window)) {
      console.warn('LocalStorage not available');
    }

    if (!('serviceWorker' in navigator)) {
      console.warn('Service Worker not supported');
    }
  }

  private async initializeI18n(): Promise<void> {
    try {
      await initI18n();
    } catch (error) {
      throw new Error(`i18n initialization failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  private async initializeErrorTracking(): Promise<void> {
    try {
      if (config.enableErrorTracking) {
        initializeErrorTracking();
      }
    } catch (error) {
      throw new Error(`Error tracking setup failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  private async initializePerformanceMonitoring(): Promise<void> {
    try {
      initializePerformanceMonitoring();
    } catch (error) {
      throw new Error(`Performance monitoring setup failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  private async initializeAnalytics(): Promise<void> {
    try {
      if (config.enableAnalytics && analytics && typeof analytics.initialize === 'function') {
        analytics.initialize();
      }
    } catch (error) {
      throw new Error(`Analytics initialization failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  private async initializeServiceWorker(): Promise<void> {
    try {
      if ('serviceWorker' in navigator && config.environment === 'production') {
        registerServiceWorker();
      }
    } catch (error) {
      throw new Error(`Service Worker registration failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  // Public API
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
            longitude: position.coords.longitude,
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

  getInitializationReport(): {
    isReady: boolean;
    modules: Array<{ name: string; status: string }>;
  } {
    return {
      isReady: this.isReady,
      modules: this.initModules.map((m) => ({
        name: m.name,
        status: this.isReady ? 'initialized' : 'pending',
      })),
    };
  }
}

// Export singleton instance
export const initializer = new UnifiedInitializer();

// Legacy exports for backward compatibility
export const simplifiedInitializer = initializer;

// Bootstrap function for main.tsx
export const bootstrapApp = () => {
  if (typeof window === 'undefined') {
    return;
  }

  if ((window as any).__APP_BOOTSTRAPPED__) {
    return;
  }

  (window as any).__APP_BOOTSTRAPPED__ = true;

  // Initialize asynchronously without blocking render
  initializer.initialize().catch((error) => {
    console.error('Bootstrap failed:', error);
  });
};
