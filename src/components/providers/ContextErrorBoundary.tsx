import React from 'react';

interface Props {
  children: React.ReactNode;
  contextName: string;
  fallback?: React.ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ContextErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    console.error(`Context error in ${error.name}:`, error);
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error(`Context ${this.props.contextName} failed to initialize:`, {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack
    });
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
          <div className="text-center max-w-md">
            <div className="mb-6">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-destructive/10 flex items-center justify-center">
                <svg className="w-8 h-8 text-destructive" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M9 12h6" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-foreground mb-2">
                Context Error
              </h2>
              <p className="text-muted-foreground mb-2">
                Failed to initialize {this.props.contextName}
              </p>
              <p className="text-sm text-muted-foreground mb-6">
                {this.state.error?.message || 'Unknown context error'}
              </p>
            </div>
            
            <div className="space-y-3">
              <button
                onClick={this.handleRetry}
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-medium py-2 px-4 rounded-md transition-colors"
              >
                Retry Context
              </button>
              <button
                onClick={() => window.location.reload()}
                className="w-full bg-secondary text-secondary-foreground hover:bg-secondary/80 font-medium py-2 px-4 rounded-md transition-colors"
              >
                Reload App
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}