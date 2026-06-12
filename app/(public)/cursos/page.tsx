'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Star, Users, Clock } from 'lucide-react';
import type { Curso } from '@/lib/types';

interface CursosResponse {
  success: boolean;
  data: Curso[];
}

export default function CursosPage() {
  const [cursos, setCursos] = useState<Curso[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState('');

  useEffect(() => {
    const fetchCursos = async () => {
      try {
        const res = await fetch('/api/courses?publicado=true');
        const data: CursosResponse = await res.json();
        if (data.success) {
          setCursos(data.data);
        }
      } catch (erro) {
        console.error('[CursosPage] Erro:', erro);
      } finally {
        setLoading(false);
      }
    };

    fetchCursos();
  }, []);

  const cursosFiltrados = cursos.filter(
    (curso) =>
      curso.titulo.toLowerCase().includes(filtro.toLowerCase()) ||
      curso.descricao.toLowerCase().includes(filtro.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-12">
        <h1 className="text-4xl font-bold mb-4">Nossos Cursos</h1>
        <p className="text-lg text-muted-foreground mb-8">
          Escolha entre {cursos.length} cursos para elevar suas habilidades
        </p>

        {/* Filtro */}
        <div className="flex gap-4">
          <input
            type="text"
            placeholder="Buscar cursos..."
            value={filtro}
            onChange={(e) => setFiltro(e.target.value)}
            className="flex-1 px-4 py-2 rounded-lg border border-border bg-background"
          />
          <Button variant="outline">Filtros</Button>
        </div>
      </div>

      {/* Cursos Grid */}
      {loading ? (
        <div className="text-center py-12">Carregando cursos...</div>
      ) : cursosFiltrados.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Nenhum curso encontrado</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cursosFiltrados.map((curso) => (
            <Link key={curso.id} href={`/cursos/${curso.id}`}>
              <Card className="h-full hover:shadow-lg transition cursor-pointer">
                <CardHeader>
                  <div className="h-40 bg-gradient-to-r from-primary to-accent rounded-md mb-4" />
                  <CardTitle className="line-clamp-2">{curso.titulo}</CardTitle>
                  <CardDescription className="line-clamp-2">
                    {curso.descricao}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-primary text-primary" />
                      <span className="text-sm font-medium">{curso.rating}</span>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {curso.alunos_total} alunos
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
                      {curso.nivel}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      ~40h
                    </span>
                  </div>

                  <div className="pt-4 border-t border-border">
                    <p className="text-lg font-bold text-primary">
                      {curso.preco === 0 ? 'Grátis' : `R$ ${curso.preco}`}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
