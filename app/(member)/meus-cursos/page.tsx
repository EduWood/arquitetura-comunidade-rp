'use client';

import { useMeusCursos } from '@/lib/hooks/useCursos';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function MeusCursosPage() {
  const { cursos, isLoading } = useMeusCursos();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold">Meus Cursos</h1>
        <p className="text-muted-foreground mt-2">
          Continue seus estudos de onde parou
        </p>
      </div>

      {isLoading ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Carregando cursos...</p>
        </div>
      ) : cursos.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-muted-foreground mb-4">
              Você ainda não está inscrito em nenhum curso
            </p>
            <Link href="/cursos">
              <Button>Explorar Cursos</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cursos.map((curso: any) => (
            <Card key={curso.id} className="overflow-hidden hover:shadow-lg transition">
              <div className="bg-gradient-to-br from-primary/20 to-secondary/20 h-32"></div>
              <CardHeader>
                <CardTitle className="line-clamp-2">{curso.titulo}</CardTitle>
                <CardDescription className="line-clamp-2">
                  {curso.descricao}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium">Progresso</span>
                      <span className="text-sm text-muted-foreground">
                        {Math.round(curso.progresso_pct || 0)}%
                      </span>
                    </div>
                    <div className="w-full bg-secondary/20 rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full transition-all"
                        style={{
                          width: `${Math.round(curso.progresso_pct || 0)}%`,
                        }}
                      ></div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Link href={`/meus-cursos/${curso.id}`} className="flex-1">
                      <Button variant="outline" className="w-full">
                        Continuar
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
