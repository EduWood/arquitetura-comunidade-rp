'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, User, Mail, Lock } from 'lucide-react';

export default function RegistroPage() {
  const router = useRouter();
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);

  const handleRegistro = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro('');

    if (senha !== confirmarSenha) {
      setErro('As senhas não coincidem');
      return;
    }

    if (senha.length < 8) {
      setErro('A senha deve ter no mínimo 8 caracteres');
      return;
    }

    setCarregando(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ nome, email, senha, confirmar_senha: confirmarSenha }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErro(data.error || 'Erro ao criar conta');
        return;
      }

      router.push('/login?registered=true');
    } catch (erro) {
      setErro('Erro de conexão. Tente novamente.');
      console.error('[RegistroPage] Erro:', erro);
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Criar Conta</CardTitle>
          <CardDescription>Junte-se à Comunidade RP</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleRegistro} className="space-y-4">
            {erro && (
              <div className="flex items-center gap-2 p-3 bg-destructive/10 text-destructive rounded-lg text-sm">
                <AlertCircle className="h-4 w-4" />
                {erro}
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium">Nome Completo</label>
              <div className="flex items-center gap-2 px-3 py-2 border border-border rounded-lg focus-within:ring-2 focus-within:ring-primary">
                <User className="h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  placeholder="Seu nome"
                  className="flex-1 bg-transparent outline-none"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Email</label>
              <div className="flex items-center gap-2 px-3 py-2 border border-border rounded-lg focus-within:ring-2 focus-within:ring-primary">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="você@exemplo.com"
                  className="flex-1 bg-transparent outline-none"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Senha</label>
              <div className="flex items-center gap-2 px-3 py-2 border border-border rounded-lg focus-within:ring-2 focus-within:ring-primary">
                <Lock className="h-4 w-4 text-muted-foreground" />
                <input
                  type="password"
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  placeholder="••••••••"
                  className="flex-1 bg-transparent outline-none"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Confirmar Senha</label>
              <div className="flex items-center gap-2 px-3 py-2 border border-border rounded-lg focus-within:ring-2 focus-within:ring-primary">
                <Lock className="h-4 w-4 text-muted-foreground" />
                <input
                  type="password"
                  value={confirmarSenha}
                  onChange={(e) => setConfirmarSenha(e.target.value)}
                  placeholder="••••••••"
                  className="flex-1 bg-transparent outline-none"
                  required
                />
              </div>
            </div>

            <Button className="w-full" type="submit" disabled={carregando}>
              {carregando ? 'Criando conta...' : 'Criar Conta'}
            </Button>

            <div className="text-center text-sm text-muted-foreground">
              Já tem conta?{' '}
              <Link href="/login" className="text-primary hover:underline">
                Fazer login
              </Link>
            </div>

            <div className="text-xs text-muted-foreground text-center">
              Ao criar uma conta, você concorda com nossos{' '}
              <Link href="/termos" className="text-primary hover:underline">
                Termos de Uso
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
