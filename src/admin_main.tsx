import './apiInterceptor.ts'
import React, { Component, ErrorInfo, ReactNode } from 'react'
import ReactDOM from 'react-dom/client'
import AdminApp from './AdminApp.tsx'
import './index.css'

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

class AdminErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("[AdminErrorBoundary] Error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-stone-100 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-lg border border-stone-200 text-center space-y-4">
            <h2 className="text-base font-bold text-stone-900">Console Administration — Miabé Asi</h2>
            <p className="text-xs text-stone-600">Une mise à jour a été appliquée. Veuillez recharger la page.</p>
            <button
              onClick={() => window.location.reload()}
              className="w-full py-2 bg-[#0B4D26] text-white font-bold rounded-xl text-xs uppercase"
            >
              Recharger la page
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AdminErrorBoundary>
      <AdminApp />
    </AdminErrorBoundary>
  </React.StrictMode>,
)

