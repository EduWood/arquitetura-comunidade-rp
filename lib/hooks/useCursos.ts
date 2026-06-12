import useSWR from 'swr';
import { Curso } from '@/lib/types';

const fetcher = (url: string) =>
  fetch(url, {
    credentials: 'include',
  }).then((res) => res.json());

export function useCursos(filtros?: { categoria?: string; nivel?: string }) {
  const params = new URLSearchParams();
  if (filtros?.categoria) params.append('categoria', filtros.categoria);
  if (filtros?.nivel) params.append('nivel', filtros.nivel);

  const { data, error, isLoading } = useSWR(
    `/api/courses?${params.toString()}`,
    fetcher
  );

  return {
    cursos: data?.data || [],
    isLoading,
    isError: !!error,
    error,
  };
}

export function useCurso(id: string) {
  const { data, error, isLoading } = useSWR(
    `/api/courses/${id}`,
    fetcher
  );

  return {
    curso: data?.data,
    isLoading,
    isError: !!error,
    error,
  };
}

export function useMeusCursos() {
  const { data, error, isLoading } = useSWR(
    '/api/me/courses',
    fetcher
  );

  return {
    cursos: data?.data || [],
    isLoading,
    isError: !!error,
    error,
  };
}

export function useCursoProgress(cursoId: string) {
  const { data, error, isLoading, mutate } = useSWR(
    `/api/courses/${cursoId}/progress`,
    fetcher
  );

  return {
    progress: data?.data,
    isLoading,
    isError: !!error,
    error,
    mutate,
  };
}
