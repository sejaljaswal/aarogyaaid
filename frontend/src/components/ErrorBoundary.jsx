import React from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center p-12 bg-red-50 rounded-[2.5rem] border border-red-100 text-center space-y-6">
          <div className="p-4 bg-red-100 rounded-full text-red-600">
            <AlertTriangle size={48} />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-black text-gray-900">Something went wrong</h2>
            <p className="text-gray-600 max-w-sm mx-auto">We encountered an error while trying to load this part of the interface.</p>
          </div>
          <button 
            onClick={() => window.location.reload()}
            className="flex items-center space-x-2 px-6 py-3 bg-red-600 text-white font-bold rounded-2xl hover:bg-red-700 transition active:scale-95 shadow-lg shadow-red-200"
          >
            <RotateCcw size={18} />
            <span>Try Again</span>
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
