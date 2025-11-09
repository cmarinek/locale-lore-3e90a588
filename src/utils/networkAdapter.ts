/**
 * Network Adapter - Adjusts loading strategies based on connection speed
 */

type NetworkSpeed = 'slow-2g' | '2g' | '3g' | '4g' | 'fast';
type DataSaverMode = boolean;

interface NetworkInfo {
  speed: NetworkSpeed;
  effectiveType: string;
  downlink?: number;
  rtt?: number;
  saveData: DataSaverMode;
}

interface AdaptiveStrategy {
  prefetchEnabled: boolean;
  prefetchPriority: number;
  batchDelay: number;
  cacheSize: number;
  imageQuality: number;
  preloadDistance: number; // pixels before viewport
}

class NetworkAdapter {
  private currentInfo: NetworkInfo | null = null;
  private listeners: Array<(info: NetworkInfo) => void> = [];

  constructor() {
    this.detectConnection();
    this.setupListeners();
  }

  /**
   * Detect current network connection
   */
  private detectConnection(): void {
    if ('connection' in navigator) {
      const conn = (navigator as any).connection;
      this.currentInfo = {
        speed: this.mapEffectiveType(conn.effectiveType),
        effectiveType: conn.effectiveType || '4g',
        downlink: conn.downlink,
        rtt: conn.rtt,
        saveData: conn.saveData || false,
      };
    } else {
      // Fallback to fast connection
      this.currentInfo = {
        speed: '4g',
        effectiveType: '4g',
        saveData: false,
      };
    }
  }

  /**
   * Map effective type to simplified speed
   */
  private mapEffectiveType(type: string): NetworkSpeed {
    switch (type) {
      case 'slow-2g':
        return 'slow-2g';
      case '2g':
        return '2g';
      case '3g':
        return '3g';
      case '4g':
        return '4g';
      default:
        return 'fast';
    }
  }

  /**
   * Setup listeners for connection changes
   */
  private setupListeners(): void {
    if ('connection' in navigator) {
      const conn = (navigator as any).connection;
      conn.addEventListener('change', () => {
        this.detectConnection();
        this.notifyListeners();
      });
    }
  }

  /**
   * Get current network info
   */
  getNetworkInfo(): NetworkInfo {
    if (!this.currentInfo) {
      this.detectConnection();
    }
    return this.currentInfo!;
  }

  /**
   * Get adaptive strategy based on connection
   */
  getAdaptiveStrategy(): AdaptiveStrategy {
    const info = this.getNetworkInfo();

    // If data saver is on, use conservative settings
    if (info.saveData) {
      return {
        prefetchEnabled: false,
        prefetchPriority: 0,
        batchDelay: 200,
        cacheSize: 20,
        imageQuality: 60,
        preloadDistance: 0,
      };
    }

    // Adjust based on connection speed
    switch (info.speed) {
      case 'slow-2g':
      case '2g':
        return {
          prefetchEnabled: false,
          prefetchPriority: 0,
          batchDelay: 300,
          cacheSize: 30,
          imageQuality: 65,
          preloadDistance: 0,
        };

      case '3g':
        return {
          prefetchEnabled: true,
          prefetchPriority: 1,
          batchDelay: 100,
          cacheSize: 50,
          imageQuality: 75,
          preloadDistance: 100,
        };

      case '4g':
        return {
          prefetchEnabled: true,
          prefetchPriority: 2,
          batchDelay: 50,
          cacheSize: 100,
          imageQuality: 85,
          preloadDistance: 200,
        };

      case 'fast':
      default:
        return {
          prefetchEnabled: true,
          prefetchPriority: 3,
          batchDelay: 30,
          cacheSize: 150,
          imageQuality: 90,
          preloadDistance: 300,
        };
    }
  }

  /**
   * Check if prefetching should be enabled
   */
  shouldPrefetch(): boolean {
    return this.getAdaptiveStrategy().prefetchEnabled;
  }

  /**
   * Subscribe to network changes
   */
  onChange(callback: (info: NetworkInfo) => void): () => void {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter((cb) => cb !== callback);
    };
  }

  /**
   * Notify all listeners
   */
  private notifyListeners(): void {
    if (this.currentInfo) {
      this.listeners.forEach((cb) => cb(this.currentInfo!));
    }
  }

  /**
   * Get connection quality score (0-100)
   */
  getQualityScore(): number {
    const info = this.getNetworkInfo();
    
    if (info.saveData) return 20;

    switch (info.speed) {
      case 'slow-2g':
        return 10;
      case '2g':
        return 30;
      case '3g':
        return 60;
      case '4g':
        return 85;
      case 'fast':
        return 100;
      default:
        return 70;
    }
  }
}

export const networkAdapter = new NetworkAdapter();

/**
 * Hook for using network adapter in components
 */
export function useNetworkAdapter() {
  const [networkInfo, setNetworkInfo] = React.useState<NetworkInfo>(
    networkAdapter.getNetworkInfo()
  );

  React.useEffect(() => {
    return networkAdapter.onChange((info) => {
      setNetworkInfo(info);
    });
  }, []);

  return {
    networkInfo,
    strategy: networkAdapter.getAdaptiveStrategy(),
    shouldPrefetch: networkAdapter.shouldPrefetch(),
    qualityScore: networkAdapter.getQualityScore(),
  };
}

// For non-React usage
import * as React from 'react';
