'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Usuario, SessaoJWT } from '@/lib/types';

interface UseAuthReturn {
  usuario: Usuario | null;
  loading: boolean;
  logado: boolean;
  logout: () => Promise<void>;
  isAdmin: boolean;
  isAluno: boolean;
  isProfessor: boolean;
}

export function useAuth(): UseAuthReturn {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const verificarSessao = async () => {
      try {
        const res = await fetch('/api/auth/me', {
          credentials: 'include',
        });

        if (res.ok) {
          const data = await res.json();
          setUsuario(data.data);
        } else {
          setUsuario(null);
        }
      } catch (erro) {
        console.error('[useAuth] Erro:', erro);
        setUsuario(null);
      } finally {
        setLoading(false);
      }
    };

    verificarSessao();
  }, []);

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
      setUsuario(null);
      router.push('/');
    } catch (erro) {
      console.error('[useAuth] Erro ao logout:', erro);
    }
  };

  return {
    usuario,
    loading,
    logado: !!usuario,
    logout,
    isAdmin: usuario?.role === 'ADMIN',
    isAluno: usuario?.role === 'ALUNO',
    isProfessor: usuario?.role === 'PROFESSOR',
  };
}
