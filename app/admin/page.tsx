export default function AdminPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
        <p className="text-muted-foreground">Bem-vindo ao painel administrativo</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="border rounded-lg p-6">
          <div className="text-sm font-medium text-muted-foreground">Usuários</div>
          <div className="text-3xl font-bold mt-2">—</div>
        </div>

        <div className="border rounded-lg p-6">
          <div className="text-sm font-medium text-muted-foreground">Cursos</div>
          <div className="text-3xl font-bold mt-2">—</div>
        </div>

        <div className="border rounded-lg p-6">
          <div className="text-sm font-medium text-muted-foreground">Módulos</div>
          <div className="text-3xl font-bold mt-2">—</div>
        </div>

        <div className="border rounded-lg p-6">
          <div className="text-sm font-medium text-muted-foreground">Aulas</div>
          <div className="text-3xl font-bold mt-2">—</div>
        </div>

        <div className="border rounded-lg p-6">
          <div className="text-sm font-medium text-muted-foreground">Matrículas</div>
          <div className="text-3xl font-bold mt-2">—</div>
        </div>
      </div>

      {/* Welcome Message */}
      <div className="border rounded-lg p-6">
        <h2 className="text-xl font-bold mb-4">Bem-vindo ao Admin</h2>
        <p className="text-muted-foreground mb-4">
          Use o menu lateral para gerenciar todas as áreas da plataforma
        </p>
      </div>
    </div>
  );
}
