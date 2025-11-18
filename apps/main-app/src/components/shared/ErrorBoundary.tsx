import { Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircle } from 'lucide-react';
import { Button } from '@thebazaar/ui/button';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error to console (in production, send to error monitoring service)
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    // TODO: Send to error monitoring service (Sentry, etc.)
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-netflix-black flex items-center justify-center p-4">
          <div className="max-w-md w-full text-center space-y-6">
            <div className="flex justify-center">
              <AlertCircle className="h-16 w-16 text-netflix-red" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white mb-2">
                Something went wrong
              </h1>
              <p className="text-gray-400 mb-4">
                We're sorry, but something unexpected happened. Please try again.
              </p>
              {this.state.error && process.env.NODE_ENV === 'development' && (
                <details className="mt-4 text-left bg-netflix-dark-gray p-4 rounded-lg">
                  <summary className="text-gray-400 cursor-pointer mb-2">
                    Error Details (Development Only)
                  </summary>
                  <pre className="text-xs text-red-400 overflow-auto">
                    {this.state.error.toString()}
                  </pre>
                </details>
              )}
            </div>
            <div className="flex gap-4 justify-center">
              <Button
                onClick={this.handleReset}
                className="bg-netflix-red hover:bg-netflix-red/90 text-white"
              >
                Return Home
              </Button>
              <Button
                variant="outline"
                onClick={() => window.location.reload()}
                className="border-netflix-medium-gray text-white hover:bg-netflix-medium-gray"
              >
                Reload Page
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

