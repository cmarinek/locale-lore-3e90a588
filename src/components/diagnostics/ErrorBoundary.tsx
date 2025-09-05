import React from 'react';

interface Props {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error: Error; retry: () => void }>;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class DiagnosticErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
    
    console.log('DIAGNOSTIC: ErrorBoundary initialized');
  }

  static getDerivedStateFromError(error: Error): State {
    console.error('DIAGNOSTIC: ErrorBoundary caught error:', error);
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('DIAGNOSTIC: Component error details:', { error, errorInfo });
  }

  render() {
    if (this.state.hasError) {
      const { fallback: Fallback } = this.props;
      
      if (Fallback) {
        return <Fallback error={this.state.error!} retry={() => this.setState({ hasError: false, error: null })} />;
      }

      return (
        <div style={{ padding: '20px', color: 'red', fontFamily: 'monospace' }}>
          <h1>Application Error</h1>
          <p>Component: {this.state.error?.name}</p>
          <p>Message: {this.state.error?.message}</p>
          <pre style={{ background: '#f5f5f5', padding: '10px', overflow: 'auto' }}>
            {this.state.error?.stack}
          </pre>
          <button 
            onClick={() => this.setState({ hasError: false, error: null })}
            style={{ padding: '10px', margin: '10px 0' }}
          >
            Try Again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}