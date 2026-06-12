'use client';

export default function PoliticaPrivacidadePage() {
  return (
    <main className="min-h-screen bg-background py-16 px-4">
      <div className="max-w-4xl mx-auto prose prose-invert max-w-none">
        <h1 className="text-4xl font-bold mb-8">Política de Privacidade</h1>

        <p className="text-lg text-muted-foreground mb-6">
          Última atualização: {new Date().toLocaleDateString('pt-BR')}
        </p>

        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4">1. Introdução</h2>
          <p className="text-muted-foreground leading-relaxed mb-4">
            A Comunidade RP (&quot;nós&quot;, &quot;nosso&quot; ou &quot;empresa&quot;) opera a plataforma Comunidade RP. 
            Esta página informa você sobre nossas políticas de privacidade e como tratamos os dados pessoais.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4">2. Coleta de Dados</h2>
          <p className="text-muted-foreground leading-relaxed mb-4">
            Coletamos dados que você fornece diretamente, como nome, email, informações de perfil e dados de pagamento.
            Também coletamos dados automaticamente como endereço IP, tipo de navegador e páginas visitadas.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4">3. Uso de Dados</h2>
          <p className="text-muted-foreground leading-relaxed mb-4">
            Utilizamos os dados para:
          </p>
          <ul className="list-disc list-inside text-muted-foreground space-y-2">
            <li>Fornecer e melhorar nossos serviços</li>
            <li>Comunicação com você</li>
            <li>Processamento de pagamentos</li>
            <li>Conformidade com obrigações legais</li>
            <li>Análise e relatórios</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4">4. Segurança</h2>
          <p className="text-muted-foreground leading-relaxed mb-4">
            Implementamos medidas de segurança apropriadas para proteger seus dados pessoais contra acesso não autorizado, 
            alteração, divulgação ou destruição.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4">5. Direitos do Usuário</h2>
          <p className="text-muted-foreground leading-relaxed mb-4">
            Você tem o direito de acessar, corrigir, atualizar ou solicitar a exclusão de seus dados pessoais. 
            Para exercer esses direitos, entre em contato conosco através do email contato@comunidade-rp.com.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4">6. Cookies</h2>
          <p className="text-muted-foreground leading-relaxed mb-4">
            Utilizamos cookies para melhorar sua experiência. Você pode configurar seu navegador para recusar cookies.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4">7. Contato</h2>
          <p className="text-muted-foreground leading-relaxed">
            Se tiver dúvidas sobre esta política, entre em contato: contato@comunidade-rp.com
          </p>
        </section>
      </div>
    </main>
  );
}
