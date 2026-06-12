import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed do banco de dados...\n');

  // ============================================================================
  // 1. CRIAR USUÁRIOS
  // ============================================================================
  console.log('📝 Criando usuários...');
  
  const senhaHash = await bcrypt.hash('senha123', 10);
  
  const superAdmin = await prisma.usuario.upsert({
    where: { email: 'admin@comunidaderp.com' },
    update: {},
    create: {
      nome: 'Administrador',
      email: 'admin@comunidaderp.com',
      senha_hash: senhaHash,
      telefone: '+5511999999999',
      role: 'SUPER_ADMIN',
      status: 'ATIVO',
      assinatura_ativa: true,
      data_inicio_assinatura: new Date(),
      data_fim_assinatura: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
    },
  });

  const admin = await prisma.usuario.upsert({
    where: { email: 'gerente@comunidaderp.com' },
    update: {},
    create: {
      nome: 'Gerente de Conteúdo',
      email: 'gerente@comunidaderp.com',
      senha_hash: senhaHash,
      telefone: '+5511988888888',
      role: 'ADMIN',
      status: 'ATIVO',
      assinatura_ativa: true,
      data_inicio_assinatura: new Date(),
      data_fim_assinatura: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
    },
  });

  const membro = await prisma.usuario.upsert({
    where: { email: 'aluno@comunidaderp.com' },
    update: {},
    create: {
      nome: 'João da Silva',
      email: 'aluno@comunidaderp.com',
      senha_hash: senhaHash,
      telefone: '+5511987654321',
      role: 'MEMBRO',
      status: 'ATIVO',
      assinatura_ativa: true,
      data_inicio_assinatura: new Date(),
      data_fim_assinatura: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
  });

  console.log('✅ Usuários criados:\n', {
    superAdmin: superAdmin.email,
    admin: admin.email,
    membro: membro.email,
  }, '\n');

  // ============================================================================
  // 2. CRIAR CURSOS
  // ============================================================================
  console.log('📚 Criando cursos...');

  const cursosData = [
    {
      titulo: 'Forex para Iniciantes',
      descricao: 'Aprenda os fundamentos do mercado de Forex com estratégias comprovadas.',
      descricao_curta: 'Introdução ao Forex',
      categoria: 'FOREX',
      nivel: 'INICIANTE',
      preco: 297.00,
      duracao_horas: 12,
      ordem: 1,
      publicado: true,
    },
    {
      titulo: 'Criptomoedas: Do Zero ao Lucro',
      descricao: 'Domine o mercado de criptomoedas e ganhe renda passiva.',
      descricao_curta: 'Guia completo de Criptomoedas',
      categoria: 'CRIPTOMOEDAS',
      nivel: 'INTERMEDIARIO',
      preco: 397.00,
      duracao_horas: 16,
      ordem: 2,
      publicado: true,
    },
    {
      titulo: 'Bolsa de Valores - Análise Técnica',
      descricao: 'Estratégias de análise técnica para operar na bolsa com segurança.',
      descricao_curta: 'Análise Técnica na Bolsa',
      categoria: 'BOLSA',
      nivel: 'INTERMEDIARIO',
      preco: 297.00,
      duracao_horas: 14,
      ordem: 3,
      publicado: true,
    },
    {
      titulo: 'Opções - Estratégias Avançadas',
      descricao: 'Aprenda as estratégias mais lucrativas de opções financeiras.',
      descricao_curta: 'Estratégias Avançadas de Opções',
      categoria: 'OPCOES',
      nivel: 'AVANCADO',
      preco: 497.00,
      duracao_horas: 20,
      ordem: 4,
      publicado: true,
    },
  ];

  const cursos = await Promise.all(
    cursosData.map((curso) =>
      prisma.curso.upsert({
        where: { id: `curso-${curso.titulo}` },
        update: {},
        create: {
          id: `curso-${curso.titulo}`,
          ...curso,
        },
      })
    )
  );

  console.log('✅ Cursos criados:', cursos.length, '\n');

  // ============================================================================
  // 3. CRIAR MÓDULOS E AULAS
  // ============================================================================
  console.log('🎬 Criando módulos e aulas...');

  // Apenas para o primeiro curso
  const cursoPrincipal = cursos[0];
  
  const modulo1 = await prisma.modulo.create({
    data: {
      curso_id: cursoPrincipal.id,
      titulo: 'Fundamentos do Forex',
      descricao: 'Conceitos básicos que você precisa conhecer.',
      ordem: 1,
    },
  });

  const aula1 = await prisma.aula.create({
    data: {
      modulo_id: modulo1.id,
      titulo: 'O que é Forex?',
      descricao: 'Introdução ao mercado de Forex.',
      ordem: 1,
      duracao_minutos: 15,
      liberada: true,
    },
  });

  const aula2 = await prisma.aula.create({
    data: {
      modulo_id: modulo1.id,
      titulo: 'Pares de Moedas',
      descricao: 'Como os pares de moedas funcionam.',
      ordem: 2,
      duracao_minutos: 18,
      liberada: true,
    },
  });

  console.log('✅ Módulos e aulas criados\n');

  // ============================================================================
  // 4. CRIAR CONTEÚDO DE AULAS
  // ============================================================================
  console.log('📹 Criando conteúdo de aulas...');

  // Criar vídeo YouTube
  const videoYoutube = await prisma.mediaVideo.create({
    data: {
      titulo: 'O que é Forex',
      tipo_video: 'YOUTUBE',
      video_url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
      video_id: 'dQw4w9WgXcQ',
      thumbnail_url: 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
      duracao_segundos: 900,
    },
  });

  // Criar conteúdo da aula
  await prisma.aulaConteudo.create({
    data: {
      aula_id: aula1.id,
      tipo_conteudo: 'VIDEO',
      video_id: videoYoutube.id,
    },
  });

  console.log('✅ Conteúdo de aulas criado\n');

  // ============================================================================
  // 5. INSCREVER MEMBRO NO CURSO
  // ============================================================================
  console.log('👤 Inscrevendo membro no curso...');

  await prisma.usuarioCurso.create({
    data: {
      usuario_id: membro.id,
      curso_id: cursoPrincipal.id,
      progresso_pct: 0,
      concluido: false,
    },
  });

  console.log('✅ Membro inscrito\n');

  // ============================================================================
  // 6. CRIAR CONFIGURAÇÕES CMS
  // ============================================================================
  console.log('⚙️ Criando configurações CMS...');

  const configs = [
    {
      chave: 'logo_url',
      valor: '/images/logo.png',
      tipo: 'STRING',
      descricao: 'URL do logo da plataforma',
    },
    {
      chave: 'favicon_url',
      valor: '/images/favicon.ico',
      tipo: 'STRING',
      descricao: 'URL do favicon',
    },
    {
      chave: 'whatsapp_numero',
      valor: '+5511999999999',
      tipo: 'STRING',
      descricao: 'Número do WhatsApp para contato',
    },
    {
      chave: 'redes_sociais',
      valor: JSON.stringify({
        instagram: 'https://instagram.com/comunidaderp',
        facebook: 'https://facebook.com/comunidaderp',
        youtube: 'https://youtube.com/@comunidaderp',
        linkedin: 'https://linkedin.com/company/comunidaderp',
        tiktok: 'https://tiktok.com/@comunidaderp',
      }),
      tipo: 'JSON',
      descricao: 'Links para redes sociais',
    },
    {
      chave: 'email_contato',
      valor: 'contato@comunidaderp.com',
      tipo: 'STRING',
      descricao: 'Email principal de contato',
    },
    {
      chave: 'seo_titulo_padrao',
      valor: 'Comunidade RP - Educação Financeira',
      tipo: 'STRING',
      descricao: 'Título padrão para SEO',
    },
    {
      chave: 'seo_descricao_padrao',
      valor: 'Plataforma de educação financeira com cursos sobre Forex, Criptomoedas, Bolsa e Opções.',
      tipo: 'STRING',
      descricao: 'Descrição padrão para SEO',
    },
  ];

  await Promise.all(
    configs.map((config) =>
      prisma.cMSConfiguracao.upsert({
        where: { chave: config.chave },
        update: { valor: config.valor },
        create: config,
      })
    )
  );

  console.log('✅ Configurações CMS criadas\n');

  // ============================================================================
  // 7. CRIAR PÁGINA HOME
  // ============================================================================
  console.log('🏠 Criando página Home...');

  const paginaHome = await prisma.cMSPagina.upsert({
    where: { slug: 'home' },
    update: {},
    create: {
      titulo: 'Home',
      slug: 'home',
      descricao: 'Página inicial da plataforma',
      seo_titulo: 'Comunidade RP - Educação Financeira',
      seo_descricao: 'Plataforma de educação financeira com cursos sobre Forex, Criptomoedas e mais.',
      seo_keywords: 'forex, criptomoedas, bolsa, educação financeira',
      publicada: true,
      ordem: 1,
    },
  });

  console.log('✅ Página Home criada\n');

  // ============================================================================
  // 8. CRIAR SEÇÕES DA HOME
  // ============================================================================
  console.log('📄 Criando seções...');

  // Seção Hero
  const secaoHero = await prisma.cMSSecao.create({
    data: {
      pagina_id: paginaHome.id,
      titulo: 'Hero Section',
      tipo_secao: 'HERO',
      ordem: 1,
      dados_json: JSON.stringify({
        titulo: 'Transforme sua vida financeira',
        subtitulo: 'Aprenda a investir com segurança e lucratividade',
        cta_texto: 'Começar Agora',
        cta_url: '/inscricao',
        imagem_url: '/images/hero-bg.jpg',
      }),
    },
  });

  // Seção Benefícios
  const secaoBeneficios = await prisma.cMSSecao.create({
    data: {
      pagina_id: paginaHome.id,
      titulo: 'Benefícios',
      tipo_secao: 'BENEFICIOS',
      ordem: 2,
      dados_json: JSON.stringify({
        titulo: 'Por que escolher a Comunidade RP?',
        beneficios: [
          {
            icone: 'star',
            titulo: 'Cursos de Qualidade',
            descricao: 'Conteúdo atualizado e prático',
          },
          {
            icone: 'users',
            titulo: 'Comunidade Ativa',
            descricao: 'Networking com investidores',
          },
          {
            icone: 'award',
            titulo: 'Certificados',
            descricao: 'Diplomas reconhecidos',
          },
        ],
      }),
    },
  });

  // Seção Depoimentos
  const secaoDepoimentos = await prisma.cMSSecao.create({
    data: {
      pagina_id: paginaHome.id,
      titulo: 'Depoimentos',
      tipo_secao: 'DEPOIMENTOS',
      ordem: 3,
      dados_json: JSON.stringify({}),
    },
  });

  // Seção FAQ
  const secaoFAQ = await prisma.cMSSecao.create({
    data: {
      pagina_id: paginaHome.id,
      titulo: 'Dúvidas Frequentes',
      tipo_secao: 'FAQ',
      ordem: 4,
      dados_json: JSON.stringify({}),
    },
  });

  console.log('✅ Seções criadas\n');

  // ============================================================================
  // 9. CRIAR DEPOIMENTOS
  // ============================================================================
  console.log('💬 Criando depoimentos...');

  const depoimentos = [
    {
      nome_aluno: 'Carlos Santos',
      foto_url: '/images/avatar-1.jpg',
      conteudo: 'A Comunidade RP mudou minha vida financeira! Em 6 meses já recuperei o investimento.',
      classificacao: 5,
      ativo: true,
      ordem: 1,
    },
    {
      nome_aluno: 'Marina Silva',
      foto_url: '/images/avatar-2.jpg',
      conteudo: 'Conteúdo de qualidade excepcional. Recomendo para todos que querem aprender a investir.',
      classificacao: 5,
      ativo: true,
      ordem: 2,
    },
    {
      nome_aluno: 'Roberto Oliveira',
      foto_url: '/images/avatar-3.jpg',
      conteudo: 'Excelente suporte e comunidade! Aprendi forex de verdade nessa plataforma.',
      classificacao: 5,
      ativo: true,
      ordem: 3,
    },
  ];

  await Promise.all(
    depoimentos.map((dep) =>
      prisma.cMSDepoimento.create({
        data: dep,
      })
    )
  );

  console.log('✅ Depoimentos criados\n');

  // ============================================================================
  // 10. CRIAR FAQs
  // ============================================================================
  console.log('❓ Criando FAQs...');

  const faqs = [
    {
      pergunta: 'Qual é o pré-requisito para começar?',
      resposta: 'Nenhum! Nossos cursos são para iniciantes. Se você quer aprender, está no lugar certo.',
      ordem: 1,
      ativo: true,
    },
    {
      pergunta: 'Como funciona o acesso aos cursos?',
      resposta: 'Após a inscrição, você terá acesso vitalício ao curso. Pode assistir quando quiser.',
      ordem: 2,
      ativo: true,
    },
    {
      pergunta: 'Posso solicitar reembolso?',
      resposta: 'Sim! Se não estiver satisfeito em 7 dias, devolvemos 100% do seu dinheiro.',
      ordem: 3,
      ativo: true,
    },
    {
      pergunta: 'Há certificado ao final do curso?',
      resposta: 'Sim! Você recebe um certificado digital comprovando conclusão do curso.',
      ordem: 4,
      ativo: true,
    },
  ];

  await Promise.all(
    faqs.map((faq) =>
      prisma.cMSFAQ.create({
        data: faq,
      })
    )
  );

  console.log('✅ FAQs criadas\n');

  // ============================================================================
  // 11. CRIAR NOTIFICAÇÕES
  // ============================================================================
  console.log('🔔 Criando notificações...');

  const notificacoes = [
    {
      titulo: 'Bem-vindo!',
      mensagem: 'Bem-vindo à Comunidade RP! Comece a aprender agora.',
      tipo: 'IMPORTANTE',
      ativo: true,
      ordem_exibicao: 1,
    },
    {
      titulo: 'Nova aula liberada',
      mensagem: 'Nova aula "Opções Avançadas" foi liberada no curso de Opções.',
      tipo: 'NOVA_AULA',
      ativo: true,
      ordem_exibicao: 2,
    },
    {
      titulo: 'Promoção especial',
      mensagem: 'Aproveite 30% de desconto em todos os cursos este mês!',
      tipo: 'PROMOCAO',
      ativo: true,
      ordem_exibicao: 3,
    },
  ];

  await Promise.all(
    notificacoes.map((notif) =>
      prisma.notificacao.create({
        data: notif,
      })
    )
  );

  console.log('✅ Notificações criadas\n');

  // ============================================================================
  // 12. MARCAR NOTIFICAÇÕES COMO LIDAS
  // ============================================================================
  console.log('📌 Registrando notificações lidas...');

  const notificacoesDB = await prisma.notificacao.findMany({ take: 1 });
  
  if (notificacoesDB.length > 0) {
    await prisma.notificacaoLida.create({
      data: {
        usuario_id: membro.id,
        notificacao_id: notificacoesDB[0].id,
      },
    });
  }

  console.log('✅ Notificações marcadas como lidas\n');

  // ============================================================================
  // FINALIZAR
  // ============================================================================
  console.log('🎉 Seed finalizado com sucesso!');
  console.log('\n📊 Resumo:');
  console.log('   - Usuários: 3 (1 SUPER_ADMIN, 1 ADMIN, 1 MEMBRO)');
  console.log('   - Cursos: 4');
  console.log('   - Módulos: 1');
  console.log('   - Aulas: 2');
  console.log('   - Vídeos: 1');
  console.log('   - Depoimentos: 3');
  console.log('   - FAQs: 4');
  console.log('   - Notificações: 3');
  console.log('   - Configurações CMS: 7');
  console.log('\n🔐 Credenciais para login:');
  console.log('   - Super Admin: admin@comunidaderp.com / senha123');
  console.log('   - Admin: gerente@comunidaderp.com / senha123');
  console.log('   - Membro: aluno@comunidaderp.com / senha123');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('❌ Erro durante seed:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
