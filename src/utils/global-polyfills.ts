/**
 * Global polyfills and safety wrappers to prevent TDZ errors
 * This file MUST be loaded before any other modules
 */

console.log('🔧 POLYFILLS: Starting global polyfills initialization...');

// ===== REACT API POLYFILLS REMOVED =====
// We no longer polyfill React APIs to avoid interfering with React internals.
// React is exposed globally in src/main.tsx for diagnostics only.

// ===== NAVIGATOR API POLYFILLS =====
if (typeof window !== 'undefined') {
  // Ensure navigator exists
  if (typeof navigator === 'undefined') {
    console.warn('⚠️ POLYFILL: navigator not available, creating minimal polyfill');
    (window as any).navigator = {};
  }
  
  // Safe geolocation polyfill - more robust approach
  if (!navigator.geolocation) {
    console.warn('⚠️ POLYFILL: navigator.geolocation not available, creating polyfill');
    
    const geolocationPolyfill = {
      getCurrentPosition: function(success: PositionCallback, error?: PositionErrorCallback, options?: PositionOptions) {
        console.warn('⚠️ POLYFILL: Geolocation getCurrentPosition called but not available');
        if (error) {
          setTimeout(() => {
            error({
              code: 1,
              message: 'Geolocation not supported in this environment',
              PERMISSION_DENIED: 1,
              POSITION_UNAVAILABLE: 2,
              TIMEOUT: 3
            } as GeolocationPositionError);
          }, 0);
        }
      },
      watchPosition: function(success: PositionCallback, error?: PositionErrorCallback, options?: PositionOptions) {
        console.warn('⚠️ POLYFILL: Geolocation watchPosition called but not available');
        if (error) {
          setTimeout(() => {
            error({
              code: 1,
              message: 'Geolocation not supported in this environment',
              PERMISSION_DENIED: 1,
              POSITION_UNAVAILABLE: 2,
              TIMEOUT: 3
            } as GeolocationPositionError);
          }, 0);
        }
        return -1;
      },
      clearWatch: function(watchId: number) {
        console.warn('⚠️ POLYFILL: Geolocation clearWatch called but not available');
      }
    };
    
    // Use Object.defineProperty for more robust polyfill
    try {
      Object.defineProperty(navigator, 'geolocation', {
        value: geolocationPolyfill,
        writable: false,
        enumerable: true,
        configurable: false
      });
      console.log('✅ POLYFILL: navigator.geolocation polyfill installed successfully');
    } catch (e) {
      console.warn('⚠️ POLYFILL: Could not define geolocation property, falling back to direct assignment');
      (navigator as any).geolocation = geolocationPolyfill;
    }
  } else if (navigator.geolocation && !navigator.geolocation.getCurrentPosition) {
    console.warn('⚠️ POLYFILL: navigator.geolocation exists but getCurrentPosition is missing');
    try {
      navigator.geolocation.getCurrentPosition = function(success: PositionCallback, error?: PositionErrorCallback, options?: PositionOptions) {
        console.warn('⚠️ POLYFILL: getCurrentPosition method missing, using fallback');
        if (error) {
          setTimeout(() => {
            error({
              code: 2,
              message: 'getCurrentPosition method not available',
              PERMISSION_DENIED: 1,
              POSITION_UNAVAILABLE: 2,
              TIMEOUT: 3
            } as GeolocationPositionError);
          }, 0);
        }
      };
    } catch (e) {
      console.warn('⚠️ POLYFILL: Could not patch getCurrentPosition method:', e);
    }
  }
}

// ===== BROWSER API SAFETY CHECKS =====
export const GlobalAPIChecker = {
  // React readiness check removed to avoid dependency on window.React
  isNavigatorReady(): boolean {
    return typeof navigator !== 'undefined' &&
           navigator.geolocation &&
           typeof navigator.geolocation.getCurrentPosition === 'function';
  },

  isDOMReady(): boolean {
    return typeof document !== 'undefined' &&
           document.readyState === 'complete' &&
           document.getElementById('root') !== null;
  },

  // Only check critical APIs that don't interfere with React internals
  isAllReady(): boolean {
    return this.isDOMReady();
  },

  waitForReady(): Promise<void> {
    return new Promise((resolve) => {
      const checkReady = () => {
        if (this.isDOMReady()) {
          console.log('✅ POLYFILLS: DOM ready');
          resolve();
        } else {
          console.log('⏳ POLYFILLS: Waiting for DOM...', {
            dom: this.isDOMReady(),
            navigator: this.isNavigatorReady()
          });
          setTimeout(checkReady, 50);
        }
      };
      checkReady();
    });
  }
};

console.log('✅ POLYFILLS: Global polyfills initialized', {
  navigator: GlobalAPIChecker.isNavigatorReady(),
  dom: GlobalAPIChecker.isDOMReady()
});