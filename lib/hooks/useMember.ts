import useSWR from 'swr';

const fetcher = (url: string) =>
  fetch(url, {
    credentials: 'include',
  }).then((res) => res.json());

export function useDashboard() {
  const { data, error, isLoading, mutate } = useSWR(
    '/api/me/dashboard',
    fetcher
  );

  return {
    dashboard: data?.data,
    isLoading,
    isError: !!error,
    error,
    mutate,
  };
}

export function useContinueWatching() {
  const { data, error, isLoading } = useSWR(
    '/api/me/continue-watching',
    fetcher
  );

  return {
    continueWatching: data?.data || [],
    isLoading,
    isError: !!error,
    error,
  };
}

export function useCertificates() {
  const { data, error, isLoading } = useSWR(
    '/api/certificates',
    fetcher
  );

  return {
    certificates: data?.data || [],
    isLoading,
    isError: !!error,
    error,
  };
}

export function useMateriais(cursoId?: string, aulaId?: string) {
  const path = cursoId && aulaId 
    ? `/api/materials?cursoId=${cursoId}&aulaId=${aulaId}`
    : cursoId
    ? `/api/materials?cursoId=${cursoId}`
    : '/api/materials';

  const { data, error, isLoading } = useSWR(path, fetcher);

  return {
    materiais: data?.data || [],
    isLoading,
    isError: !!error,
    error,
  };
}
