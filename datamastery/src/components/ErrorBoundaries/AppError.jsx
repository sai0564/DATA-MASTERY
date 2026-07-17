import { Component } from 'react';
import { Link } from 'react-router-dom';
import './AppError.css';

export class AppErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });
    console.error('AppErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="app-error-container">
          <div className="app-error-card">
            <span className="app-error-icon">⚠️</span>
            <h2>Something went wrong.</h2>
            <p className="app-error-msg">
              DataMastery encountered an unexpected error. Please refresh the page or return to the dashboard.
            </p>
            {this.state.error && (
              <details className="app-error-details">
                <summary>Developer Details</summary>
                <pre>{this.state.error.toString()}</pre>
                <pre>{this.state.errorInfo?.componentStack}</pre>
              </details>
            )}
            <div className="app-error-actions">
              <button className="app-error-btn" onClick={() => window.location.reload()}>
                Refresh Page
              </button>
              <Link to="/dashboard" className="app-error-btn app-error-btn--secondary">
                Go to Dashboard
              </Link>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
