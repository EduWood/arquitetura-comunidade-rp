'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  BookOpen,
  BarChart3,
  Settings,
  FileText,
  Download
} from 'lucide-react';
import { cn } from '@/lib/utils';

const sidebarItems = [
  { href: '/dashboard', label: 'Dashboard', icon: BarChart3 },
  { href: '/meus-cursos', label: 'Meus Cursos', icon: BookOpen },
  { href: '/certificados', label: 'Certificados', icon: FileText },
  { href: '/meus-downloads', label: 'Downloads', icon: Download },
  { href: '/perfil', label: 'Perfil', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:flex flex-col w-72 min-h-[calc(100vh-80px)] border-r border-white/10 bg-black/20 backdrop-blur-xl p-6">
      
      <div className="mb-10">
        <h2 className="font-bold text-xl">
          Área do Aluno
        </h2>

        <p className="text-sm text-zinc-500">
          Aprenda sem limites
        </p>
      </div>

      <div className="space-y-2">
        {sidebarItems.map(({ href, label, icon: Icon }) => {
          const isActive =
            pathname === href ||
            pathname.startsWith(href + '/');

          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 rounded-2xl px-4 py-3 transition-all',
                isActive
                  ? 'bg-emerald-500 text-white shadow-lg'
                  : 'text-zinc-400 hover:bg-zinc-900 hover:text-white'
              )}
            >
              <Icon className="h-5 w-5" />
              {label}
            </Link>
          );
        })}
      </div>
    </aside>
  );
}