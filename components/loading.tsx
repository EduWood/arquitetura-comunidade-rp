export function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
    </div>
  );
}

export function LoadingPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <LoadingSpinner />
        <p className="mt-4 text-muted-foreground">Carregando...</p>
      </div>
    </div>
  );
}

export function LoadingSkeleton() {
  return (
    <div className="space-y-4">
      {[...Array(3)].map((_, i) => (
        <div
          key={i}
          className="h-20 bg-secondary/50 rounded-lg animate-pulse"
        ></div>
      ))}
    </div>
  );
}
