'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';

interface Stats {
  total_usuarios: number;
  total_cursos: number;
  total_modulos: number;
  total_aulas: number;
  total_matriculas: number;
}

export function AdminDashboardContent() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Simular dados de exemplo
        setStats({
          total_usuarios: 156,
          total_cursos: 12,
          total_modulos: 48,
          total_aulas: 324,
          total_matriculas: 892,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return <div className="text-center py-8">Carregando...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
        <p className="text-muted-foreground">Bem-vindo ao painel administrativo</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card className="p-6">
          <div className="text-sm font-medium text-muted-foreground">Usuários</div>
          <div className="text-3xl font-bold mt-2">{stats?.total_usuarios || 0}</div>
        </Card>

        <Card className="p-6">
          <div className="text-sm font-medium text-muted-foreground">Cursos</div>
          <div className="text-3xl font-bold mt-2">{stats?.total_cursos || 0}</div>
        </Card>

        <Card className="p-6">
          <div className="text-sm font-medium text-muted-foreground">Módulos</div>
          <div className="text-3xl font-bold mt-2">{stats?.total_modulos || 0}</div>
        </Card>

        <Card className="p-6">
          <div className="text-sm font-medium text-muted-foreground">Aulas</div>
          <div className="text-3xl font-bold mt-2">{stats?.total_aulas || 0}</div>
        </Card>

        <Card className="p-6">
          <div className="text-sm font-medium text-muted-foreground">Matrículas</div>
          <div className="text-3xl font-bold mt-2">{stats?.total_matriculas || 0}</div>
        </Card>
      </div>

      {/* Welcome Message */}
      <Card className="p-6">
        <h2 className="text-xl font-bold mb-4">Bem-vindo ao Admin</h2>
        <p className="text-muted-foreground mb-4">
          Use o menu lateral para gerenciar todas as áreas da plataforma:
        </p>
        <ul className="space-y-2 text-sm text-muted-foreground list-disc list-inside">
          <li>Gerenciar usuários e permissões</li>
          <li>Criar e editar cursos, módulos e aulas</li>
          <li>Visualizar matrículas e certificados</li>
          <li>Configurar CMS (landing page)</li>
          <li>Fazer upload de arquivos</li>
          <li>Gerar relatórios</li>
          <li>Visualizar auditoria</li>
          <li>Gerenciar tickets de suporte</li>
        </ul>
      </Card>
    </div>
  );
}
