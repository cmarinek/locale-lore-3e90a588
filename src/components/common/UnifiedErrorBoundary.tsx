import React, { Component, ReactNode } from 'react';
import { toast } from '@/hooks/use-toast';

// Enhanced error tracking
let trackError: any = () => {};
let reportError: any = () => {};

// Async initialization of monitoring services
(async () => {
  try {
    const monitoring = await import('@/utils/monitoring').catch(() => null);
    trackError = monitoring?.trackError || (() => {});
    
    if (typeof window !== 'undefined' && (window as any).Sentry) {
      reportError = (window as any).Sentry.captureException;
    }
  } catch (error) {
    console.warn('Monitoring utility not available:', error);
  }
})();

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  mode?: 'development' | 'production' | 'diagnostic';
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  enableRecovery?: boolean;
  showErrorDetails?: boolean;
  enableUserFeedback?: boolean;
  enableRetry?: boolean;
  maxRetries?: number;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
  errorId?: string;
  retryCount: number;
}

export class UnifiedErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, retryCount: 0 };
    
    if (props.mode === 'diagnostic') {
      console.log('DIAGNOSTIC: ErrorBoundary initialized');
    }
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    const errorId = `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    return { hasError: true, error, errorId };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({ errorInfo });
    
    const { mode = 'production', onError } = this.props;
    
    if (mode === 'diagnostic') {
      console.error('DIAGNOSTIC: ErrorBoundary caught error:', error);
      console.error('DIAGNOSTIC: Component error details:', { error, errorInfo });
    }
    
    // Enhanced error reporting for non-diagnostic mode
    if (mode !== 'diagnostic') {
      // Track with multiple services
      if (trackError) {
        try {
          trackError(error, {
            componentStack: errorInfo.componentStack,
            errorBoundary: true,
            errorId: this.state.errorId,
            retryCount: this.state.retryCount,
            userAgent: navigator.userAgent,
            url: window.location.href,
            timestamp: new Date().toISOString(),
            mode
          });
        } catch (trackingError) {
          console.warn('Error tracking failed:', trackingError);
        }
      }

      // Report to Sentry if available
      if (reportError) {
        try {
          reportError(error, {
            tags: {
              component: 'UnifiedErrorBoundary',
              errorId: this.state.errorId,
              mode
            },
            extra: {
              componentStack: errorInfo.componentStack,
              retryCount: this.state.retryCount,
            },
          });
        } catch (reportingError) {
          console.warn('Error reporting failed:', reportingError);
        }
      }

      // Show user-friendly notification
      if (mode === 'production') {
        toast({
          title: "Something went wrong",
          description: "We've been notified and are working on a fix. Try refreshing the page.",
          variant: "destructive",
        });
      }
    }

    // Call custom error handler if provided
    onError?.(error, errorInfo);
  }

  handleRetry = () => {
    const { maxRetries = 3 } = this.props;
    
    if (this.state.retryCount >= maxRetries) {
      toast({
        title: "Max retries reached",
        description: "Please refresh the page to continue.",
        variant: "destructive",
      });
      return;
    }

    this.setState(prevState => ({ 
      hasError: false, 
      error: undefined, 
      errorInfo: undefined,
      retryCount: prevState.retryCount + 1 
    }));
    
    // Track retry attempt
    if (trackError) {
      try {
        trackError(new Error('Error boundary retry'), {
          errorId: this.state.errorId,
          retryCount: this.state.retryCount + 1,
          action: 'retry',
        });
      } catch (error) {
        console.warn('Retry tracking failed:', error);
      }
    }
  };

  handleRefresh = () => {
    try {
      window.location.reload();
    } catch (error) {
      console.error('Refresh failed:', error);
    }
  };

  handleGoHome = () => {
    try {
      if (typeof window !== 'undefined') {
        window.location.href = '/';
      }
    } catch (error) {
      console.error('Navigation failed:', error);
      this.handleRefresh();
    }
  };

  render() {
    if (this.state.hasError) {
      const { 
        fallback, 
        mode = 'production', 
        enableRecovery = true, 
        showErrorDetails = false,
        enableRetry = true,
        maxRetries = 3
      } = this.props;

      if (fallback) {
        return fallback;
      }

      // Diagnostic mode rendering (for development)
      if (mode === 'diagnostic') {
        return (
          <div style={{ padding: '20px', color: 'red', fontFamily: 'monospace' }}>
            <h1>Application Error (Diagnostic)</h1>
            <p>Component: {this.state.error?.name}</p>
            <p>Message: {this.state.error?.message}</p>
            <pre style={{ background: '#f5f5f5', padding: '10px', overflow: 'auto' }}>
              {this.state.error?.stack}
            </pre>
            {enableRetry && this.state.retryCount < maxRetries && (
              <button 
                onClick={this.handleRetry}
                style={{ padding: '10px', margin: '10px 0' }}
              >
                Try Again ({this.state.retryCount + 1}/{maxRetries})
              </button>
            )}
          </div>
        );
      }

      // Production/Development mode rendering
      return (
        <div className="flex flex-col items-center justify-center min-h-[400px] p-8 text-center">
          <div className="bg-card border rounded-lg p-8 max-w-md mx-auto shadow-lg">
            <div className="w-16 h-16 mx-auto mb-4 bg-destructive/10 rounded-full flex items-center justify-center">
              <span className="text-2xl">⚠️</span>
            </div>
            
            <h2 className="text-xl font-semibold mb-2 text-card-foreground">
              Something went wrong
            </h2>
            
            <p className="text-muted-foreground mb-6">
              {mode === 'development' 
                ? "An error occurred while rendering this component."
                : "We're sorry, but something unexpected happened. The error has been reported to our team."
              }
            </p>
            
            {/* Error Details for Development */}
            {(mode === 'development' || showErrorDetails) && this.state.error && (
              <details className="mb-6 text-left">
                <summary className="cursor-pointer text-sm font-medium mb-2 text-muted-foreground">
                  🔍 Error Details
                </summary>
                <div className="bg-muted p-3 rounded text-xs font-mono overflow-auto max-h-32">
                  <div className="mb-2">
                    <strong>Error:</strong> {this.state.error.toString()}
                  </div>
                  {this.state.errorInfo?.componentStack && (
                    <div>
                      <strong>Component Stack:</strong>
                      <pre className="text-xs mt-1 whitespace-pre-wrap">
                        {this.state.errorInfo.componentStack.split('\n').slice(0, 5).join('\n')}
                      </pre>
                    </div>
                  )}
                </div>
              </details>
            )}
            
            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              {enableRetry && this.state.retryCount < maxRetries && (
                <button 
                  onClick={this.handleRetry}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
                >
                  🔄 Try Again ({this.state.retryCount + 1}/{maxRetries})
                </button>
              )}
              
              {enableRecovery && (
                <>
                  <button 
                    onClick={this.handleRefresh}
                    className="px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/90 transition-colors"
                  >
                    ↻ Refresh Page
                  </button>
                  
                  <button 
                    onClick={this.handleGoHome}
                    className="px-4 py-2 border border-border rounded-md hover:bg-accent transition-colors"
                  >
                    🏠 Go Home
                  </button>
                </>
              )}
            </div>

            {/* Error ID for support */}
            {this.state.errorId && mode === 'production' && (
              <p className="text-xs text-muted-foreground mt-4">
                Error ID: {this.state.errorId}
              </p>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Convenience exports for different modes
export const DevelopmentErrorBoundary = (props: Omit<Props, 'mode'>) => (
  <UnifiedErrorBoundary {...props} mode="development" showErrorDetails={true} />
);

export const ProductionErrorBoundary = (props: Omit<Props, 'mode'>) => (
  <UnifiedErrorBoundary {...props} mode="production" />
);

export const DiagnosticErrorBoundary = (props: Omit<Props, 'mode'>) => (
  <UnifiedErrorBoundary {...props} mode="diagnostic" />
);

// Default export
export default UnifiedErrorBoundary;