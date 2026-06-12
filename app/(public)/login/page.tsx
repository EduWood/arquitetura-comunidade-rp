'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Mail, Lock, AlertCircle } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro('');
    setCarregando(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password: senha }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErro(data.message || data.error || 'Erro ao fazer login');
        return;
      }

      if (data.data?.accessToken) {
        localStorage.setItem('accessToken', data.data.accessToken);
      }

      router.push('/dashboard');
    } catch (erro) {
      setErro('Erro de conexão. Tente novamente.');
      console.error('[LoginPage] Erro:', erro);
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center px-4 bg-black overflow-hidden">

      {/* BACKGROUND PREMIUM */}
      <div className="absolute inset-0 bg-gradient-to-br from-black via-zinc-950 to-black" />
      <div className="absolute inset-0 opacity-40 bg-[radial-gradient(circle_at_30%_20%,rgba(16,185,129,0.15),transparent_40%)]" />
      <div className="absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_70%_80%,rgba(34,197,94,0.10),transparent_45%)]" />

      {/* CARD */}
      <Card className="relative w-full max-w-md bg-white/5 border-white/10 backdrop-blur-xl shadow-2xl shadow-black/40 rounded-3xl">

        <CardHeader className="text-center space-y-2">
          <CardTitle className="text-3xl font-bold text-white">
            Bem-vindo de volta
          </CardTitle>

          <CardDescription className="text-zinc-400">
            Acesse sua conta na Comunidade RP
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleLogin} className="space-y-5">

            {erro && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 text-red-400 border border-red-500/20 text-sm">
                <AlertCircle className="h-4 w-4" />
                {erro}
              </div>
            )}

            {/* EMAIL */}
            <div className="space-y-2">
              <label className="text-sm text-zinc-300">Email</label>

              <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 border border-white/10 focus-within:border-emerald-500/40 focus-within:ring-2 focus-within:ring-emerald-500/10 transition">
                <Mail className="h-4 w-4 text-zinc-400" />

                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="você@exemplo.com"
                  className="flex-1 bg-transparent outline-none text-white placeholder:text-zinc-500"
                  required
                />
              </div>
            </div>

            {/* SENHA */}
            <div className="space-y-2">
              <label className="text-sm text-zinc-300">Senha</label>

              <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 border border-white/10 focus-within:border-emerald-500/40 focus-within:ring-2 focus-within:ring-emerald-500/10 transition">
                <Lock className="h-4 w-4 text-zinc-400" />

                <input
                  type="password"
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  placeholder="••••••••"
                  className="flex-1 bg-transparent outline-none text-white placeholder:text-zinc-500"
                  required
                />
              </div>
            </div>

            {/* ESQUECI SENHA */}
            <div className="flex justify-end">
              <Link
                href="/esqueci-senha"
                className="text-sm text-emerald-400 hover:text-emerald-300 transition"
              >
                Esqueceu a senha?
              </Link>
            </div>

            {/* BOTÃO */}
            <Button
              className="w-full h-11 text-base bg-emerald-500 hover:bg-emerald-400 text-black font-semibold transition"
              type="submit"
              disabled={carregando}
            >
              {carregando ? 'Entrando...' : 'Entrar na plataforma'}
            </Button>

            {/* FOOTER */}
            <div className="text-center text-sm text-zinc-400">
              Não tem conta?{' '}
              <Link
                href="/registro"
                className="text-emerald-400 hover:text-emerald-300 transition"
              >
                Criar conta
              </Link>
            </div>

          </form>
        </CardContent>
      </Card>
    </div>
  );
}