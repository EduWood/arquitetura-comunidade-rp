'use client';

export default function SobrePage() {
  return (
    <main className="min-h-screen bg-background">
      {/* Hero */}
      <div className="bg-gradient-to-br from-primary/10 to-secondary/10 py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl font-bold mb-4">Sobre Comunidade RP</h1>
          <p className="text-xl text-muted-foreground">
            Conheça a história por trás da maior plataforma de cursos de roleplay do Brasil
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto py-16 px-4 space-y-12">
        {/* Missão */}
        <section>
          <h2 className="text-3xl font-bold mb-4">Nossa Missão</h2>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Democratizar o acesso a educação de qualidade em roleplay, produção audiovisual e criação de conteúdo. 
            Acreditamos que todo criador tem potencial para se tornar um mestre em sua área.
          </p>
        </section>

        {/* História */}
        <section>
          <h2 className="text-3xl font-bold mb-4">Nossa História</h2>
          <p className="text-lg text-muted-foreground leading-relaxed mb-4">
            Fundada em 2023, Comunidade RP nasceu da paixão de um grupo de criadores que queriam compartilhar 
            conhecimento e técnicas avançadas com a comunidade brasileira de roleplay.
          </p>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Hoje, somos a plataforma de referência com mais de 50 mil alunos e 150+ cursos de alta qualidade.
          </p>
        </section>

        {/* Valores */}
        <section>
          <h2 className="text-3xl font-bold mb-6">Nossos Valores</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { title: 'Qualidade', desc: 'Conteúdo premium de criadores experientes' },
              { title: 'Acessibilidade', desc: 'Preços justos e conteúdo para todos os níveis' },
              { title: 'Comunidade', desc: 'Espaço seguro para aprender e crescer juntos' },
            ].map((valor) => (
              <div key={valor.title} className="border border-border rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-2">{valor.title}</h3>
                <p className="text-muted-foreground">{valor.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Equipe */}
        <section>
          <h2 className="text-3xl font-bold mb-6">Nossa Equipe</h2>
          <p className="text-lg text-muted-foreground mb-6">
            Um grupo dedicado de educadores, desenvolvedores e gestores trabalhando para oferecer a melhor experiência.
          </p>
        </section>
      </div>
    </main>
  );
}
