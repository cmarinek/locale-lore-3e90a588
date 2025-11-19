import React, { useState, useEffect, useCallback } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { AlertTriangle, Wifi, WifiOff, RefreshCw } from 'lucide-react';

interface NetworkStatus {
  online: boolean;
  effectiveType: string | null;
  downlink: number | null;
  rtt: number | null;
}

interface FallbackProps {
  fallbackComponent?: React.ComponentType;
  minBandwidth?: number;
  maxLatency?: number;
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: string;
}

// Network-aware component wrapper
export function NetworkAwareFallback({ 
  fallbackComponent: FallbackComponent,
  minBandwidth = 0.5, // Mbps
  maxLatency = 2000, // ms
  children 
}: FallbackProps) {
  const [networkStatus, setNetworkStatus] = useState<NetworkStatus>({
    online: navigator.onLine,
    effectiveType: null,
    downlink: null,
    rtt: null
  });

  const [shouldUseFallback, setShouldUseFallback] = useState(false);

  useEffect(() => {
    const updateNetworkStatus = () => {
      const connection = (navigator as any).connection;
      
      setNetworkStatus({
        online: navigator.onLine,
        effectiveType: connection?.effectiveType || null,
        downlink: connection?.downlink || null,
        rtt: connection?.rtt || null
      });
    };

    const handleOnline = () => updateNetworkStatus();
    const handleOffline = () => updateNetworkStatus();

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Listen for connection changes
    const connection = (navigator as any).connection;
    if (connection) {
      connection.addEventListener('change', updateNetworkStatus);
    }

    updateNetworkStatus();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      if (connection) {
        connection.removeEventListener('change', updateNetworkStatus);
      }
    };
  }, []);

  useEffect(() => {
    const shouldDegrade = 
      !networkStatus.online ||
      (networkStatus.downlink !== null && networkStatus.downlink < minBandwidth) ||
      (networkStatus.rtt !== null && networkStatus.rtt > maxLatency) ||
      networkStatus.effectiveType === 'slow-2g' ||
      networkStatus.effectiveType === '2g';

    setShouldUseFallback(shouldDegrade);
  }, [networkStatus, minBandwidth, maxLatency]);

  if (shouldUseFallback && FallbackComponent) {
    return <FallbackComponent />;
  }

  return <>{children}</>;
}

// Error boundary with retry mechanism
export class ErrorBoundaryWithRetry extends React.Component<
  { children: React.ReactNode; onRetry?: () => void },
  ErrorBoundaryState
> {
  private retryCount = 0;
  private maxRetries = 3;

  constructor(props: { children: React.ReactNode; onRetry?: () => void }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    this.setState({
      error,
      errorInfo: errorInfo.componentStack
    });
  }

  handleRetry = () => {
    if (this.retryCount < this.maxRetries) {
      this.retryCount++;
      this.setState({ hasError: false, error: undefined, errorInfo: undefined });
      this.props.onRetry?.();
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <Card className="p-6 m-4">
          <div className="flex items-center gap-3 mb-4">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            <h3 className="font-semibold">Something went wrong</h3>
          </div>
          
          <p className="text-muted-foreground mb-4">
            We encountered an unexpected error. You can try refreshing the page or continue with limited functionality.
          </p>
          
          {this.retryCount < this.maxRetries && (
            <div className="flex gap-2">
              <Button onClick={this.handleRetry} variant="outline" size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again ({this.maxRetries - this.retryCount} attempts left)
              </Button>
              <Button 
                onClick={() => window.location.reload()} 
                variant="default" 
                size="sm"
              >
                Refresh Page
              </Button>
            </div>
          )}
          
          {process.env.NODE_ENV === 'development' && (
            <details className="mt-4">
              <summary className="cursor-pointer text-sm text-muted-foreground">
                Error Details (Development)
              </summary>
              <pre className="mt-2 text-xs bg-muted p-2 rounded overflow-auto">
                {this.state.error?.stack}
                {this.state.errorInfo}
              </pre>
            </details>
          )}
        </Card>
      );
    }

    return this.props.children;
  }
}

// Network status indicator
export function NetworkStatusIndicator() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showOfflineAlert, setShowOfflineAlert] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowOfflineAlert(false);
    };
    
    const handleOffline = () => {
      setIsOnline(false);
      setShowOfflineAlert(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!showOfflineAlert) return null;

  return (
    <Alert className="fixed top-4 right-4 w-auto max-w-sm z-50">
      <WifiOff className="h-4 w-4" />
      <AlertDescription>
        You're offline. Some features may be limited.
      </AlertDescription>
    </Alert>
  );
}

// Lightweight map fallback
export function MapFallback() {
  return (
    <div className="w-full h-full bg-muted rounded-lg flex flex-col items-center justify-center p-8 text-center">
      <WifiOff className="h-12 w-12 text-muted-foreground mb-4" />
      <h3 className="font-semibold mb-2">Map Unavailable</h3>
      <p className="text-muted-foreground text-sm mb-4">
        The interactive map requires a stable internet connection. 
        Try refreshing the page when your connection improves.
      </p>
      <Button 
        onClick={() => window.location.reload()} 
        variant="outline" 
        size="sm"
      >
        <RefreshCw className="h-4 w-4 mr-2" />
        Retry
      </Button>
    </div>
  );
}

// Performance-aware component loader
export function usePerformanceAwareLoading(threshold: number = 2000) {
  const [useMinimalMode, setUseMinimalMode] = useState(false);

  useEffect(() => {
    const checkPerformance = () => {
      const navigation = performance.getEntriesByType('navigation')[0];
      const loadTime = navigation.loadEventEnd - navigation.loadEventStart;
      
      if (loadTime > threshold) {
        setUseMinimalMode(true);
      }
    };

    // Check after page load
    if (document.readyState === 'complete') {
      checkPerformance();
    } else {
      window.addEventListener('load', checkPerformance);
      return () => window.removeEventListener('load', checkPerformance);
    }
  }, [threshold]);

  return useMinimalMode;
}

// Service worker status
export function ServiceWorkerStatus() {
  const [swStatus, setSwStatus] = useState<'installing' | 'installed' | 'updated' | 'error' | null>(null);

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then(() => {
        setSwStatus('installed');
      });

      navigator.serviceWorker.addEventListener('controllerchange', () => {
        setSwStatus('updated');
      });
    }
  }, []);

  if (swStatus === 'updated') {
    return (
      <Alert className="fixed bottom-4 right-4 w-auto max-w-sm">
        <Wifi className="h-4 w-4" />
        <AlertDescription>
          App updated! Refresh to get the latest version.
          <Button 
            onClick={() => window.location.reload()} 
            variant="link" 
            size="sm" 
            className="ml-2"
          >
            Refresh
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  return null;
}