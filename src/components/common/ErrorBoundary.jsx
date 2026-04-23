import React from 'react';

/**
 * ErrorBoundary — catches unhandled React render errors.
 * Wrap the entire app (or critical subtrees) with this to prevent
 * white-screen crashes from propagating to the user.
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });
    // In production, send to observability service
    if (process.env.NODE_ENV === 'production') {
      console.error('[ErrorBoundary]', error.message, errorInfo.componentStack);
      // Future: send to Sentry/LogRocket/BugSnag here
    }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          minHeight: '60vh', padding: '40px 20px', textAlign: 'center'
        }}>
          <div style={{
            background: '#fff5f5', border: '1px solid #feb2b2', borderRadius: '12px',
            padding: '32px 40px', maxWidth: '500px', width: '100%'
          }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚠️</div>
            <h2 style={{ color: '#c53030', marginBottom: '12px' }}>Something went wrong</h2>
            <p style={{ color: '#666', marginBottom: '24px', fontSize: '14px' }}>
              An unexpected error occurred. Your data is safe — this is a display issue only.
            </p>
            {process.env.NODE_ENV !== 'production' && this.state.error && (
              <pre style={{
                background: '#1a1a1a', color: '#ff6b6b', padding: '12px', borderRadius: '8px',
                fontSize: '11px', textAlign: 'left', overflow: 'auto', marginBottom: '20px'
              }}>
                {this.state.error.toString()}
              </pre>
            )}
            <button
              onClick={this.handleReset}
              style={{
                background: '#c53030', color: 'white', border: 'none', borderRadius: '8px',
                padding: '10px 24px', cursor: 'pointer', fontWeight: '600', marginRight: '12px'
              }}
            >
              Try Again
            </button>
            <button
              onClick={() => window.location.href = '/dashboard'}
              style={{
                background: 'none', border: '1px solid #ccc', borderRadius: '8px',
                padding: '10px 24px', cursor: 'pointer', color: '#555'
              }}
            >
              Go to Dashboard
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
