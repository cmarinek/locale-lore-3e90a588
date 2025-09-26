/**
 * Vite Chunk Optimizer - Handles chunk loading failures and optimizes React context bundling
 */

interface ChunkLoadError {
  chunkId: string;
  error: Error;
  timestamp: number;
  retryCount: number;
}

class ViteChunkOptimizer {
  private chunkErrors = new Map<string, ChunkLoadError>();
  private maxRetries = 3;
  private retryDelay = 1000;

  constructor() {
    this.setupChunkErrorHandling();
  }

  private setupChunkErrorHandling(): void {
    // Handle dynamic import failures
    const originalImport = (window as any).__vitePreload;
    if (originalImport) {
      (window as any).__vitePreload = async (baseModule: any, deps?: string[], importMap?: any) => {
        try {
          return await originalImport(baseModule, deps, importMap);
        } catch (error) {
          console.warn('Vite chunk loading failed, retrying...', error);
          return this.retryChunkLoad(baseModule, deps, importMap, error);
        }
      };
    }

    // Global error handler for chunk failures
    window.addEventListener('error', (event) => {
      if (this.isChunkLoadError(event.error)) {
        console.warn('Chunk load error detected:', event.error);
        this.handleChunkError(event.error);
      }
    });

    // Handle unhandled promise rejections for dynamic imports
    window.addEventListener('unhandledrejection', (event) => {
      if (this.isChunkLoadError(event.reason)) {
        console.warn('Unhandled chunk load rejection:', event.reason);
        event.preventDefault(); // Prevent error from propagating
        this.handleChunkError(event.reason);
      }
    });
  }

  private isChunkLoadError(error: any): boolean {
    if (!error || typeof error !== 'object') return false;
    
    const errorMessage = error.message || '';
    const chunkPatterns = [
      /Loading chunk \d+ failed/,
      /Loading CSS chunk \d+ failed/,
      /Failed to import/,
      /ChunkLoadError/,
      /NetworkError.*chunk/i,
    ];

    return chunkPatterns.some(pattern => pattern.test(errorMessage));
  }

  private async retryChunkLoad(
    baseModule: any, 
    deps?: string[], 
    importMap?: any, 
    originalError?: Error
  ): Promise<any> {
    const chunkId = this.getChunkId(baseModule);
    const existingError = this.chunkErrors.get(chunkId);

    if (existingError && existingError.retryCount >= this.maxRetries) {
      console.error(`Max retries exceeded for chunk ${chunkId}`, originalError);
      throw originalError;
    }

    // Update or create error record
    this.chunkErrors.set(chunkId, {
      chunkId,
      error: originalError || new Error('Unknown chunk error'),
      timestamp: Date.now(),
      retryCount: (existingError?.retryCount || 0) + 1
    });

    // Wait before retry
    await new Promise(resolve => setTimeout(resolve, this.retryDelay));

    try {
      // Try to reload the chunk
      const originalImport = (window as any).__viteOriginalPreload || 
                           ((window as any).__vitePreload);
      
      if (originalImport) {
        const result = await originalImport(baseModule, deps, importMap);
        this.chunkErrors.delete(chunkId); // Success - clear error
        return result;
      }
      
      throw new Error('No import function available');
    } catch (retryError) {
      console.warn(`Retry ${existingError?.retryCount || 1} failed for chunk ${chunkId}:`, retryError);
      
      if ((existingError?.retryCount || 0) >= this.maxRetries - 1) {
        // Last retry failed - suggest reload
        this.suggestReload();
        throw retryError;
      }
      
      // Recursive retry
      return this.retryChunkLoad(baseModule, deps, importMap, retryError);
    }
  }

  private getChunkId(baseModule: any): string {
    if (typeof baseModule === 'string') {
      return baseModule;
    }
    if (baseModule && baseModule.toString) {
      return baseModule.toString();
    }
    return 'unknown-chunk';
  }

  private handleChunkError(error: Error): void {
    console.warn('Handling chunk error:', error);
    
    // If it's a critical chunk (React contexts), suggest reload
    if (this.isCriticalChunk(error)) {
      this.suggestReload();
    }
  }

  private isCriticalChunk(error: Error): boolean {
    const errorMessage = error.message || '';
    const criticalPatterns = [
      /contexts/i,
      /providers/i,
      /react/i,
      /helmet/i,
      /auth/i,
      /theme/i,
      /language/i,
    ];

    return criticalPatterns.some(pattern => pattern.test(errorMessage));
  }

  private suggestReload(): void {
    console.warn('Critical chunk loading failed - reload recommended');
    
    // Create a user-friendly notification
    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: hsl(var(--destructive));
      color: hsl(var(--destructive-foreground));
      padding: 16px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      z-index: 10000;
      max-width: 300px;
      font-family: system-ui, sans-serif;
    `;
    
    notification.innerHTML = `
      <div style="font-weight: 600; margin-bottom: 8px;">App Update Available</div>
      <div style="font-size: 14px; margin-bottom: 12px;">Please refresh to continue</div>
      <button onclick="window.location.reload()" style="
        background: white;
        color: hsl(var(--destructive));
        border: none;
        padding: 6px 12px;
        border-radius: 4px;
        cursor: pointer;
        font-weight: 500;
      ">Refresh</button>
    `;
    
    document.body.appendChild(notification);

    // Auto-remove after 30 seconds
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 30000);
  }

  // Public method to check chunk health
  public getChunkErrorStats(): {
    totalErrors: number;
    chunksWithErrors: string[];
    retryStats: Array<{ chunkId: string; retryCount: number }>;
  } {
    return {
      totalErrors: this.chunkErrors.size,
      chunksWithErrors: Array.from(this.chunkErrors.keys()),
      retryStats: Array.from(this.chunkErrors.values()).map(error => ({
        chunkId: error.chunkId,
        retryCount: error.retryCount
      }))
    };
  }

  // Clear error history
  public clearErrorHistory(): void {
    this.chunkErrors.clear();
  }
}

// Global chunk optimizer instance
export const viteChunkOptimizer = new ViteChunkOptimizer();

// Make it available for debugging
if (import.meta.env.DEV) {
  (window as any).viteChunkOptimizer = viteChunkOptimizer;
}