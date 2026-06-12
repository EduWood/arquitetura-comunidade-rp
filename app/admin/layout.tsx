import type { ReactNode } from "react";
import Link from "next/link";

const menu = [
  { name: "Dashboard", href: "/admin", icon: "◈" },
  { name: "Usuários", href: "/admin/users", icon: "◉" },
  { name: "Cursos", href: "/admin/courses", icon: "◈" },
  { name: "Módulos", href: "/admin/modules", icon: "◉" },
  { name: "Aulas", href: "/admin/lessons", icon: "◈" },
  { name: "Matrículas", href: "/admin/enrollments", icon: "◉" },
  { name: "Certificados", href: "/admin/certs", icon: "◈" },
  { name: "CMS", href: "/admin/cms", icon: "◉" },
  { name: "Arquivos", href: "/admin/storage", icon: "◈" },
  { name: "Relatórios", href: "/admin/reports", icon: "◉" },
  { name: "Logs", href: "/admin/logs", icon: "◈" },
  { name: "Suporte", href: "/admin/help", icon: "◉" },
];

export default function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#09090b] text-white flex">
      {/* SIDEBAR */}
      <aside className="w-72 border-r border-zinc-800 bg-[#0f0f12] flex flex-col">
        <div className="p-8 border-b border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-violet-500 to-blue-500 flex items-center justify-center font-bold">
              RP
            </div>

            <div>
              <h1 className="font-bold text-lg">
                Comunidade RP
              </h1>

              <p className="text-xs text-zinc-500">
                Painel Administrativo
              </p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {menu.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="
                flex items-center gap-3
                px-4 py-3
                rounded-xl
                text-zinc-400
                transition-all
                hover:bg-zinc-800
                hover:text-white
              "
            >
              <span className="text-zinc-500">
                {item.icon}
              </span>

              <span>{item.name}</span>
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-zinc-800">
          <div className="rounded-xl bg-zinc-900 p-4">
            <p className="font-medium">
              Administrador
            </p>

            <p className="text-sm text-zinc-500">
              Painel Online
            </p>
          </div>
        </div>
      </aside>

      {/* CONTEÚDO */}
      <div className="flex-1 flex flex-col">
        {/* HEADER */}
        <header className="h-20 border-b border-zinc-800 bg-[#09090b]/80 backdrop-blur flex items-center justify-between px-8">
          <div>
            <h2 className="font-semibold text-lg">
              Dashboard Administrativo
            </h2>

            <p className="text-sm text-zinc-500">
              Gestão completa da plataforma
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="h-10 w-10 rounded-full bg-gradient-to-r from-violet-500 to-blue-500" />
          </div>
        </header>

        {/* MAIN */}
        <main className="flex-1 p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}