export default function TermosPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-2">Termos de Uso</h1>
      <p className="text-muted-foreground mb-8">Última atualização: junho de 2025</p>

      <div className="space-y-8 text-sm leading-relaxed">
        <section>
          <h2 className="text-lg font-semibold mb-2">1. Aceitação dos Termos</h2>
          <p>
            Ao criar uma conta e utilizar a plataforma Comunidade RP, você concorda com estes Termos
            de Uso. Se não concordar com qualquer parte destes termos, não utilize a plataforma.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-2">2. Uso da Plataforma</h2>
          <p>
            A plataforma Comunidade RP é destinada exclusivamente para fins educacionais. Você se
            compromete a utilizar os recursos de forma responsável e a não compartilhar conteúdo
            protegido por direitos autorais sem autorização.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-2">3. Conta de Usuário</h2>
          <p>
            Você é responsável por manter a confidencialidade de suas credenciais de acesso e por
            todas as atividades realizadas em sua conta. Informe-nos imediatamente sobre qualquer uso
            não autorizado.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-2">4. Propriedade Intelectual</h2>
          <p>
            Todo o conteúdo disponível na plataforma, incluindo vídeos, textos, imagens e materiais
            de apoio, é protegido por direitos autorais e pertence à Comunidade RP ou aos seus
            respectivos criadores.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-2">5. Privacidade</h2>
          <p>
            Coletamos e utilizamos seus dados pessoais conforme nossa Política de Privacidade. Ao
            utilizar a plataforma, você consente com o tratamento dos seus dados para fins de
            prestação dos serviços.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-2">6. Cancelamento</h2>
          <p>
            Você pode cancelar sua conta a qualquer momento. O acesso aos cursos pagos será mantido
            até o fim do período contratado.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-2">7. Alterações nos Termos</h2>
          <p>
            Reservamo-nos o direito de modificar estes termos a qualquer momento. Notificaremos os
            usuários sobre alterações significativas por e-mail ou aviso na plataforma.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-2">8. Contato</h2>
          <p>
            Em caso de dúvidas sobre estes termos, entre em contato conosco através da página de{' '}
            <a href="/contato" className="text-primary hover:underline">
              Contato
            </a>
            .
          </p>
        </section>
      </div>
    </div>
  );
}
