import {
  Users,
  GraduationCap,
  Award,
  TrendingUp,
  Activity,
  BookOpen,
} from "lucide-react";

import { Card } from "@/components/ui/card";

export default function AdminDashboard() {
  const stats = [
    {
      title: "Usuários",
      value: "2.451",
      description: "+12% este mês",
      icon: Users,
    },
    {
      title: "Cursos",
      value: "18",
      description: "3 novos publicados",
      icon: GraduationCap,
    },
    {
      title: "Matrículas",
      value: "764",
      description: "+27 esta semana",
      icon: TrendingUp,
    },
    {
      title: "Certificados",
      value: "432",
      description: "Emitidos",
      icon: Award,
    },
  ];

  return (
    <div className="space-y-10">

      {/* HERO (Stripe/Vercel style) */}
      <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-10 shadow-xl shadow-black/40">

        <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 via-transparent to-transparent" />
        <div className="absolute inset-0 opacity-40 bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.18),transparent_45%)]" />

        <div className="relative">
          <p className="text-sm text-emerald-400 font-medium">
            Admin / Overview
          </p>

          <h1 className="text-4xl md:text-5xl font-bold mt-2">
            Dashboard da Plataforma
          </h1>

          <p className="text-zinc-400 mt-3 text-lg max-w-2xl">
            Controle completo da Comunidade RP — usuários, cursos, matrículas e atividade em tempo real.
          </p>
        </div>
      </div>

      {/* STATS (Stripe cards style) */}
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">

        {stats.map((item) => {
          const Icon = item.icon;

          return (
            <Card
              key={item.title}
              className="
                relative
                overflow-hidden
                border-white/10
                bg-white/5
                backdrop-blur-xl
                p-6
                rounded-2xl
                transition-all
                hover:-translate-y-1
                hover:border-emerald-500/30
              "
            >
              <div className="flex items-start justify-between">

                <div>
                  <p className="text-zinc-400 text-sm">
                    {item.title}
                  </p>

                  <h2 className="text-3xl font-bold mt-2 text-white">
                    {item.value}
                  </h2>

                  <p className="text-emerald-400 text-sm mt-2">
                    {item.description}
                  </p>
                </div>

                <div className="h-12 w-12 rounded-xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                  <Icon className="h-6 w-6 text-emerald-400" />
                </div>

              </div>
            </Card>
          );
        })}
      </div>

      {/* LOWER GRID (more SaaS style spacing) */}
      <div className="grid gap-6 lg:grid-cols-2">

        {/* ENROLLMENTS */}
        <Card className="p-6 border-white/10 bg-white/5 backdrop-blur-xl rounded-2xl">

          <div className="flex items-center gap-3 mb-6">
            <BookOpen className="h-5 w-5 text-emerald-400" />

            <h3 className="text-lg font-semibold">
              Últimas matrículas
            </h3>
          </div>

          <div className="space-y-3">

            {[
              {
                nome: "João Silva",
                curso: "Curso Revit Completo",
              },
              {
                nome: "Maria Souza",
                curso: "AutoCAD Profissional",
              },
              {
                nome: "Carlos Santos",
                curso: "SketchUp Avançado",
              },
            ].map((item) => (
              <div
                key={item.nome}
                className="flex items-center justify-between rounded-xl border border-white/10 bg-black/20 p-4 hover:border-emerald-500/20 transition"
              >
                <div>
                  <p className="font-medium text-white">
                    {item.nome}
                  </p>

                  <p className="text-sm text-zinc-400">
                    {item.curso}
                  </p>
                </div>

                <span className="text-xs bg-emerald-500/10 text-emerald-400 px-3 py-1 rounded-full border border-emerald-500/20">
                  Novo
                </span>
              </div>
            ))}

          </div>
        </Card>

        {/* ACTIVITY */}
        <Card className="p-6 border-white/10 bg-white/5 backdrop-blur-xl rounded-2xl">

          <div className="flex items-center gap-3 mb-6">
            <Activity className="h-5 w-5 text-emerald-400" />

            <h3 className="text-lg font-semibold">
              Atividade recente
            </h3>
          </div>

          <div className="space-y-3">

            {[
              "Novo curso publicado",
              "Certificado emitido",
              "Usuário cadastrado",
              "Backup realizado",
            ].map((item) => (
              <div
                key={item}
                className="flex items-center gap-3 rounded-xl border border-white/10 bg-black/20 p-4"
              >
                <div className="h-2 w-2 rounded-full bg-emerald-400" />

                <span className="text-zinc-300">
                  {item}
                </span>
              </div>
            ))}

          </div>
        </Card>

      </div>
    </div>
  );
}