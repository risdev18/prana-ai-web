import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error('VYRONIX crashed:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh', display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          background: 'linear-gradient(180deg, #070514 0%, #0B1020 100%)',
          padding: '24px', textAlign: 'center', fontFamily: 'sans-serif'
        }}>
          {/* Logo */}
          <div style={{
            width: '64px', height: '64px', borderRadius: '16px',
            background: 'linear-gradient(135deg, #7C5CFF 0%, #5DA9FF 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            marginBottom: '24px', fontSize: '28px',
            boxShadow: '0 8px 32px rgba(124,92,255,0.4)'
          }}>
            ⚡
          </div>

          <h1 style={{ color: '#F8F9FD', fontSize: '1.4rem', marginBottom: '10px', fontWeight: 700 }}>
            Something went wrong
          </h1>
          <p style={{ color: '#A5A6C2', fontSize: '14px', maxWidth: '320px', marginBottom: '32px', lineHeight: 1.6 }}>
            The app encountered an unexpected error. This is usually caused by a temporary network issue.
          </p>

          <button
            onClick={() => window.location.reload()}
            style={{
              padding: '14px 32px', borderRadius: '12px', border: 'none',
              background: 'linear-gradient(135deg, #7C5CFF 0%, #5DA9FF 100%)',
              color: '#fff', fontWeight: 700, fontSize: '15px', cursor: 'pointer',
              boxShadow: '0 4px 20px rgba(124,92,255,0.4)'
            }}
          >
            ↺ Reload App
          </button>

          {/* Error detail (dev only) */}
          {import.meta.env.DEV && this.state.error && (
            <pre style={{
              marginTop: '24px', padding: '12px', background: 'rgba(255,94,126,0.08)',
              border: '1px solid rgba(255,94,126,0.2)', borderRadius: '8px',
              color: '#FF5E7E', fontSize: '11px', textAlign: 'left',
              maxWidth: '480px', overflow: 'auto', whiteSpace: 'pre-wrap'
            }}>
              {this.state.error.toString()}
            </pre>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
