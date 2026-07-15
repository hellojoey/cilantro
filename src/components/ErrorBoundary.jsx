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
        <div className="min-h-screen bg-canvas flex flex-col items-center justify-center px-6 text-center retint">
          <div className="max-w-sm w-full">
            <h1 className="text-4xl font-rounded font-bold tracking-tight text-deep mb-3 retint">cilantro</h1>
            <p className="text-sub mb-8">
              something went wrong — take a breath and try again
            </p>
            <button
              onClick={this.handleReload}
              className="w-full py-4 px-11 bg-deep text-canvas font-rounded font-semibold text-lg rounded-[18px] shadow-ledge transition-all hover:translate-y-[2px] hover:shadow-ledge-sm active:scale-[0.98] retint"
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
