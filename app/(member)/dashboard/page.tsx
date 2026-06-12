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
  const { usuario, loading, getAuthHeaders } = useAuth();
  const [dados, setDados] = useState<DashboardData | null>(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    if (loading) return;

    const fetchDashboard = async () => {
      try {
        const res = await fetch('/api/me/dashboard', {
          credentials: 'include',
          headers: getAuthHeaders(),
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
  }, [loading, getAuthHeaders]);

  if (loading || carregando) {
    return (
      <div className="min-h-screen flex items-center justify-center text-zinc-400">
        Carregando sua experiência...
      </div>
    );
  }

  if (!usuario || !dados) {
    return (
      <div className="min-h-screen flex items-center justify-center text-zinc-500">
        Erro ao carregar dashboard
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-zinc-950 to-black text-white p-6 space-y-10">

      {/* HERO */}
      <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-8 shadow-xl shadow-black/30">
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-transparent" />

        <div className="relative">
          <h1 className="text-3xl md:text-4xl font-bold">
            Bem-vindo de volta, <span className="text-emerald-400">{usuario.nome}</span>
          </h1>
          <p className="text-zinc-400 mt-2">
            Continue sua evolução dentro da Comunidade RP
          </p>

          <div className="mt-6 flex gap-3">
            <Button>
              Continuar estudando
            </Button>

            <Link href="/meus-cursos">
              <Button variant="ghost">
                Ver cursos
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">

        <Card className="bg-white/5 border-white/10 backdrop-blur-xl">
          <CardHeader className="flex flex-row justify-between pb-2">
            <CardTitle className="text-sm text-zinc-400">
              Cursos ativos
            </CardTitle>
            <BookOpen className="h-4 w-4 text-emerald-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dados.total_cursos}</div>
            <p className="text-xs text-zinc-500">
              {dados.cursos_concluidos} concluídos
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white/5 border-white/10 backdrop-blur-xl">
          <CardHeader className="flex flex-row justify-between pb-2">
            <CardTitle className="text-sm text-zinc-400">
              Progresso geral
            </CardTitle>
            <BarChart3 className="h-4 w-4 text-emerald-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dados.progresso_geral}%</div>

            <div className="w-full h-2 bg-white/10 rounded-full mt-2 overflow-hidden">
              <div
                className="h-full bg-emerald-400"
                style={{ width: `${dados.progresso_geral}%` }}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/5 border-white/10 backdrop-blur-xl">
          <CardHeader className="flex flex-row justify-between pb-2">
            <CardTitle className="text-sm text-zinc-400">
              Horas estudadas
            </CardTitle>
            <Clock className="h-4 w-4 text-emerald-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dados.horas_estudo}h</div>
            <p className="text-xs text-zinc-500">Últimos dias</p>
          </CardContent>
        </Card>

        <Card className="bg-white/5 border-white/10 backdrop-blur-xl">
          <CardHeader className="flex flex-row justify-between pb-2">
            <CardTitle className="text-sm text-zinc-400">
              Certificados
            </CardTitle>
            <Award className="h-4 w-4 text-emerald-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {dados.cursos_concluidos}
            </div>
            <p className="text-xs text-zinc-500">Conquistas</p>
          </CardContent>
        </Card>
      </div>

      {/* CURSOS */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Continuar aprendendo</h2>

          <Link href="/meus-cursos">
            <Button variant="outline">
              Ver todos
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

          {dados.ultimos_cursos.map((curso) => (
            <Card
              key={curso.id}
              className="bg-white/5 border-white/10 backdrop-blur-xl hover:border-emerald-500/30 transition group"
            >
              <div className="h-28 bg-gradient-to-r from-emerald-500/30 to-transparent rounded-t-2xl" />

              <CardHeader>
                <CardTitle className="line-clamp-1 group-hover:text-emerald-400 transition">
                  {curso.titulo}
                </CardTitle>
              </CardHeader>

              <CardContent className="space-y-3">
                <div>
                  <div className="flex justify-between text-xs text-zinc-400 mb-1">
                    <span>Progresso</span>
                    <span>{curso.progresso}%</span>
                  </div>

                  <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-400"
                      style={{ width: `${curso.progresso}%` }}
                    />
                  </div>
                </div>

                <Link href={`/meus-cursos/${curso.id}`}>
                  <Button className="w-full">
                    Continuar
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}

        </div>
      </div>
    </div>
  );
}