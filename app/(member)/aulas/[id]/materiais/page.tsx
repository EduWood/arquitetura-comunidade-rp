'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/lib/hooks/useAuth';
import { Download, FileText, AlertCircle } from 'lucide-react';

export default function MateriaisAulaPage() {
  const params = useParams();
  const router = useRouter();
  const { logado } = useAuth();
  const aulaId = params.id as string;

  const [materiais, setMateriais] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!logado) {
      router.push('/login');
      return;
    }

    const carregarMateriais = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/materials?aulaId=${aulaId}`);
        if (!res.ok) throw new Error('Erro ao carregar materiais');

        const data = await res.json();
        if (data.success) {
          setMateriais(data.data || []);
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    carregarMateriais();
  }, [aulaId, logado, router]);

  const handleDownload = async (materialId: string) => {
    try {
      const res = await fetch(`/api/materials/${materialId}?action=download`, {
        method: 'GET',
      });

      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `material-${materialId}`;
        a.click();
        window.URL.revokeObjectURL(url);
      }
    } catch (err) {
      console.error('Erro ao baixar material:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Carregando materiais...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Button variant="ghost" onClick={() => router.back()} className="mb-4">
            Voltar
          </Button>
          <h1 className="text-3xl font-bold">Materiais da Aula</h1>
          <p className="text-muted-foreground mt-2">Baixe os materiais complementares da aula</p>
        </div>

        {error && (
          <Card className="mb-6 border-red-200">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 text-red-600">
                <AlertCircle className="h-5 w-5" />
                <span>{error}</span>
              </div>
            </CardContent>
          </Card>
        )}

        {materiais.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhum material disponível para esta aula</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {materiais.map((material) => (
              <Card key={material.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{material.titulo}</CardTitle>
                      <CardDescription>{material.descricao}</CardDescription>
                    </div>
                    <FileText className="h-6 w-6 text-muted-foreground flex-shrink-0 ml-4" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">
                      {material.tipo} • {material.tamanho || 'Tamanho desconhecido'}
                    </div>
                    <Button
                      onClick={() => handleDownload(material.id)}
                      className="flex items-center gap-2"
                    >
                      <Download className="h-4 w-4" />
                      Baixar
                    </Button>
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
