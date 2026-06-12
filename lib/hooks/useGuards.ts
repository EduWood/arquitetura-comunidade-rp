import { useAuth } from './useAuth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export function useMemberGuard() {
  const { logado, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !logado) {
      router.push('/login');
    }
  }, [logado, isLoading, router]);

  return { isLoading, logado };
}

export function useAdminGuard() {
  const { logado, isAdmin, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (!logado) {
        router.push('/login');
      } else if (!isAdmin) {
        router.push('/dashboard');
      }
    }
  }, [logado, isAdmin, isLoading, router]);

  return { isLoading, logado, isAdmin };
}
