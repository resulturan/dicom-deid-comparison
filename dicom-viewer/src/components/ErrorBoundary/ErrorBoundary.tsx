/**
 * Error Boundary Component
 * Catches and handles React component errors gracefully
 */

import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';
import { Result, Button } from 'antd';
import { WarningOutlined } from '@ant-design/icons';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log error details
    console.error('ErrorBoundary caught an error:', error, errorInfo);

    this.setState({
      error,
      errorInfo,
    });

    // You can also log to an error reporting service here
    // Example: logErrorToService(error, errorInfo);
  }

  handleReset = (): void => {
    // Reset error state
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  handleReload = (): void => {
    // Reload the page
    window.location.reload();
  };

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div
          style={{
            height: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#f0f2f5',
            padding: '24px',
          }}
        >
          <Result
            status="error"
            icon={<WarningOutlined />}
            title="Something went wrong"
            subTitle="An unexpected error occurred. Please try reloading the application."
            extra={[
              <Button type="primary" key="reload" onClick={this.handleReload}>
                Reload Application
              </Button>,
              <Button key="reset" onClick={this.handleReset}>
                Try Again
              </Button>,
            ]}
          >
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <div
                style={{
                  textAlign: 'left',
                  marginTop: 24,
                  padding: 16,
                  background: '#fff',
                  border: '1px solid #d9d9d9',
                  borderRadius: 4,
                  maxWidth: 800,
                  overflow: 'auto',
                }}
              >
                <details style={{ whiteSpace: 'pre-wrap', fontSize: 12, fontFamily: 'monospace' }}>
                  <summary style={{ cursor: 'pointer', fontWeight: 600, marginBottom: 8 }}>
                    Error Details (Development Only)
                  </summary>
                  <div style={{ marginTop: 8, color: '#cf1322' }}>
                    <strong>Error:</strong> {this.state.error.toString()}
                  </div>
                  {this.state.errorInfo && (
                    <div style={{ marginTop: 8 }}>
                      <strong>Component Stack:</strong>
                      <pre style={{ marginTop: 4, fontSize: 11, color: '#595959' }}>
                        {this.state.errorInfo.componentStack}
                      </pre>
                    </div>
                  )}
                  {this.state.error.stack && (
                    <div style={{ marginTop: 8 }}>
                      <strong>Stack Trace:</strong>
                      <pre style={{ marginTop: 4, fontSize: 11, color: '#595959' }}>
                        {this.state.error.stack}
                      </pre>
                    </div>
                  )}
                </details>
              </div>
            )}
          </Result>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
