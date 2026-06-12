import { ReactNode } from 'react';
import Link from 'next/link';
import { AdminAuthWrapper } from './admin-auth-wrapper';

const ADMIN_MENU = [
  { href: '/admin', label: 'Dashboard', icon: '📊' },
  { href: '/admin/users', label: 'Usuários', icon: '👥' },
  { href: '/admin/courses', label: 'Cursos', icon: '📚' },
  { href: '/admin/modules', label: 'Módulos', icon: '📖' },
  { href: '/admin/lessons', label: 'Aulas', icon: '🎬' },
  { href: '/admin/enrollments', label: 'Matrículas', icon: '✍️' },
  { href: '/admin/certs', label: 'Certificados', icon: '🏆' },
  { href: '/admin/cms', label: 'CMS', icon: '📄' },
  { href: '/admin/storage', label: 'Arquivos', icon: '📁' },
  { href: '/admin/reports', label: 'Relatórios', icon: '📈' },
  { href: '/admin/logs', label: 'Auditoria', icon: '🔐' },
  { href: '/admin/help', label: 'Suporte', icon: '💬' },
];

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <AdminAuthWrapper>
      <div className="flex h-screen bg-background">
        {/* Sidebar */}
        <div className="w-64 border-r bg-card overflow-y-auto">
          <div className="p-6">
            <h1 className="text-2xl font-bold">Admin</h1>
            <p className="text-sm text-muted-foreground">COMUNIDADE RP</p>
          </div>

          <nav className="space-y-2 px-3">
            {ADMIN_MENU.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors hover:bg-muted"
              >
                <span>{item.icon}</span>
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        {/* Main content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <header className="border-b bg-card px-6 py-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Admin Panel</h2>
              <div className="text-sm text-muted-foreground">
                {new Date().toLocaleDateString('pt-BR')}
              </div>
            </div>
          </header>

          {/* Content */}
          <main className="flex-1 overflow-auto p-6">
            {children}
          </main>
        </div>
      </div>
    </AdminAuthWrapper>
  );
}

