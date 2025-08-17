import React from "react";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error("Global ErrorBoundary caught:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen w-full bg-gradient-to-br from-red-50 to-white flex flex-col items-center justify-center px-6 py-10 text-center">
          <i className="bi bi-emoji-frown text-danger text-7xl mb-4 animate-bounce"></i>
          <h1 className="text-5xl font-extrabold text-red-600 mb-3">Something Went Wrong</h1>
          <p className="text-lg text-gray-700 mb-6 max-w-xl">
            {this.state.error?.message || "An unexpected error occurred. Please try again later."}
          </p>

          <a
            href="/"
            className="btn btn-primary text-dark text-lg px-5 py-2 rounded-lg shadow hover:shadow-lg transition-all flex items-center gap-2"
          >
            <i className="bi bi-house-door-fill"></i>
            Go Home
          </a>

          {/* Dev-only error details */}
          {import.meta.env.DEV && (
            <div className="mt-8 bg-white border border-red-200 text-left p-4 rounded w-full max-w-2xl shadow-inner text-sm text-red-600 overflow-auto">
              <strong>Error Stack:</strong>
              <pre className="whitespace-pre-wrap mt-2">{this.state.error?.stack}</pre>
            </div>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
