'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3, BookOpen, Award, Clock } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

interface DashboardData {
  nome: string;
  email: string;
  total_cursos: number;
  cursos_concluidos: number;
  progresso_geral: number;
  horas_estudo: number;
  ultimos_cursos: Array<{
    id: string;
    titulo: string;
    progresso: number;
    prox_aula?: string;
  }>;
}

export default function DashboardPage() {
  const { usuario, loading } = useAuth();
  const [dados, setDados] = useState<DashboardData | null>(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    if (loading) return;

    const fetchDashboard = async () => {
      try {
        const res = await fetch('/api/me/dashboard', {
          credentials: 'include',
        });
        const data = await res.json();
        if (data.success) {
          setDados(data.data);
        }
      } catch (erro) {
        console.error('[DashboardPage] Erro:', erro);
      } finally {
        setCarregando(false);
      }
    };

    fetchDashboard();
  }, [loading]);

  if (loading || carregando) {
    return (
      <div className="p-6 text-center">Carregando dashboard...</div>
    );
  }

  if (!usuario || !dados) {
    return (
      <div className="p-6 text-center text-muted-foreground">
        Erro ao carregar dashboard
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold mb-2">Bem-vindo de volta, {usuario.nome}!</h1>
        <p className="text-muted-foreground">
          Continue seu aprendizado com a Comunidade RP
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cursos em Progresso</CardTitle>
            <BookOpen className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dados.total_cursos}</div>
            <p className="text-xs text-muted-foreground">
              {dados.cursos_concluidos} concluídos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Progresso Geral</CardTitle>
            <BarChart3 className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dados.progresso_geral}%</div>
            <div className="w-full bg-muted rounded-full h-2 mt-2">
              <div
                className="bg-primary h-full rounded-full transition-all"
                style={{ width: `${dados.progresso_geral}%` }}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Horas de Estudo</CardTitle>
            <Clock className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dados.horas_estudo}h</div>
            <p className="text-xs text-muted-foreground">Esta semana</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Certificados</CardTitle>
            <Award className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dados.cursos_concluidos}</div>
            <p className="text-xs text-muted-foreground">Ganhos</p>
          </CardContent>
        </Card>
      </div>

      {/* Cursos Recentes */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Continuar Estudando</h2>
          <Link href="/meus-cursos">
            <Button variant="outline">Ver Todos</Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {dados.ultimos_cursos.map((curso) => (
            <Card key={curso.id} className="hover:shadow-lg transition cursor-pointer">
              <CardHeader>
                <div className="h-32 bg-gradient-to-r from-primary to-accent rounded-md mb-4" />
                <CardTitle className="line-clamp-1">{curso.titulo}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Progresso</span>
                    <span className="font-medium">{curso.progresso}%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className="bg-primary h-full rounded-full"
                      style={{ width: `${curso.progresso}%` }}
                    />
                  </div>
                </div>
                <Link href={`/meus-cursos/${curso.id}`}>
                  <Button className="w-full">Continuar</Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
