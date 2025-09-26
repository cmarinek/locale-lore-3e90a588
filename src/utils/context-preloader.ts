/**
 * Context Preloader - Ensures React contexts are properly bundled and initialized
 */

interface ContextModule {
  name: string;
  loader: () => Promise<any>;
  required: boolean;
  timeout?: number;
}

class ContextPreloader {
  private loadedContexts = new Set<string>();
  private loadingContexts = new Map<string, Promise<any>>();

  // Define context modules for preloading
  private contextModules: ContextModule[] = [
    {
      name: 'react-helmet-async',
      loader: () => import('react-helmet-async'),
      required: true,
      timeout: 5000
    },
    {
      name: 'AuthContext',
      loader: () => import('@/contexts/AuthProvider'),
      required: true,
      timeout: 3000
    },
    {
      name: 'ThemeContext',
      loader: () => import('@/contexts/ThemeProvider'),
      required: true,
      timeout: 2000
    },
    {
      name: 'LanguageContext',
      loader: () => import('@/contexts/LanguageProvider'),
      required: true,
      timeout: 3000
    },
    {
      name: 'RealtimeContext',
      loader: () => import('@/components/realtime/RealtimeProvider'),
      required: false,
      timeout: 5000
    }
  ];

  async preloadContexts(): Promise<{
    success: boolean;
    loadedCount: number;
    errors: string[];
    duration: number;
  }> {
    const startTime = Date.now();
    const errors: string[] = [];
    let loadedCount = 0;

    console.log('🔄 Preloading React contexts for optimal bundling...');

    // Load all contexts in parallel
    const loadPromises = this.contextModules.map(async (contextModule) => {
      try {
        // Check if already loaded
        if (this.loadedContexts.has(contextModule.name)) {
          return { success: true, name: contextModule.name };
        }

        // Check if currently loading
        if (this.loadingContexts.has(contextModule.name)) {
          await this.loadingContexts.get(contextModule.name);
          return { success: true, name: contextModule.name };
        }

        // Create timeout promise
        const timeoutPromise = new Promise<never>((_, reject) => {
          setTimeout(() => {
            reject(new Error(`Context ${contextModule.name} loading timeout`));
          }, contextModule.timeout || 5000);
        });

        // Start loading
        const loadPromise = contextModule.loader();
        this.loadingContexts.set(contextModule.name, loadPromise);

        // Race between loading and timeout
        await Promise.race([loadPromise, timeoutPromise]);
        
        this.loadedContexts.add(contextModule.name);
        this.loadingContexts.delete(contextModule.name);
        
        console.log(`✅ Context preloaded: ${contextModule.name}`);
        return { success: true, name: contextModule.name };

      } catch (error) {
        this.loadingContexts.delete(contextModule.name);
        const errorMsg = `Failed to preload ${contextModule.name}: ${error}`;
        
        if (contextModule.required) {
          console.error(`❌ ${errorMsg}`);
          errors.push(errorMsg);
        } else {
          console.warn(`⚠️ ${errorMsg} (non-critical)`);
        }
        
        return { success: false, name: contextModule.name };
      }
    });

    // Wait for all preloading attempts
    const results = await Promise.allSettled(loadPromises);
    
    results.forEach((result) => {
      if (result.status === 'fulfilled' && result.value.success) {
        loadedCount++;
      }
    });

    const duration = Date.now() - startTime;
    const success = errors.length === 0; // Only required context failures count as errors

    console.log(`📊 Context preloading complete: ${loadedCount}/${this.contextModules.length} loaded in ${duration}ms`);

    return {
      success,
      loadedCount,
      errors,
      duration
    };
  }

  isContextLoaded(contextName: string): boolean {
    return this.loadedContexts.has(contextName);
  }

  getLoadedContexts(): string[] {
    return Array.from(this.loadedContexts);
  }

  // Preload specific context
  async preloadContext(contextName: string): Promise<boolean> {
    const contextModule = this.contextModules.find(m => m.name === contextName);
    if (!contextModule) {
      console.warn(`Context ${contextName} not found in preloader registry`);
      return false;
    }

    try {
      if (this.loadedContexts.has(contextName)) {
        return true;
      }

      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => {
          reject(new Error(`Context ${contextName} loading timeout`));
        }, contextModule.timeout || 5000);
      });

      await Promise.race([contextModule.loader(), timeoutPromise]);
      this.loadedContexts.add(contextName);
      
      console.log(`✅ Context preloaded individually: ${contextName}`);
      return true;
    } catch (error) {
      console.error(`❌ Failed to preload context ${contextName}:`, error);
      return false;
    }
  }
}

// Global context preloader instance
export const contextPreloader = new ContextPreloader();

// Utility to ensure contexts are ready before rendering
export const waitForContexts = async (requiredContexts: string[] = []): Promise<boolean> => {
  if (requiredContexts.length === 0) {
    // If no specific contexts required, preload all
    const result = await contextPreloader.preloadContexts();
    return result.success;
  }

  // Preload specific contexts
  const results = await Promise.all(
    requiredContexts.map(context => contextPreloader.preloadContext(context))
  );

  return results.every(success => success);
};

// Helper to check if all contexts are ready
export const areContextsReady = (): boolean => {
  const loadedContexts = contextPreloader.getLoadedContexts();
  const requiredContexts = ['react-helmet-async', 'AuthContext', 'ThemeContext', 'LanguageContext'];
  
  return requiredContexts.every(context => loadedContexts.includes(context));
};