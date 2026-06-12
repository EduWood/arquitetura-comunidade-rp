import * as Sentry from '@sentry/nextjs';
import { useEffect } from 'react';

export function useSentryUser(userId?: string | null) {
  useEffect(() => {
    if (userId) {
      Sentry.setUser({
        id: userId,
      });
    } else {
      Sentry.setUser(null);
    }
  }, [userId]);
}

export function captureException(error: Error, context?: Record<string, any>) {
  Sentry.captureException(error, {
    contexts: {
      custom: context,
    },
  });
}

export function captureMessage(message: string, level: 'fatal' | 'error' | 'warning' | 'info' | 'debug' = 'info') {
  Sentry.captureMessage(message, level);
}
