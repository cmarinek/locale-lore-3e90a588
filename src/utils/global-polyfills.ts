/**
 * Global polyfills and safety wrappers to prevent TDZ errors
 * This file MUST be loaded before any other modules
 */

console.log('🔧 POLYFILLS: Starting global polyfills initialization...');

// ===== REACT API POLYFILLS =====
// Do NOT create a fake React object. Only augment an existing global React if present.
if (typeof window !== 'undefined' && (window as any).React) {
  const ReactGlobal: any = (window as any).React;

  // Safe forwardRef polyfill (only if missing)
  if (typeof ReactGlobal.forwardRef !== 'function') {
    ReactGlobal.forwardRef = function safeForwardRefPolyfill<T, P = {}>(
      render: (props: P, ref: any) => any
    ) {
      console.warn('⚠️ POLYFILL: React.forwardRef not available on global React, using fallback');
      return function ForwardRefFallback(props: any) {
        return render(props, null);
      };
    };
  }

  // Safe createElement polyfill (only if missing)
  if (typeof ReactGlobal.createElement !== 'function') {
    ReactGlobal.createElement = function safeCreateElementPolyfill(type: any, props: any, ...children: any[]) {
      console.warn('⚠️ POLYFILL: React.createElement not available on global React, using fallback');
      return { type, props: { ...props, children } };
    };
  }
}

// ===== NAVIGATOR API POLYFILLS =====
if (typeof window !== 'undefined' && typeof navigator !== 'undefined') {
  // Safe geolocation polyfill
  if (!navigator.geolocation) {
    console.warn('⚠️ POLYFILL: navigator.geolocation not available, creating polyfill');
    (navigator as any).geolocation = {
      getCurrentPosition: function(success: PositionCallback, error?: PositionErrorCallback, options?: PositionOptions) {
        console.warn('⚠️ POLYFILL: Geolocation getCurrentPosition called but not available');
        if (error) {
          error({
            code: 1,
            message: 'Geolocation not supported',
            PERMISSION_DENIED: 1,
            POSITION_UNAVAILABLE: 2,
            TIMEOUT: 3
          } as GeolocationPositionError);
        }
      },
      watchPosition: function(success: PositionCallback, error?: PositionErrorCallback, options?: PositionOptions) {
        console.warn('⚠️ POLYFILL: Geolocation watchPosition called but not available');
        if (error) {
          error({
            code: 1,
            message: 'Geolocation not supported',
            PERMISSION_DENIED: 1,
            POSITION_UNAVAILABLE: 2,
            TIMEOUT: 3
          } as GeolocationPositionError);
        }
        return -1;
      },
      clearWatch: function(watchId: number) {
        console.warn('⚠️ POLYFILL: Geolocation clearWatch called but not available');
      }
    };
  } else if (navigator.geolocation && !navigator.geolocation.getCurrentPosition) {
    console.warn('⚠️ POLYFILL: navigator.geolocation exists but getCurrentPosition is missing');
    (navigator.geolocation as any).getCurrentPosition = function(success: PositionCallback, error?: PositionErrorCallback, options?: PositionOptions) {
      console.warn('⚠️ POLYFILL: getCurrentPosition method missing, using fallback');
      if (error) {
        error({
          code: 2,
          message: 'getCurrentPosition method not available',
          PERMISSION_DENIED: 1,
          POSITION_UNAVAILABLE: 2,
          TIMEOUT: 3
        } as GeolocationPositionError);
      }
    };
  }
}

// ===== BROWSER API SAFETY CHECKS =====
export const GlobalAPIChecker = {
  isReactReady(): boolean {
    return typeof window !== 'undefined' && 
           window.React && 
           typeof window.React.forwardRef === 'function' &&
           typeof window.React.createElement === 'function';
  },

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

  isAllReady(): boolean {
    return this.isDOMReady() && this.isReactReady() && this.isNavigatorReady();
  },

  waitForReady(): Promise<void> {
    return new Promise((resolve) => {
      const checkReady = () => {
        if (this.isAllReady()) {
          console.log('✅ POLYFILLS: All APIs ready');
          resolve();
        } else {
          console.log('⏳ POLYFILLS: Waiting for APIs...', {
            dom: this.isDOMReady(),
            react: this.isReactReady(),
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
  react: GlobalAPIChecker.isReactReady(),
  navigator: GlobalAPIChecker.isNavigatorReady(),
  dom: GlobalAPIChecker.isDOMReady()
});