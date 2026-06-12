'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function PerfilPage() {
  const { usuario, logout } = useAuth();
  const [editando, setEditando] = useState(false);
  const [formData, setFormData] = useState({
    nome: usuario?.nome || '',
    email: usuario?.email || '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Implementar atualização de perfil
    setEditando(false);
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold">Meu Perfil</h1>
        <p className="text-muted-foreground mt-2">
          Gerenciar informações da sua conta
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Info Pessoal */}
        <Card>
          <CardHeader>
            <CardTitle>Informações Pessoais</CardTitle>
            <CardDescription>
              Suas informações de conta
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!editando ? (
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Nome</p>
                  <p className="font-semibold">{usuario?.nome}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-semibold">{usuario?.email}</p>
                </div>
                <Button onClick={() => setEditando(true)} variant="outline">
                  Editar Perfil
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Nome</label>
                  <input
                    type="text"
                    name="nome"
                    value={formData.nome}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-input rounded-lg bg-background"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-input rounded-lg bg-background"
                  />
                </div>
                <div className="flex gap-2">
                  <Button type="submit" className="flex-1">
                    Salvar
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    onClick={() => setEditando(false)}
                  >
                    Cancelar
                  </Button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>

        {/* Segurança */}
        <Card>
          <CardHeader>
            <CardTitle>Segurança</CardTitle>
            <CardDescription>
              Gerencie a segurança da sua conta
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button variant="outline" className="w-full">
              Alterar Senha
            </Button>
            <Button variant="outline" className="w-full">
              Ativar Autenticação 2FA
            </Button>
            <Button
              variant="destructive"
              className="w-full"
              onClick={logout}
            >
              Sair de Todas as Contas
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
