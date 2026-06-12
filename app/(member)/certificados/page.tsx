'use client';

import { useCertificates } from '@/lib/hooks/useMember';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';

export default function CertificadosPage() {
  const { certificates, isLoading } = useCertificates();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold">Certificados</h1>
        <p className="text-muted-foreground mt-2">
          Seus certificados de conclusão
        </p>
      </div>

      {isLoading ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Carregando certificados...</p>
        </div>
      ) : certificates.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-muted-foreground mb-4">
              Você ainda não tem certificados
            </p>
            <p className="text-sm text-muted-foreground">
              Complete 100% de um curso para receber seu certificado
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {certificates.map((cert: any) => (
            <Card key={cert.id} className="overflow-hidden">
              <div className="bg-gradient-to-br from-amber-500/20 to-yellow-500/20 p-6 min-h-48 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-4xl mb-2">🏆</div>
                  <h3 className="font-bold">{cert.nome_curso}</h3>
                  <p className="text-sm text-muted-foreground">
                    Concluído em {new Date(cert.data_emissao).toLocaleDateString('pt-BR')}
                  </p>
                </div>
              </div>
              <CardHeader>
                <CardTitle className="text-lg">Certificado #{cert.numero_serie}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Número de verificação: {cert.numero_serie}
                  </p>
                  <Button className="w-full" variant="outline">
                    Baixar PDF
                  </Button>
                  <Button className="w-full" variant="ghost">
                    Ver Detalhes
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
