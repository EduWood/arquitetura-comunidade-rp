'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/lib/hooks/useAuth';
import { ChevronLeft, ChevronRight, Download } from 'lucide-react';

export default function AssistirAulaPage() {
  const params = useParams();
  const router = useRouter();
  const { usuario, logado } = useAuth();
  const aulaId = params.id as string;

  const [aula, setAula] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [progresso, setProgresso] = useState(0);
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    if (!logado) {
      router.push('/login');
      return;
    }

    const carregarAula = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/lessons/${aulaId}`);
        if (!res.ok) throw new Error('Aula não encontrada');

        const data = await res.json();
        if (data.success) {
          setAula(data.data);
        }
      } catch (err: any) {
        setError(err.message || 'Erro ao carregar aula');
      } finally {
        setLoading(false);
      }
    };

    carregarAula();
  }, [aulaId, logado, router]);

  const handleMarcaConcluida = async () => {
    try {
      const res = await fetch(`/api/lessons/${aulaId}/complete`, {
        method: 'POST',
      });

      if (res.ok) {
        setCompleted(true);
      }
    } catch (err) {
      console.error('Erro ao marcar como concluída:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Carregando aula...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Erro</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={() => router.back()}>Voltar</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!aula) return null;

  return (
    <div className="min-h-screen bg-background p-4 md:p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <Button variant="ghost" onClick={() => router.back()} className="mb-4">
            <ChevronLeft className="mr-2 h-4 w-4" />
            Voltar
          </Button>
          <h1 className="text-3xl font-bold text-foreground">{aula.titulo}</h1>
          <p className="text-muted-foreground mt-2">{aula.descricao}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card className="overflow-hidden">
              <CardContent className="p-0">
                <div className="aspect-video bg-black flex items-center justify-center">
                  <div className="text-center text-white">
                    <p>Reprodutor de Vídeo</p>
                  </div>
                </div>

                <div className="p-4 bg-muted">
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-sm">
                      <p className="font-medium">Progresso: {Math.round(progresso)}%</p>
                      <div className="w-64 h-2 bg-background rounded mt-2">
                        <div
                          className="h-full bg-primary rounded transition-all"
                          style={{ width: `${progresso}%` }}
                        />
                      </div>
                    </div>
                    {!completed && (
                      <Button onClick={handleMarcaConcluida} className="ml-4">
                        Marcar Concluída
                      </Button>
                    )}
                    {completed && (
                      <div className="text-green-600 font-medium">✓ Concluída</div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Sobre esta aula</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">{aula.conteudo}</p>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Materiais</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">Nenhum material disponível</p>
              </CardContent>
            </Card>

            <Card className="mt-4">
              <CardHeader>
                <CardTitle className="text-lg">Navegação</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" className="w-full justify-start">
                  <ChevronLeft className="mr-2 h-4 w-4" />
                  Aula Anterior
                </Button>
                <Button variant="outline" className="w-full justify-end">
                  Próxima Aula
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
