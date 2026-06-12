import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, BookOpen, Users, Award, Zap } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative px-4 py-20 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-5xl sm:text-6xl font-bold mb-6 text-balance">
            Aprenda <span className="text-primary">Roleplay</span> com os Melhores
          </h1>
          <p className="text-xl text-muted-foreground mb-8 text-balance max-w-2xl mx-auto">
            Comunidade RP é a plataforma premium para quem quer dominar roleplay, produção de conteúdo e criar histórias incríveis.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/cursos">
              <Button size="lg" className="gap-2">
                Explorar Cursos
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/registro">
              <Button size="lg" variant="outline">
                Criar Conta Grátis
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mt-16 py-12 border-t border-border">
          <div className="text-center">
            <div className="text-3xl font-bold text-primary mb-2">500+</div>
            <p className="text-sm text-muted-foreground">Alunos Inscritos</p>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-primary mb-2">50+</div>
            <p className="text-sm text-muted-foreground">Cursos Disponíveis</p>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-primary mb-2">100+</div>
            <p className="text-sm text-muted-foreground">Horas de Conteúdo</p>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-primary mb-2">4.9</div>
            <p className="text-sm text-muted-foreground">Avaliação Média</p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="px-4 py-20 sm:px-6 lg:px-8 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-4">Por que escolher Comunidade RP?</h2>
          <p className="text-center text-muted-foreground mb-12 text-lg max-w-2xl mx-auto">
            Tudo que você precisa para se tornar um criador de conteúdo profissional
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-background rounded-lg p-8 border border-border">
              <BookOpen className="h-8 w-8 text-primary mb-4" />
              <h3 className="font-bold text-lg mb-2">Cursos Estruturados</h3>
              <p className="text-sm text-muted-foreground">
                Aprenda passo a passo com conteúdo produzido pelos melhores da comunidade.
              </p>
            </div>

            <div className="bg-background rounded-lg p-8 border border-border">
              <Users className="h-8 w-8 text-primary mb-4" />
              <h3 className="font-bold text-lg mb-2">Comunidade Ativa</h3>
              <p className="text-sm text-muted-foreground">
                Conecte-se com outros criadores, compartilhe experiências e cresça junto.
              </p>
            </div>

            <div className="bg-background rounded-lg p-8 border border-border">
              <Award className="h-8 w-8 text-primary mb-4" />
              <h3 className="font-bold text-lg mb-2">Certificados</h3>
              <p className="text-sm text-muted-foreground">
                Receba certificados reconhecidos ao completar cada curso.
              </p>
            </div>

            <div className="bg-background rounded-lg p-8 border border-border">
              <Zap className="h-8 w-8 text-primary mb-4" />
              <h3 className="font-bold text-lg mb-2">Conteúdo Premium</h3>
              <p className="text-sm text-muted-foreground">
                Acesso a vídeos em HD, materiais extras e atualizações constantes.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-4 py-20 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto bg-gradient-to-r from-primary to-accent rounded-lg p-12 text-center text-primary-foreground">
          <h2 className="text-4xl font-bold mb-4">Pronto para começar?</h2>
          <p className="text-lg mb-8 opacity-90">
            Junte-se a centenas de criadores que já estão transformando suas habilidades em carreira.
          </p>
          <Link href="/registro">
            <Button size="lg" variant="secondary">
              Criar Conta Agora
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
