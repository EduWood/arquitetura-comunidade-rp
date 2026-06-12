'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function EsqueciSenhaPage() {
  const [email, setEmail] = useState('');
  const [enviado, setEnviado] = useState(false);
  const [carregando, setCarregando] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCarregando(true);

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (res.ok) {
        setEnviado(true);
      } else {
        alert('Erro ao enviar email de recuperação');
      }
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 to-secondary/10 px-4">
      <div className="w-full max-w-md">
        <div className="bg-card rounded-lg border border-border p-8 shadow-lg">
          <h1 className="text-3xl font-bold text-center mb-2">Recuperar Senha</h1>
          <p className="text-center text-muted-foreground mb-6">
            Digite seu email para receber um link de recuperação
          </p>

          {!enviado ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-2 border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="seu@email.com"
                />
              </div>

              <Button
                type="submit"
                disabled={carregando}
                className="w-full"
              >
                {carregando ? 'Enviando...' : 'Enviar Link de Recuperação'}
              </Button>
            </form>
          ) : (
            <div className="text-center py-6">
              <div className="text-green-600 text-5xl mb-4">✓</div>
              <p className="text-lg font-semibold mb-2">Email Enviado!</p>
              <p className="text-muted-foreground mb-6">
                Verifique seu email e clique no link para resetar sua senha
              </p>
            </div>
          )}

          <div className="mt-6 text-center">
            <Link href="/login" className="text-primary hover:underline">
              Voltar para login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
