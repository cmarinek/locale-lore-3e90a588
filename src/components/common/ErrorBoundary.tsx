import React, { Component, ReactNode } from 'react';
import { trackError } from '@/utils/monitoring';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  isDiagnostic?: boolean;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
    
    if (props.isDiagnostic) {
      console.log('DIAGNOSTIC: ErrorBoundary initialized');
    }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({ errorInfo });
    
    if (this.props.isDiagnostic) {
      console.error('DIAGNOSTIC: ErrorBoundary caught error:', error);
      console.error('DIAGNOSTIC: Component error details:', { error, errorInfo });
    }
    
    // Track the error for monitoring (unless in diagnostic mode)
    if (!this.props.isDiagnostic) {
      trackError(error, {
        componentStack: errorInfo.componentStack,
        errorBoundary: true,
      });
    }

    // Call custom error handler if provided
    this.props.onError?.(error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Diagnostic mode rendering (for development)
      if (this.props.isDiagnostic) {
        return (
          <div style={{ padding: '20px', color: 'red', fontFamily: 'monospace' }}>
            <h1>Application Error (Diagnostic)</h1>
            <p>Component: {this.state.error?.name}</p>
            <p>Message: {this.state.error?.message}</p>
            <pre style={{ background: '#f5f5f5', padding: '10px', overflow: 'auto' }}>
              {this.state.error?.stack}
            </pre>
            <button 
              onClick={this.handleRetry}
              style={{ padding: '10px', margin: '10px 0' }}
            >
              Try Again
            </button>
          </div>
        );
      }

      // Production mode rendering
      return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
          <div className="bg-card rounded-xl p-8 elevation-2 max-w-md mx-auto">
            <AlertTriangle className="h-16 w-16 text-destructive mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Something went wrong</h2>
            <p className="text-muted-foreground mb-6">
              We're sorry, but something unexpected happened. The error has been reported to our team.
            </p>
            
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mb-4 text-left">
                <summary className="cursor-pointer text-sm font-medium mb-2">
                  Error Details (Development)
                </summary>
                <pre className="text-xs bg-muted p-2 rounded overflow-auto max-h-32">
                  {this.state.error.toString()}
                  {this.state.errorInfo?.componentStack}
                </pre>
              </details>
            )}
            
            <div className="flex gap-3 justify-center">
              <Button onClick={this.handleRetry} variant="default">
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again
              </Button>
              <Button 
                onClick={() => window.location.href = '/'} 
                variant="outline"
              >
                Go Home
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Convenience exports for backwards compatibility
export const DiagnosticErrorBoundary = (props: Omit<Props, 'isDiagnostic'>) => (
  <ErrorBoundary {...props} isDiagnostic={true} />
);

export const ProductionErrorBoundary = (props: Omit<Props, 'isDiagnostic'>) => (
  <ErrorBoundary {...props} isDiagnostic={false} />
);