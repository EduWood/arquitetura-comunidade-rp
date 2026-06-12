'use client';

import Link from 'next/link';
import { useAuth } from '@/lib/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { LogOut, Menu, X, GraduationCap } from 'lucide-react';
import { useState } from 'react';

export function Navbar() {
  const { usuario, logado, logout, isAdmin } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 backdrop-blur-xl bg-black/50">
      <nav className="max-w-7xl mx-auto flex items-center justify-between px-6 h-20">
        
        <Link
          href="/"
          className="flex items-center gap-3"
        >
          <div className="h-11 w-11 rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-700 flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <GraduationCap className="h-6 w-6 text-white" />
          </div>

          <div>
            <p className="font-bold text-lg text-white">
              Comunidade RP
            </p>

            <p className="text-xs text-zinc-500">
              Plataforma Premium
            </p>
          </div>
        </Link>

        <div className="hidden lg:flex items-center gap-8">
          <Link href="/cursos" className="text-zinc-400 hover:text-white transition">
            Cursos
          </Link>

          <Link href="/sobre" className="text-zinc-400 hover:text-white transition">
            Sobre
          </Link>

          <Link href="/contato" className="text-zinc-400 hover:text-white transition">
            Contato
          </Link>
        </div>

        <div className="hidden lg:flex items-center gap-3">
          {!logado ? (
            <>
              <Link href="/login">
                <Button variant="ghost">
                  Entrar
                </Button>
              </Link>

              <Link href="/registro">
                <Button>
                  Criar Conta
                </Button>
              </Link>
            </>
          ) : (
            <>
              <Link href="/dashboard">
                <Button variant="outline">
                  {usuario?.nome}
                </Button>
              </Link>

              {isAdmin && (
                <Link href="/admin">
                  <Button>
                    Painel Admin
                  </Button>
                </Link>
              )}

              <Button
                variant="ghost"
                onClick={logout}
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>

        <button
          className="lg:hidden"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? (
            <X />
          ) : (
            <Menu />
          )}
        </button>
      </nav>
    </header>
  );
}