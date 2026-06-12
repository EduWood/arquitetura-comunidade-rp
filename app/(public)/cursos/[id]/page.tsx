'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Star, Users, Clock, BookOpen } from 'lucide-react';
import Link from 'next/link';
import type { Curso, Modulo, Aula } from '@/lib/types';

interface CursoDetalhado extends Curso {
  modulos: (Modulo & { aulas: Aula[] })[];
}

export default function CursoDetalhePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { usuario, logado } = useAuth();
  const [cursoId, setCursoId] = useState<string | null>(null);
  const [curso, setCurso] = useState<CursoDetalhado | null>(null);
  const [loading, setLoading] = useState(true);
  const [matriculado, setMatriculado] = useState(false);

  useEffect(() => {
    params.then(({ id }) => setCursoId(id));
  }, [params]);

  useEffect(() => {
    if (!cursoId) return;

    const fetchCurso = async () => {
      try {
        const res = await fetch(`/api/courses/${cursoId}`);
        const data = await res.json();
        if (data.success) {
          setCurso(data.data);
          // Verificar matrícula
          if (logado) {
            const acessoRes = await fetch(
              `/api/courses/${cursoId}/access`,
              { credentials: 'include' }
            );
            const acessoData = await acessoRes.json();
            setMatriculado(acessoData.data?.pode_acessar || false);
          }
        }
      } catch (erro) {
        console.error('[CursoDetalhePage] Erro:', erro);
      } finally {
        setLoading(false);
      }
    };

    fetchCurso();
  }, [cursoId, logado]);

  const handleMatricular = async () => {
    if (!logado) {
      window.location.href = '/login';
      return;
    }

    try {
      const res = await fetch(`/api/courses/${cursoId}/enroll`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      });

      if (res.ok) {
        setMatriculado(true);
        alert('Matriculado com sucesso!');
      }
    } catch (erro) {
      console.error('[handleMatricular] Erro:', erro);
      alert('Erro ao matricular');
    }
  };

  if (loading || !curso) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 text-center">
        Carregando...
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Conteúdo Principal */}
        <div className="lg:col-span-2">
          {/* Header */}
          <div className="mb-8">
            <div className="h-96 bg-gradient-to-r from-primary to-accent rounded-lg mb-6" />
            <h1 className="text-4xl font-bold mb-4">{curso.titulo}</h1>
            <p className="text-lg text-muted-foreground mb-6">{curso.descricao}</p>

            <div className="flex flex-wrap gap-6 mb-8">
              <div className="flex items-center gap-2">
                <Star className="h-5 w-5 fill-primary text-primary" />
                <span className="font-medium">{curso.rating} ({curso.alunos_total} alunos)</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" />
                <span className="font-medium">~40 horas</span>
              </div>
              <div className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-primary" />
                <span className="font-medium">{curso.modulos.length} módulos</span>
              </div>
            </div>
          </div>

          {/* Módulos */}
          <div>
            <h2 className="text-2xl font-bold mb-6">Conteúdo do Curso</h2>
            <div className="space-y-4">
              {curso.modulos.map((modulo) => (
                <Card key={modulo.id}>
                  <CardHeader>
                    <CardTitle className="text-lg">
                      Módulo {modulo.ordem}: {modulo.titulo}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {modulo.aulas.map((aula) => (
                        <li key={aula.id} className="flex items-center gap-3 text-sm">
                          <span className="text-primary">▶</span>
                          <span>{aula.titulo}</span>
                          {aula.duracao_minutos && (
                            <span className="text-xs text-muted-foreground ml-auto">
                              {aula.duracao_minutos} min
                            </span>
                          )}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar - CTA */}
        <div className="lg:col-span-1">
          <Card className="sticky top-24">
            <CardHeader>
              <div className="text-3xl font-bold text-primary mb-4">
                {curso.preco === 0 ? 'Grátis' : `R$ ${curso.preco}`}
              </div>
              <Button
                size="lg"
                className="w-full"
                onClick={handleMatricular}
                disabled={matriculado}
              >
                {matriculado ? 'Já Matriculado' : 'Matricular Agora'}
              </Button>
              {matriculado && (
                <Link href={`/dashboard/cursos/${curso.id}`} className="w-full">
                  <Button variant="outline" size="lg" className="w-full mt-2">
                    Ir para o Curso
                  </Button>
                </Link>
              )}
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div>
                <p className="font-semibold mb-2">Nível</p>
                <p className="text-muted-foreground capitalize">{curso.nivel.toLowerCase()}</p>
              </div>
              <div>
                <p className="font-semibold mb-2">Categoria</p>
                <p className="text-muted-foreground">{curso.categoria}</p>
              </div>
              <div>
                <p className="font-semibold mb-2">Incluído</p>
                <ul className="text-muted-foreground space-y-1">
                  <li>✓ Acesso vitalício</li>
                  <li>✓ Certificado ao final</li>
                  <li>✓ Materiais em PDF</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
