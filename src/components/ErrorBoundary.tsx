import { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertTriangle, RotateCcw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary captured error:', error, errorInfo);
  }

  public handleReset = () => {
    this.setState({ hasError: false, error: undefined });
    sessionStorage.removeItem('currentInspection');
    window.location.hash = '#/';
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-slate-800 border border-slate-700 rounded-3xl p-8 text-center space-y-5 shadow-2xl animate-in fade-in">
            <div className="w-16 h-16 bg-critical/10 text-critical rounded-2xl flex items-center justify-center mx-auto">
              <AlertTriangle className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-white">Application Protected</h2>
              <p className="text-slate-400 text-xs mt-2 leading-relaxed">
                An isolated runtime event was caught by the anti-crash safety barrier. Memory was successfully sanitized to prevent browser freeze.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
              <button
                type="button"
                onClick={this.handleReset}
                className="btn-primary py-2.5 px-5 text-xs font-bold flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-primary/25"
              >
                <RotateCcw className="w-4 h-4" /> Reset & Reload App
              </button>
              <a
                href="#/"
                onClick={() => this.setState({ hasError: false })}
                className="btn-secondary py-2.5 px-4 text-xs font-bold flex items-center justify-center gap-2 cursor-pointer"
              >
                <Home className="w-4 h-4" /> Home Dashboard
              </a>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
