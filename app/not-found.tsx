export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="max-w-md w-full mx-4">
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 text-center">
          <div className="text-6xl mb-4">404</div>
          <h2 className="text-2xl font-bold text-white mb-4">
            Página não encontrada
          </h2>
          <p className="text-gray-300 mb-6">
            Desculpe, a página que você procura não existe ou foi removida.
          </p>
          <div className="flex gap-4">
            <a
              href="/"
              className="flex-1 bg-primary hover:bg-primary/90 text-white font-medium py-2 px-4 rounded-lg transition-colors text-center"
            >
              Voltar para Home
            </a>
            <a
              href="/login"
              className="flex-1 bg-muted hover:bg-muted/80 text-foreground font-medium py-2 px-4 rounded-lg transition-colors text-center"
            >
              Fazer Login
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
