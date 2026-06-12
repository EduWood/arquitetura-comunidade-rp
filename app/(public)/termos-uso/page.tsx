'use client';

export default function TermosUsoPage() {
  return (
    <main className="min-h-screen bg-background py-16 px-4">
      <div className="max-w-4xl mx-auto prose prose-invert max-w-none">
        <h1 className="text-4xl font-bold mb-8">Termos de Uso</h1>

        <p className="text-lg text-muted-foreground mb-6">
          Última atualização: {new Date().toLocaleDateString('pt-BR')}
        </p>

        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4">1. Aceitação dos Termos</h2>
          <p className="text-muted-foreground leading-relaxed mb-4">
            Ao acessar e usar Comunidade RP, você aceita estar vinculado a estes termos e condições de uso.
            Se você não concordar com qualquer parte deste contrato, não use este site.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4">2. Licença de Uso</h2>
          <p className="text-muted-foreground leading-relaxed mb-4">
            A permissão é concedida para visualizar temporariamente materiais (conteúdo) em Comunidade RP apenas.
            Esta é uma concessão de licença, não uma transferência de título, e sob esta licença você não pode:
          </p>
          <ul className="list-disc list-inside text-muted-foreground space-y-2">
            <li>Modificar ou copiar o material</li>
            <li>Usar o material para qualquer propósito comercial</li>
            <li>Tentar descompactar, reverter engenharia ou desmontar qualquer software contido</li>
            <li>Remover qualquer direito autoral ou outras notações de propriedade do material</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4">3. Aviso de Isenção de Responsabilidade</h2>
          <p className="text-muted-foreground leading-relaxed mb-4">
            O material em Comunidade RP é fornecido &quot;como está&quot;. Não oferecemos garantias, expressas ou implícitas, 
            e negamos especificamente a garantia de comercialização ou adequação a um fim particular.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4">4. Limitação de Responsabilidade</h2>
          <p className="text-muted-foreground leading-relaxed mb-4">
            Em nenhum caso Comunidade RP será responsável por qualquer dano resultante da disponibilidade ou 
            indisponibilidade do site ou do conteúdo.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4">5. Acurácia do Material</h2>
          <p className="text-muted-foreground leading-relaxed mb-4">
            O material em Comunidade RP pode incluir imprecisões ou erros tipográficos. 
            Não garantimos que o material seja preciso, completo ou atual.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4">6. Modificações</h2>
          <p className="text-muted-foreground leading-relaxed mb-4">
            O material em Comunidade RP pode ser modificado a qualquer momento sem aviso prévio.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4">7. Links</h2>
          <p className="text-muted-foreground leading-relaxed mb-4">
            Comunidade RP não avaliou e não endossa todos os sites vinculados ao seu website e 
            não é responsável pelo conteúdo de nenhum site vinculado.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4">8. Modificações dos Termos de Serviço</h2>
          <p className="text-muted-foreground leading-relaxed mb-4">
            Comunidade RP pode revisar estes termos de serviço para seu website a qualquer momento sem aviso prévio.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4">9. Lei Aplicável</h2>
          <p className="text-muted-foreground leading-relaxed">
            Estes termos e condições são regidos pelas leis da República Federativa do Brasil.
          </p>
        </section>
      </div>
    </main>
  );
}
