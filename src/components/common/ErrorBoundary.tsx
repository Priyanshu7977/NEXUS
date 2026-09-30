import { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RotateCcw, Home, ChevronDown, ChevronUp } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  showDetails: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
    showDetails: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
      showDetails: false,
    };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[NEXUS Production ErrorBoundary Caught Error]:', error, errorInfo);
    this.setState({ errorInfo });
  }

  private handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      showDetails: false,
    });
  };

  private handleReload = () => {
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  };

  private handleGoHome = () => {
    if (typeof window !== 'undefined') {
      window.location.href = '/';
    }
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-[#F6F6F3] text-[#111318] flex items-center justify-center p-4 sm:p-6 antialiased font-sans">
          <div className="w-full max-w-lg bg-white border border-[#E5E5E2] rounded-3xl p-6 sm:p-8 shadow-xl space-y-6 text-left">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-[#111318]">Application View Error</h2>
                <p className="text-xs text-[#626873]">
                  An unexpected render exception was caught by NEXUS ErrorBoundary.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 text-xs text-[#626873] leading-relaxed">
              Your workspace data, local state, and API keys are protected. You can safely retry loading this component or navigate back to the home dashboard.
            </div>

            {/* Error Message Preview */}
            {this.state.error && (
              <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs font-mono break-words">
                {this.state.error.message || 'Unknown runtime error'}
              </div>
            )}

            {/* Technical Details Toggle */}
            {this.state.errorInfo && (
              <div>
                <button
                  type="button"
                  onClick={() => this.setState((prev) => ({ showDetails: !prev.showDetails }))}
                  className="flex items-center gap-1.5 text-xs text-[#626873] hover:text-[#111318] font-mono cursor-pointer"
                >
                  {this.state.showDetails ? (
                    <>
                      <ChevronUp className="w-3.5 h-3.5" />
                      <span>Hide stack trace</span>
                    </>
                  ) : (
                    <>
                      <ChevronDown className="w-3.5 h-3.5" />
                      <span>Show technical details</span>
                    </>
                  )}
                </button>

                {this.state.showDetails && (
                  <pre className="mt-2 p-3 bg-stone-900 text-stone-200 text-[11px] font-mono rounded-xl max-h-48 overflow-auto whitespace-pre-wrap">
                    {this.state.errorInfo.componentStack}
                  </pre>
                )}
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
              <button
                type="button"
                onClick={this.handleReset}
                className="w-full sm:flex-1 py-3 px-4 rounded-xl bg-[#6D4AFF] hover:bg-[#5B3CE8] text-white text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm active:scale-95"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Try Again</span>
              </button>

              <button
                type="button"
                onClick={this.handleReload}
                className="w-full sm:flex-1 py-3 px-4 rounded-xl bg-white border border-[#E5E5E2] hover:bg-stone-50 text-[#111318] text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <span>Reload Page</span>
              </button>

              <button
                type="button"
                onClick={this.handleGoHome}
                className="w-full sm:w-auto p-3 rounded-xl border border-[#E5E5E2] hover:bg-stone-50 text-[#626873] hover:text-[#111318] transition-all cursor-pointer"
                title="Return to Home"
              >
                <Home className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
