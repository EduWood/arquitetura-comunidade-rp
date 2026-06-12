'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight, Star, BookOpen, Users, TrendingUp, Zap, Shield } from 'lucide-react';
import type { Curso } from '@/lib/types';

interface CursosResponse {
  success: boolean;
  data: Curso[];
}

export default function HomePage() {
  const [cursos, setCursos] = useState<Curso[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCursos = async () => {
      try {
        const res = await fetch('/api/courses?publicado=true');
        const data: CursosResponse = await res.json();
        if (data.success) {
          setCursos(data.data.slice(0, 3));
        }
      } catch (erro) {
        console.error('[HomePage] Erro:', erro);
      } finally {
        setLoading(false);
      }
    };

    fetchCursos();
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative py-20 px-4 sm:py-32">
          <div className="max-w-6xl mx-auto text-center space-y-8">
            <div className="inline-block px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium border border-primary/20">
              ✨ Plataforma de Cursos Online
            </div>

            <div className="space-y-4">
              <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">
                Aprenda com os melhores cursos
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Desenvolva suas habilidades com cursos práticos, mentores especializados e uma comunidade de aprendizado ativa.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/registro">
                <Button size="lg">
                  Começar Agora
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/cursos">
                <Button variant="outline" size="lg">
                  Ver Cursos
                </Button>
              </Link>
            </div>

            <div className="grid grid-cols-3 gap-4 max-w-md mx-auto pt-8">
              <div className="text-center">
                <p className="text-2xl font-bold text-primary">500+</p>
                <p className="text-sm text-muted-foreground">Cursos</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-primary">50k+</p>
                <p className="text-sm text-muted-foreground">Alunos</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-primary">95%</p>
                <p className="text-sm text-muted-foreground">Satisfação</p>
              </div>
            </div>
          </div>
        </section>

        {/* Featured Courses */}
        <section className="py-20 px-4 bg-muted/30">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Cursos em Destaque</h2>
              <p className="text-muted-foreground">
                Escolha entre nossos cursos mais populares
              </p>
            </div>

            {loading ? (
              <div className="text-center py-12">Carregando cursos...</div>
            ) : cursos.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground mb-6">Nenhum curso disponível</p>
                <Link href="/cursos">
                  <Button>Ver todos os cursos</Button>
                </Link>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  {cursos.map((curso) => (
                    <Link key={curso.id} href={`/cursos/${curso.id}`}>
                      <Card className="h-full hover:shadow-lg transition cursor-pointer">
                        <CardHeader>
                          <div className="h-40 bg-gradient-to-r from-primary to-accent rounded-md mb-4" />
                          <CardTitle className="line-clamp-2">{curso.titulo}</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-1">
                              <Star className="h-4 w-4 fill-primary text-primary" />
                              <span className="text-sm font-medium">{curso.rating}</span>
                            </div>
                            <span className="text-sm text-muted-foreground">{curso.alunos_total} alunos</span>
                          </div>
                          <div className="pt-4 border-t border-border">
                            <p className="text-lg font-bold text-primary">
                              {curso.preco === 0 ? 'Grátis' : `R$ ${curso.preco}`}
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>

                <div className="text-center">
                  <Link href="/cursos">
                    <Button variant="outline" size="lg">
                      Ver todos os cursos
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </>
            )}
          </div>
        </section>

        {/* Features */}
        <section className="py-20 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Por que escolher a Comunidade RP?</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { icon: BookOpen, title: 'Cursos Práticos', desc: 'Conteúdo orientado para o mundo real' },
                { icon: Users, title: 'Comunidade Ativa', desc: 'Conecte-se com outros alunos' },
                { icon: TrendingUp, title: 'Certificados', desc: 'Reconhecidos profissionalmente' },
                { icon: Zap, title: 'Flexível', desc: 'Estude no seu próprio ritmo' },
                { icon: Shield, title: 'Seguro', desc: 'Plataforma confiável e segura' },
                { icon: Star, title: 'Instrutores', desc: 'Especialistas da indústria' },
              ].map((feature, idx) => {
                const Icon = feature.icon;
                return (
                  <Card key={idx}>
                    <CardHeader>
                      <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                        <Icon className="h-6 w-6 text-primary" />
                      </div>
                      <CardTitle className="text-lg">{feature.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground text-sm">{feature.desc}</p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 px-4 bg-primary/5 border-t border-border">
          <div className="max-w-2xl mx-auto text-center space-y-6">
            <h2 className="text-3xl font-bold">Pronto para começar?</h2>
            <p className="text-muted-foreground">
              Junte-se a milhares de alunos que já estão transformando suas carreiras
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/registro">
                <Button size="lg">
                  Criar Conta Grátis
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/contato">
                <Button variant="outline" size="lg">
                  Entrar em Contato
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
