import React from 'react';

// Top-level error boundary: catches render/lifecycle errors anywhere below it
// in the tree and shows a calm full-screen fallback instead of a blank page.
export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Cilantro crashed:', error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gradient-to-b from-stone-50 to-amber-50 dark:from-stone-900 dark:to-stone-800 flex flex-col items-center justify-center px-6 text-center">
          <div className="max-w-sm w-full">
            <h1 className="text-4xl font-light tracking-wide text-stone-600 dark:text-stone-300 mb-3">cilantro</h1>
            <p className="text-stone-500 dark:text-stone-400 font-light mb-8">
              something went wrong — take a breath and try again
            </p>
            <button
              onClick={this.handleReload}
              className="w-full py-4 bg-stone-700 hover:bg-stone-800 dark:bg-stone-600 dark:hover:bg-stone-500 text-white rounded-2xl font-light text-lg transition-all shadow-sm active:scale-[0.98]"
            >
              reload
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
