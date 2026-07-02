/**
 * ErrorBoundary.jsx — React class error boundary
 *
 * Catches render errors in child components and shows ServerError.
 * Must be a class component — React hooks can't catch render errors.
 *
 * Usage:
 *   <ErrorBoundary>
 *     <ComponentThatMightCrash />
 *   </ErrorBoundary>
 *
 *   // With custom fallback:
 *   <ErrorBoundary fallback={<p>Something went wrong</p>}>
 *     ...
 *   </ErrorBoundary>
 */

import { Component } from 'react';
import ServerError from '../../pages/ServerError';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    // In production you would send this to an error tracking service
    if (import.meta.env.DEV) {
      console.error('[ErrorBoundary] Caught error:', error);
      console.error('[ErrorBoundary] Component stack:', info.componentStack);
    }
  }

  reset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;
      return (
        <ServerError
          error={this.state.error}
          reset={this.reset}
        />
      );
    }
    return this.props.children;
  }
}
