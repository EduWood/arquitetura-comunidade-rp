'use client';

import { ReactNode, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';

export function AdminAuthWrapper({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { usuario, loading, isAdmin } = useAuth();

  useEffect(() => {
    if (!loading && (!usuario || !isAdmin)) {
      router.push('/');
    }
  }, [loading, usuario, isAdmin, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return <>{children}</>;
}
