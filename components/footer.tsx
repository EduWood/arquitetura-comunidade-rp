export function Footer() {
  return (
    <footer className="border-t border-border bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div>
            <div className="font-bold text-lg text-primary mb-4">Comunidade RP</div>
            <p className="text-sm text-muted-foreground">
              A melhor plataforma para aprender roleplay e produção de conteúdo.
            </p>
          </div>

          {/* Produto */}
          <div>
            <h3 className="font-semibold mb-4">Produto</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="/cursos" className="hover:text-primary">Cursos</a></li>
              <li><a href="/categorias" className="hover:text-primary">Categorias</a></li>
              <li><a href="/certificados" className="hover:text-primary">Certificados</a></li>
            </ul>
          </div>

          {/* Comunidade */}
          <div>
            <h3 className="font-semibold mb-4">Comunidade</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="/sobre" className="hover:text-primary">Sobre</a></li>
              <li><a href="/blog" className="hover:text-primary">Blog</a></li>
              <li><a href="/contato" className="hover:text-primary">Contato</a></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="font-semibold mb-4">Legal</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="/termos" className="hover:text-primary">Termos de Uso</a></li>
              <li><a href="/privacidade" className="hover:text-primary">Privacidade</a></li>
              <li><a href="/cookies" className="hover:text-primary">Cookies</a></li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-border pt-8 flex flex-col sm:flex-row justify-between items-center text-sm text-muted-foreground">
          <p>&copy; 2024 Comunidade RP. Todos os direitos reservados.</p>
          <div className="flex gap-4 mt-4 sm:mt-0">
            <a href="#" className="hover:text-primary">Instagram</a>
            <a href="#" className="hover:text-primary">YouTube</a>
            <a href="#" className="hover:text-primary">Discord</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
