import React, { Component, ReactNode } from 'react';

// Safe import for monitoring
let trackError: any;
try {
  const monitoring = require('@/utils/monitoring');
  trackError = monitoring.trackError;
} catch (error) {
  console.warn('Monitoring utility not available:', error);
  trackError = () => {}; // Safe fallback
}

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
    if (!this.props.isDiagnostic && trackError) {
      try {
        trackError(error, {
          componentStack: errorInfo.componentStack,
          errorBoundary: true,
        });
      } catch (trackingError) {
        console.warn('Error tracking failed:', trackingError);
      }
    }

    // Call custom error handler if provided
    this.props.onError?.(error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  handleGoHome = () => {
    try {
      if (typeof window !== 'undefined') {
        window.location.href = '/';
      }
    } catch (error) {
      console.error('Navigation failed:', error);
      if (typeof window !== 'undefined') {
        window.location.reload();
      }
    }
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

      // Production mode rendering with inline styles to avoid dependency issues
      return (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          padding: '16px',
          textAlign: 'center'
        }}>
          <div style={{
            backgroundColor: 'var(--card, #ffffff)',
            borderRadius: '12px',
            padding: '32px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
            maxWidth: '448px',
            margin: '0 auto'
          }}>
            <div style={{
              height: '64px',
              width: '64px',
              margin: '0 auto 16px',
              backgroundColor: 'var(--destructive, #ef4444)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '24px'
            }}>⚠️</div>
            
            <h2 style={{
              fontSize: '20px',
              fontWeight: '600',
              marginBottom: '8px',
              color: 'var(--foreground, #000000)'
            }}>
              Something went wrong
            </h2>
            
            <p style={{
              color: 'var(--muted-foreground, #6b7280)',
              marginBottom: '24px'
            }}>
              We're sorry, but something unexpected happened. The error has been reported to our team.
            </p>
            
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details style={{ marginBottom: '16px', textAlign: 'left' }}>
                <summary style={{
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500',
                  marginBottom: '8px'
                }}>
                  Error Details (Development)
                </summary>
                <pre style={{
                  fontSize: '12px',
                  backgroundColor: 'var(--muted, #f3f4f6)',
                  padding: '8px',
                  borderRadius: '4px',
                  overflow: 'auto',
                  maxHeight: '128px'
                }}>
                  {this.state.error.toString()}
                  {this.state.errorInfo?.componentStack}
                </pre>
              </details>
            )}
            
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button 
                onClick={this.handleRetry}
                style={{
                  padding: '8px 16px',
                  backgroundColor: 'var(--primary, #3b82f6)',
                  color: 'var(--primary-foreground, #ffffff)',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500'
                }}
              >
                🔄 Try Again
              </button>
              <button 
                onClick={this.handleGoHome}
                style={{
                  padding: '8px 16px',
                  backgroundColor: 'transparent',
                  color: 'var(--foreground, #000000)',
                  border: '1px solid var(--border, #e5e7eb)',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500'
                }}
              >
                Go Home
              </button>
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