// Port of app/error.tsx (Next's per-route error boundary) as a plain React
// class error boundary — React has no functional error-boundary hook.
import { Component, type ReactNode } from "react";

type Props = { children: ReactNode };
type State = { error: Error | null };

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  componentDidCatch(error: Error) {
    console.error(error);
  }

  render() {
    const { error } = this.state;
    if (!error) return this.props.children;

    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-neutral-100 p-4 text-center">
        <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Something went wrong!</h2>
          <div className="bg-red-50 p-4 rounded-lg mb-6 text-left overflow-auto max-h-48 scrollbar-thin">
            <p className="font-mono text-xs text-red-800 break-words whitespace-pre-wrap">
              {error.message || "Unknown client-side error"}
            </p>
            {error.stack && (
              <pre className="font-mono text-[10px] text-red-700 mt-2 whitespace-pre-wrap border-t border-red-200 pt-2">
                {error.stack}
              </pre>
            )}
          </div>
          <button
            onClick={() => this.setState({ error: null })}
            className="bg-[#111827] text-white px-6 py-2 rounded-lg font-semibold hover:bg-[#1f2937] transition"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }
}
