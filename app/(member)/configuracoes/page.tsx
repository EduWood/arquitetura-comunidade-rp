'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function ConfiguracoesPage() {
  const [notificacoes, setNotificacoes] = useState({
    email: true,
    sms: false,
    push: true,
  });

  const [privacidade, setPrivacidade] = useState({
    perfil: 'publico',
    certificados: 'publico',
  });

  const handleSave = () => {
    // Implementar save
    alert('Configurações salvas com sucesso!');
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold">Configurações</h1>
        <p className="text-muted-foreground mt-2">
          Customize sua experiência
        </p>
      </div>

      <div className="space-y-6">
        {/* Notificações */}
        <Card>
          <CardHeader>
            <CardTitle>Notificações</CardTitle>
            <CardDescription>
              Escolha como você quer receber notificações
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {Object.entries(notificacoes).map(([key, value]) => (
              <label key={key} className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={value}
                  onChange={(e) =>
                    setNotificacoes({
                      ...notificacoes,
                      [key]: e.target.checked,
                    })
                  }
                  className="w-4 h-4"
                />
                <span className="capitalize font-medium">
                  Notificações por {key}
                </span>
              </label>
            ))}
          </CardContent>
        </Card>

        {/* Privacidade */}
        <Card>
          <CardHeader>
            <CardTitle>Privacidade</CardTitle>
            <CardDescription>
              Controle quem pode ver suas informações
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Visibilidade do Perfil
              </label>
              <select
                value={privacidade.perfil}
                onChange={(e) =>
                  setPrivacidade({
                    ...privacidade,
                    perfil: e.target.value,
                  })
                }
                className="w-full px-4 py-2 border border-input rounded-lg bg-background"
              >
                <option value="privado">Privado</option>
                <option value="publico">Público</option>
                <option value="amigos">Apenas Amigos</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Visibilidade dos Certificados
              </label>
              <select
                value={privacidade.certificados}
                onChange={(e) =>
                  setPrivacidade({
                    ...privacidade,
                    certificados: e.target.value,
                  })
                }
                className="w-full px-4 py-2 border border-input rounded-lg bg-background"
              >
                <option value="privado">Privado</option>
                <option value="publico">Público</option>
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Aparência */}
        <Card>
          <CardHeader>
            <CardTitle>Aparência</CardTitle>
            <CardDescription>
              Customize a aparência da plataforma
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <label className="flex items-center gap-3">
              <input type="checkbox" className="w-4 h-4" />
              <span className="font-medium">Modo Escuro</span>
            </label>
          </CardContent>
        </Card>

        <Button onClick={handleSave} className="w-full">
          Salvar Configurações
        </Button>
      </div>
    </div>
  );
}
