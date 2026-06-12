'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/lib/hooks/useAuth';
import { Download, Calendar } from 'lucide-react';

export default function DownloadsPage() {
  const router = useRouter();
  const { logado, loading: authLoading, getAuthHeaders } = useAuth();

  const [downloads, setDownloads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Aguarda auth carregar antes de redirecionar
    if (authLoading) return;

    if (!logado) {
      router.push('/login');
      return;
    }

    const carregarDownloads = async () => {
      try {
        const res = await fetch('/api/me/downloads', {
          headers: getAuthHeaders(),
        });
        const data = await res.json();
        if (data.success) {
          setDownloads(data.data || []);
        }
      } catch (err) {
        console.error('Erro ao carregar downloads:', err);
      } finally {
        setLoading(false);
      }
    };

    carregarDownloads();
  }, [logado, authLoading, router, getAuthHeaders]);

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Carregando downloads...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">Meus Downloads</h1>
        <p className="text-muted-foreground mb-6">Histórico de materiais baixados</p>

        {downloads.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center text-muted-foreground">
              <Download className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhum download registrado ainda</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {downloads.map((item) => (
              <Card key={item.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{item.titulo}</CardTitle>
                      <CardDescription>{item.descricao}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      {new Date(item.data_download).toLocaleDateString('pt-BR')}
                    </div>
                    <span>{item.tipo}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
