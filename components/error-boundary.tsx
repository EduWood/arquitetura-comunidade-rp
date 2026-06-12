'use client';

import { useEffect, useState } from 'react';
import { Button } from './ui/button';
import * as Sentry from '@sentry/nextjs';

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function ErrorBoundary({ children, fallback }: ErrorBoundaryProps) {
  const [hasError, setHasError] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [errorId, setErrorId] = useState<string>('');

  useEffect(() => {
    const handler = (event: ErrorEvent) => {
      setHasError(true);
      setError(event.error);

      // Capture to Sentry
      const eventId = Sentry.captureException(event.error, {
        contexts: {
          errorBoundary: {
            message: event.message,
            filename: event.filename,
            lineno: event.lineno,
            colno: event.colno,
          },
        },
        level: 'error',
      });
      setErrorId(eventId || '');
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
            <p className="text-lg text-muted-foreground mb-2">
              Algo deu errado. Nosso time foi notificado.
            </p>
            {errorId && (
              <p className="text-sm text-muted-foreground mb-6">
                ID: <code className="font-mono">{errorId}</code>
              </p>
            )}
            {error && process.env.NODE_ENV === 'development' && (
              <pre className="bg-secondary/50 p-4 rounded-lg mb-6 text-xs overflow-auto text-left">
                {error.message}
              </pre>
            )}
            <div className="space-y-2">
              <Button
                onClick={() => window.location.reload()}
                className="w-full"
              >
                Recarregar Página
              </Button>
              <Button
                variant="outline"
                onClick={() => window.location.href = '/'}
                className="w-full"
              >
                Voltar ao Início
              </Button>
            </div>
          </div>
        </div>
      )
    );
  }

  return <>{children}</>;
}
