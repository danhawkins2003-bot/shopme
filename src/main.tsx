import './apiInterceptor.ts'
import React, { Component, ErrorInfo, ReactNode } from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import { LanguageProvider } from './lib/i18n.tsx'
import { CountryProvider } from './context/CountryContext.tsx'
import './index.css'

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class RootErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("[RootErrorBoundary] Exception interceptée :", error, errorInfo);
  }

  handleReload = () => {
    try {
      if ("caches" in window) {
        caches.keys().then((keys) => keys.forEach((k) => caches.delete(k)));
      }
    } catch (e) {}
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-stone-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 sm:p-8 max-w-md w-full shadow-xl border border-stone-200 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-[#0B4D26] mx-auto flex items-center justify-center text-xl font-bold">
              🌿
            </div>
            <h2 className="text-lg font-black text-stone-900">Miabé Asi — Redémarrage rapide</h2>
            <p className="text-xs text-stone-600 leading-relaxed font-sans">
              Une mise à jour de l'application vient d'être déployée. Cliquez sur le bouton ci-dessous pour rafraîchir l'affichage en toute sécurité.
            </p>
            <button
              onClick={this.handleReload}
              className="w-full py-2.5 px-4 bg-[#0B4D26] hover:bg-[#0B4D26]/90 text-white font-bold rounded-xl text-xs uppercase tracking-wider shadow-sm transition-all cursor-pointer"
            >
              Rafraîchir l'application
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
    <RootErrorBoundary>
      <CountryProvider>
        <LanguageProvider>
          <App />
        </LanguageProvider>
      </CountryProvider>
    </RootErrorBoundary>
  </React.StrictMode>,
)


