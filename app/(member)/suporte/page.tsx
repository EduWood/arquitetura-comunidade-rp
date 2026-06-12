'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function SuportePage() {
  const [selecionado, setSelecionado] = useState<string | null>(null);
  const [tickets, setTickets] = useState([
    { id: 1, titulo: 'Dúvida sobre módulo 2', status: 'aberto', data: '2024-01-10' },
    { id: 2, titulo: 'Problema ao assistir vídeo', status: 'resolvido', data: '2024-01-05' },
  ]);

  const perguntas = [
    {
      id: 'qual-duracao',
      pergunta: 'Qual é a duração dos cursos?',
      resposta:
        'A duração varia de 5 a 40 horas dependendo do curso. Você pode ver a duração na página do curso.',
    },
    {
      id: 'certificado-duracao',
      pergunta: 'Quanto tempo é válido o certificado?',
      resposta:
        'Os certificados são válidos por 3 anos a partir da data de emissão.',
    },
    {
      id: 'reembolso',
      pergunta: 'Qual é a política de reembolso?',
      resposta:
        'Oferecemos reembolso em até 7 dias após a compra se você não estiver satisfeito.',
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold">Suporte</h1>
        <p className="text-muted-foreground mt-2">
          Encontre respostas e abra tickets de suporte
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* FAQ */}
        <div className="md:col-span-2">
          <h2 className="text-2xl font-bold mb-6">Perguntas Frequentes</h2>
          <div className="space-y-3">
            {perguntas.map((faq) => (
              <Card
                key={faq.id}
                className="cursor-pointer hover:bg-primary/5 transition"
                onClick={() =>
                  setSelecionado(selecionado === faq.id ? null : faq.id)
                }
              >
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">{faq.pergunta}</CardTitle>
                </CardHeader>
                {selecionado === faq.id && (
                  <CardContent>
                    <p className="text-muted-foreground">{faq.resposta}</p>
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
        </div>

        {/* Tickets */}
        <div>
          <h2 className="text-2xl font-bold mb-6">Meus Tickets</h2>
          <div className="space-y-3">
            {tickets.map((ticket) => (
              <Card key={ticket.id}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">{ticket.titulo}</CardTitle>
                  <CardDescription className="text-xs">
                    {new Date(ticket.data).toLocaleDateString('pt-BR')}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <span
                    className={`inline-block px-2 py-1 rounded text-xs font-semibold ${
                      ticket.status === 'aberto'
                        ? 'bg-yellow-500/20 text-yellow-700'
                        : 'bg-green-500/20 text-green-700'
                    }`}
                  >
                    {ticket.status === 'aberto' ? 'Aberto' : 'Resolvido'}
                  </span>
                </CardContent>
              </Card>
            ))}
          </div>

          <Button className="w-full mt-6">
            Abrir Novo Ticket
          </Button>
        </div>
      </div>
    </div>
  );
}
