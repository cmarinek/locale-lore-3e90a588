import React from 'react';

interface Props {
  children: React.ReactNode;
}

interface State {
  hasChunkError: boolean;
  hasError: boolean;
}

export class ChunkErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasChunkError: false, hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    // Check if it's a chunk loading error
    const chunkFailedMessage = /Loading chunk [\d]+ failed/.test(error.message);
    const chunkLoadError = error.message.includes('Loading CSS chunk');
    const importError = error.message.includes('Failed to import');
    
    return {
      hasChunkError: chunkFailedMessage || chunkLoadError || importError,
      hasError: true
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ChunkErrorBoundary caught an error:', error, errorInfo);
    
    // If it's a chunk error, we should reload
    if (this.state.hasChunkError) {
      console.log('🔄 Chunk loading error detected, will reload');
    }
  }

  handleReload = () => {
    window.location.reload();
  };

  handleRetry = () => {
    this.setState({ hasChunkError: false, hasError: false });
  };

  render() {
    if (this.state.hasChunkError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
          <div className="text-center max-w-md">
            <div className="mb-6">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-destructive/10 flex items-center justify-center">
                <svg className="w-8 h-8 text-destructive" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.314 15.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-foreground mb-2">
                App Update Required
              </h2>
              <p className="text-muted-foreground mb-6">
                A new version of the app is available. Please refresh to continue.
              </p>
            </div>
            
            <div className="space-y-3">
              <button
                onClick={this.handleReload}
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-medium py-2 px-4 rounded-md transition-colors"
              >
                Refresh App
              </button>
              <button
                onClick={this.handleRetry}
                className="w-full bg-secondary text-secondary-foreground hover:bg-secondary/80 font-medium py-2 px-4 rounded-md transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      );
    }

    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
          <div className="text-center max-w-md">
            <div className="mb-6">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-destructive/10 flex items-center justify-center">
                <svg className="w-8 h-8 text-destructive" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-foreground mb-2">
                Something went wrong
              </h2>
              <p className="text-muted-foreground mb-6">
                An unexpected error occurred. Try refreshing the page.
              </p>
            </div>
            
            <div className="space-y-3">
              <button
                onClick={this.handleReload}
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-medium py-2 px-4 rounded-md transition-colors"
              >
                Refresh Page
              </button>
              <button
                onClick={this.handleRetry}
                className="w-full bg-secondary text-secondary-foreground hover:bg-secondary/80 font-medium py-2 px-4 rounded-md transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}