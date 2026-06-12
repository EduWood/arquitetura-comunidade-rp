'use client';

import { useEffect, useState } from 'react';
import { Button } from './ui/button';

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function ErrorBoundary({ children, fallback }: ErrorBoundaryProps) {
  const [hasError, setHasError] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const handler = (event: ErrorEvent) => {
      setHasError(true);
      setError(event.error);
    };

    window.addEventListener('error', handler);
    return () => window.removeEventListener('error', handler);
  }, []);

  if (hasError) {
    return (
      fallback || (
        <div className="min-h-screen flex items-center justify-center bg-background px-4">
          <div className="max-w-md text-center">
            <h1 className="text-4xl font-bold text-destructive mb-4">Oops!</h1>
            <p className="text-lg text-muted-foreground mb-6">
              Algo deu errado. Por favor, recarregue a página.
            </p>
            {error && (
              <pre className="bg-secondary/50 p-4 rounded-lg mb-6 text-xs overflow-auto">
                {error.message}
              </pre>
            )}
            <Button
              onClick={() => window.location.reload()}
              className="w-full"
            >
              Recarregar Página
            </Button>
          </div>
        </div>
      )
    );
  }

  return <>{children}</>;
}
