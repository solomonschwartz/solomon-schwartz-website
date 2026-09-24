import React from 'react';

// Keeps one broken page (e.g. bad data from Firestore) from blanking the
// whole site. Give it a `resetKey` (like the current page) so navigating
// away clears the error.
export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null, resetKey: props.resetKey };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  static getDerivedStateFromProps(props, state) {
    if (props.resetKey !== state.resetKey) return { error: null, resetKey: props.resetKey };
    return null;
  }

  componentDidCatch(error, info) {
    console.error('Page crashed:', error, info?.componentStack);
  }

  render() {
    if (!this.state.error) return this.props.children;
    return (
      <div style={{ maxWidth: 760, margin: '0 auto', padding: '4rem 2rem', fontFamily: "'Inter', sans-serif" }}>
        <p style={{ fontSize: '1rem', fontWeight: 500, color: '#1a2e44', marginBottom: '0.5rem' }}>Something went wrong on this page.</p>
        <p style={{ fontSize: '0.9rem', color: '#4a6080', lineHeight: 1.7 }}>
          Try another page or refresh. {this.props.isAdmin ? `(Admin: ${this.state.error.message})` : ''}
        </p>
      </div>
    );
  }
}
