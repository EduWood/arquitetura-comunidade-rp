'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function ResetSenhaPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const [senha, setSenha] = useState('');
  const [confirmar, setConfirmar] = useState('');
  const [resetado, setResetado] = useState(false);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState('');

  useEffect(() => {
    if (!token) {
      setErro('Token inválido');
    }
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro('');

    if (senha !== confirmar) {
      setErro('As senhas não coincidem');
      return;
    }

    if (senha.length < 8) {
      setErro('A senha deve ter no mínimo 8 caracteres');
      return;
    }

    setCarregando(true);

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, novaSenha: senha }),
      });

      if (res.ok) {
        setResetado(true);
      } else {
        const data = await res.json();
        setErro(data.error || 'Erro ao resetar senha');
      }
    } finally {
      setCarregando(false);
    }
  };

  if (erro && erro === 'Token inválido') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 to-secondary/10">
        <div className="bg-card rounded-lg border border-border p-8 text-center max-w-md">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Link Inválido</h1>
          <p className="text-muted-foreground mb-6">
            Este link de recuperação expirou ou é inválido
          </p>
          <Link href="/esqueci-senha">
            <Button>Solicitar Novo Link</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 to-secondary/10 px-4">
      <div className="w-full max-w-md">
        <div className="bg-card rounded-lg border border-border p-8 shadow-lg">
          <h1 className="text-3xl font-bold text-center mb-2">Nova Senha</h1>
          <p className="text-center text-muted-foreground mb-6">
            Digite sua nova senha
          </p>

          {!resetado ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              {erro && (
                <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
                  {erro}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium mb-2">Senha</label>
                <input
                  type="password"
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  required
                  className="w-full px-4 py-2 border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="••••••••"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Confirmar Senha</label>
                <input
                  type="password"
                  value={confirmar}
                  onChange={(e) => setConfirmar(e.target.value)}
                  required
                  className="w-full px-4 py-2 border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="••••••••"
                />
              </div>

              <Button
                type="submit"
                disabled={carregando}
                className="w-full"
              >
                {carregando ? 'Resetando...' : 'Resetar Senha'}
              </Button>
            </form>
          ) : (
            <div className="text-center py-6">
              <div className="text-green-600 text-5xl mb-4">✓</div>
              <p className="text-lg font-semibold mb-2">Senha Resetada!</p>
              <p className="text-muted-foreground mb-6">
                Você já pode fazer login com sua nova senha
              </p>
              <Link href="/login">
                <Button className="w-full">Ir para Login</Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
