'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';

export default function ContatoPage() {
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    assunto: '',
    mensagem: '',
  });
  const [enviado, setEnviado] = useState(false);
  const [carregando, setCarregando] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCarregando(true);

    try {
      const res = await fetch('/api/suporte', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setEnviado(true);
        setFormData({ nome: '', email: '', assunto: '', mensagem: '' });
      }
    } finally {
      setCarregando(false);
    }
  };

  return (
    <main className="min-h-screen bg-background">
      {/* Hero */}
      <div className="bg-gradient-to-br from-primary/10 to-secondary/10 py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl font-bold mb-4">Entre em Contato</h1>
          <p className="text-xl text-muted-foreground">
            Estamos aqui para ajudar! Envie sua mensagem
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto py-16 px-4">
        <div className="grid md:grid-cols-2 gap-12">
          {/* Form */}
          <div>
            <h2 className="text-2xl font-bold mb-6">Enviar Mensagem</h2>
            {enviado && (
              <div className="bg-green-50 text-green-600 p-4 rounded-lg mb-6">
                Mensagem enviada com sucesso! Responderemos em breve.
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Nome</label>
                <input
                  type="text"
                  name="nome"
                  value={formData.nome}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Assunto</label>
                <select
                  name="assunto"
                  value={formData.assunto}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">Selecione um assunto</option>
                  <option value="duvida">Dúvida sobre curso</option>
                  <option value="bug">Reportar bug</option>
                  <option value="sugestao">Sugestão</option>
                  <option value="outro">Outro</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Mensagem</label>
                <textarea
                  name="mensagem"
                  value={formData.mensagem}
                  onChange={handleChange}
                  required
                  rows={5}
                  className="w-full px-4 py-2 border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <Button type="submit" disabled={carregando} className="w-full">
                {carregando ? 'Enviando...' : 'Enviar Mensagem'}
              </Button>
            </form>
          </div>

          {/* Info */}
          <div>
            <h2 className="text-2xl font-bold mb-6">Informações de Contato</h2>
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold mb-2">Email</h3>
                <a href="mailto:contato@comunidade-rp.com" className="text-primary hover:underline">
                  contato@comunidade-rp.com
                </a>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Horário de Atendimento</h3>
                <p className="text-muted-foreground">
                  Segunda a Sexta: 9h às 18h<br />
                  Sábado e Domingo: 10h às 16h
                </p>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Redes Sociais</h3>
                <div className="flex gap-4">
                  <a href="#" className="text-primary hover:underline">Instagram</a>
                  <a href="#" className="text-primary hover:underline">Discord</a>
                  <a href="#" className="text-primary hover:underline">YouTube</a>
                </div>
              </div>

              <div className="bg-primary/10 p-6 rounded-lg">
                <h3 className="font-semibold mb-2">FAQ</h3>
                <p className="text-sm text-muted-foreground">
                  Confira nossa seção de perguntas frequentes para dúvidas comuns sobre cursos e acesso.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
