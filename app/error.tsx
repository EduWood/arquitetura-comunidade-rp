'use client'

import { useEffect } from 'react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('❌ Error caught by error boundary:', error)
    }
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="max-w-md w-full mx-4">
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
          <div className="text-6xl mb-4 text-center">⚠️</div>
          <h2 className="text-2xl font-bold text-white mb-4 text-center">
            Algo deu errado!
          </h2>
          <p className="text-gray-300 mb-6 text-center">
            Desculpe, ocorreu um erro inesperado. Tente novamente ou entre em contato com o suporte.
          </p>
          {process.env.NODE_ENV === 'development' && (
            <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 mb-6">
              <p className="text-red-200 text-sm font-mono break-all">
                {error.message}
              </p>
            </div>
          )}
          <div className="flex gap-4">
            <button
              onClick={reset}
              className="flex-1 bg-primary hover:bg-primary/90 text-white font-medium py-2 px-4 rounded-lg transition-colors"
            >
              Tentar Novamente
            </button>
            <a
              href="/"
              className="flex-1 bg-muted hover:bg-muted/80 text-foreground font-medium py-2 px-4 rounded-lg transition-colors text-center"
            >
              Voltar
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
