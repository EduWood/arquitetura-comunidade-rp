'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BookOpen, BarChart3, Settings, FileText, Download } from 'lucide-react';
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
    <aside className="hidden md:flex flex-col w-64 border-r border-border bg-background p-6 gap-6">
      {sidebarItems.map(({ href, label, icon: Icon }) => {
        const isActive = pathname === href || pathname.startsWith(href + '/');
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              'flex items-center gap-3 px-4 py-2 rounded-lg text-sm font-medium transition-colors',
              isActive
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted'
            )}
          >
            <Icon className="h-5 w-5" />
            {label}
          </Link>
        );
      })}
    </aside>
  );
}
