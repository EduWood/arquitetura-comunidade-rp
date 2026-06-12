'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/lib/hooks/useAuth';
import { Download, Share2 } from 'lucide-react';

export default function CertificadoPage() {
  const params = useParams();
  const router = useRouter();
  const { logado } = useAuth();
  const certificadoId = params.id as string;

  const [certificado, setCertificado] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!logado) {
      router.push('/login');
      return;
    }

    const carregarCertificado = async () => {
      try {
        const res = await fetch(`/api/certificates/${certificadoId}`);
        const data = await res.json();
        if (data.success) {
          setCertificado(data.data);
        }
      } catch (err) {
        console.error('Erro ao carregar certificado:', err);
      } finally {
        setLoading(false);
      }
    };

    carregarCertificado();
  }, [certificadoId, logado, router]);

  const handleDownloadPDF = async () => {
    try {
      const res = await fetch(`/api/certificates/${certificadoId}?format=pdf`);
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `certificado-${certificado?.numero_serie}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Erro ao baixar certificado:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Carregando certificado...</p>
        </div>
      </div>
    );
  }

  if (!certificado) return null;

  return (
    <div className="min-h-screen bg-background p-4 md:p-6">
      <div className="max-w-4xl mx-auto">
        <Button variant="ghost" onClick={() => router.back()} className="mb-6">
          Voltar
        </Button>

        {/* Simulação de Certificado */}
        <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
          <CardContent className="p-12 text-center">
            <div className="mb-8">
              <h1 className="text-4xl font-bold text-foreground mb-2">CERTIFICADO</h1>
              <p className="text-muted-foreground">de Conclusão de Curso</p>
            </div>

            <div className="space-y-4 mb-8">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Certificamos que</p>
                <p className="text-2xl font-bold text-foreground">{certificado.nome_aluno}</p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground mb-1">completou com sucesso o curso</p>
                <p className="text-xl font-semibold text-primary">{certificado.nome_curso}</p>
              </div>

              <div className="pt-4 border-t border-muted">
                <p className="text-sm text-muted-foreground mb-2">Data de Conclusão</p>
                <p className="text-lg font-medium">
                  {new Date(certificado.data_conclusao).toLocaleDateString('pt-BR', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </div>

              <div className="pt-4">
                <p className="text-xs text-muted-foreground">Número de Série</p>
                <p className="text-sm font-mono text-muted-foreground">{certificado.numero_serie}</p>
              </div>
            </div>

            <div className="flex gap-4 justify-center">
              <Button onClick={handleDownloadPDF} className="flex items-center gap-2">
                <Download className="h-4 w-4" />
                Baixar PDF
              </Button>
              <Button variant="outline" className="flex items-center gap-2">
                <Share2 className="h-4 w-4" />
                Compartilhar
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Detalhes */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Detalhes do Certificado</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Carga Horária</p>
                <p className="font-medium">{certificado.carga_horaria} horas</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                <p className="font-medium text-green-600">Validado</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
