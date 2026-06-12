import { useAuth } from './useAuth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export function useMemberGuard() {
  const { logado } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!logado) {
      router.push('/login');
    }
  }, [logado, router]);

  return { logado };
}

export function useAdminGuard() {
  const { logado, isAdmin } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!logado) {
      router.push('/login');
    } else if (!isAdmin) {
      router.push('/dashboard');
    }
  }, [logado, isAdmin, router]);

  return { logado, isAdmin };
}
