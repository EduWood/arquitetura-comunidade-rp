'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import type { Usuario } from '@/lib/types';

interface UseAuthReturn {
  usuario: Usuario | null;
  loading: boolean;
  logado: boolean;
  logout: () => Promise<void>;
  isAdmin: boolean;
  isAluno: boolean;
  isProfessor: boolean;
  getAuthHeaders: () => HeadersInit;
}

export function useAuth(): UseAuthReturn {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const getToken = () => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('accessToken');
  };

  const getAuthHeaders = useCallback((): HeadersInit => {
    const token = getToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  }, []);

  useEffect(() => {
    const verificarSessao = async () => {
      const token = getToken();

      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const res = await fetch('/api/auth/me', {
          credentials: 'include',
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.ok) {
          const data = await res.json();
          setUsuario(data.data);
        } else {
          // Token inválido ou expirado — limpar
          localStorage.removeItem('accessToken');
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
      const token = getToken();
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
    } catch (erro) {
      console.error('[useAuth] Erro ao logout:', erro);
    } finally {
      localStorage.removeItem('accessToken');
      setUsuario(null);
      router.push('/');
    }
  };

  return {
    usuario,
    loading,
    logado: !!usuario,
    logout,
    isAdmin: usuario?.role === 'ADMIN',
    isAluno: usuario?.role === 'ALUNO' || usuario?.role === 'MEMBRO',
    isProfessor: usuario?.role === 'PROFESSOR',
    getAuthHeaders,
  };
}

