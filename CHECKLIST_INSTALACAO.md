✅ ETAPA 1 - CHECKLIST DE IMPLEMENTAÇÃO
========================================

Data: 2026-06-11
Status: PRONTO PARA INSTALAR


🎯 ANTES DE COMEÇAR
═══════════════════════════════════════════════════════════════════════════════

Você tem?

□ Node.js 18+ instalado
  Verificar: node --version
  
□ npm ou pnpm instalado
  Verificar: npm --version
  
□ MySQL em Hostinger criado
  Credenciais anotadas:
  - Host: ________________
  - User: ________________
  - Password: ________________
  - Database: ________________
  
□ Editor de código (VSCode recomendado)

□ Terminal/CLI funcionando


📚 LEITURA PRÉVIA (RECOMENDADO)
═══════════════════════════════════════════════════════════════════════════════

Antes de instalar, leia na ordem:

□ README_ETAPA_1.md (este arquivo)
  Tempo: 5 minutos
  
□ ETAPA_1_RESUMO.md
  Tempo: 5 minutos
  O que: Visão geral do que foi criado
  
□ ETAPA_1_INSTALACAO.md
  Tempo: 10 minutos (primeira leitura)
  O que: Guia passo-a-passo que você vai seguir


⚡ INSTALAÇÃO RÁPIDA (PARA QUEM TEM PRESSA)
═══════════════════════════════════════════════════════════════════════════════

1. Copiar arquivos Prisma:
   □ cp prisma/schema.prisma ./seu-projeto/prisma/
   □ cp prisma/migrations/001_init.sql ./seu-projeto/prisma/
   □ cp prisma/seed.ts ./seu-projeto/prisma/

2. Instalar dependências:
   □ npm install @prisma/client prisma bcrypt jsonwebtoken zod

3. Criar arquivo .env.local:
   □ DATABASE_URL="mysql://user:pass@host/db"
   □ JWT_SECRET="chave-aleatória-64-chars"
   □ JWT_REFRESH_SECRET="outra-chave-aleatória"

4. Criar banco:
   □ npx prisma migrate dev --name init

5. Popular dados:
   □ npx prisma db seed

6. Verificar:
   □ npx prisma studio
   □ Abrir http://localhost:5555
   □ Verificar 24 tabelas criadas

✅ PRONTO! Banco 100% funcional.


🔧 INSTALAÇÃO PASSO-A-PASSO (PARA QUEM QUER DETALHES)
═══════════════════════════════════════════════════════════════════════════════

PASSO 1: PREPARAR PROJETO
□ Criar novo projeto Next.js:
  npx create-next-app@latest comunidade-rp --typescript --tailwind
  
□ Navegar para o diretório:
  cd comunidade-rp

□ Instalar dependências do Prisma:
  npm install @prisma/client
  npm install -D prisma

□ Instalar dependências de autenticação:
  npm install bcrypt jsonwebtoken
  npm install -D @types/bcrypt @types/jsonwebtoken

□ Instalar validação:
  npm install zod axios


PASSO 2: CONFIGURAR BANCO DE DADOS
□ Hostinger Dashboard → Databases → MySQL
  
□ Criar novo database:
  □ Name: comunidade_rp
  □ User: user_rp
  □ Password: (gerar forte)
  
□ Anotar credenciais (Host, User, Password, Database)

□ Criar arquivo .env.local:
  cat > .env.local << 'EOF'
  DATABASE_URL="mysql://user_rp:password@host/comunidade_rp"
  JWT_SECRET="chave-secreta-aleatoria-minimo-64-caracteres"
  JWT_REFRESH_SECRET="outra-chave-secreta-aleatoria-minimo-64"
  NEXT_PUBLIC_API_URL="http://localhost:3000"
  NEXT_PUBLIC_SITE_URL="http://localhost:3000"
  EOF

□ Gerar chaves JWT:
  openssl rand -base64 32  (fazer 2x para cada chave)


PASSO 3: COPIAR ARQUIVOS PRISMA
□ Copiar schema.prisma:
  cp /vercel/share/v0-project/prisma/schema.prisma ./prisma/
  
□ Copiar migrations:
  mkdir -p ./prisma/migrations
  cp /vercel/share/v0-project/prisma/migrations/001_init.sql \
     ./prisma/migrations/
  
□ Copiar seed.ts:
  cp /vercel/share/v0-project/prisma/seed.ts ./prisma/

□ Atualizar package.json com scripts:
  "prisma:generate": "prisma generate",
  "prisma:migrate": "prisma migrate dev",
  "prisma:seed": "prisma db seed",
  "prisma:studio": "prisma studio",
  "prisma": {
    "seed": "ts-node prisma/seed.ts"
  }


PASSO 4: CRIAR BANCO E TABELAS
□ Gerar Prisma Client:
  npm run prisma:generate
  
□ Criar migration:
  npm run prisma:migrate
  
  Quando pedir nome, digitar:
  > init

□ Aguardar criação das tabelas no banco

□ Verificar se criou sem erros


PASSO 5: POPULAR DADOS INICIAIS
□ Executar seed:
  npm run prisma:seed
  
□ Aguardar saída:
  🌱 Iniciando seed...
  ...
  🎉 Seed finalizado com sucesso!

□ Credenciais criadas:
  □ admin@comunidaderp.com / senha123 (SUPER_ADMIN)
  □ gerente@comunidaderp.com / senha123 (ADMIN)
  □ aluno@comunidaderp.com / senha123 (MEMBRO)


PASSO 6: VALIDAR INSTALAÇÃO
□ Abrir Prisma Studio:
  npm run prisma:studio
  
□ Acessar http://localhost:5555

□ Verificar 24 tabelas:
  Usuario
  SessaoJWT
  TokenRecuperacao
  Curso
  Modulo
  Aula
  AulaConteudo
  UsuarioCurso
  UsuarioAula
  MediaImagem
  MediaPDF
  MediaVideo
  Download
  UsuarioDownload
  CMSConfiguracao
  CMSPagina
  CMSSecao
  CMSBlocoConteudo
  CMSDepoimento
  CMSFAQ
  Notificacao
  NotificacaoLida
  SuporteTicket
  SuporteMensagem
  LogAuditoria

□ Clicar em cada tabela e verificar dados
  □ Usuario: 3 registros
  □ Curso: 4 registros
  □ Notificacao: 3 registros
  □ CMSDepoimento: 3 registros
  □ CMSFAQ: 4 registros


PASSO 7: CRIAR ESTRUTURA DO PROJETO
□ Criar diretórios:
  mkdir -p app/api/auth
  mkdir -p app/api/cursos
  mkdir -p app/api/usuarios
  mkdir -p lib/utils
  mkdir -p types
  mkdir -p middleware
  mkdir -p public/uploads/imagens
  mkdir -p public/uploads/pdfs

□ Criar lib/prisma.ts (cliente Prisma):
  [Código em ETAPA_1_INSTALACAO.md]

□ Criar types/index.ts (tipos TypeScript):
  [Código em ETAPA_1_INSTALACAO.md]

□ Criar middleware.ts (autenticação):
  [Código em ETAPA_1_INSTALACAO.md]


PASSO 8: INICIAR DEV SERVER
□ Iniciar servidor:
  npm run dev
  
□ Abrir http://localhost:3000

□ Verificar se não há erros no terminal

□ ✅ PRONTO!


🔍 VERIFICAÇÃO FINAL
═══════════════════════════════════════════════════════════════════════════════

Testes de validação:

□ Arquivo .env.local tem DATABASE_URL?
□ Arquivo .env.local tem JWT secrets?
□ Node modules instalado (npm install rodou)?
□ 24 tabelas aparecem no Prisma Studio?
□ Dados de seed aparecem nas tabelas?
□ npm run dev roda sem erros?

Se tudo OK, você tem:
✅ Banco de dados 100% funcional
✅ 24 tabelas com relacionamentos
✅ Dados de teste inseridos
✅ Pronto para ETAPA 2 (APIs)


❌ TROUBLESHOOTING
═══════════════════════════════════════════════════════════════════════════════

Erro: "Cannot find module '@prisma/client'"
Solução: npm install @prisma/client && npx prisma generate

Erro: "Connection refused"
Solução: 
  □ Verificar DATABASE_URL em .env.local
  □ Verificar credenciais MySQL no Hostinger
  □ Testar conexão: mysql -h HOST -u USER -p DATABASE

Erro: "Relation not found"
Solução: npx prisma generate

Erro: "Seed failed"
Solução:
  □ npm install bcrypt
  □ npm run prisma:seed

Erro: "Type 'Usuario' is not exported"
Solução: npx prisma generate

Banco vazio (sem dados)?
Solução:
  □ npm run prisma:seed (rodar novamente)
  □ Verificar se não houve erro durante seed
  □ Usar npx prisma studio para verificar

Erro ao criar migration?
Solução:
  □ Certificar que DATABASE_URL está correto
  □ Certificar que MySQL está rodando
  □ Rodar: npx prisma migrate resolve --rolled-back init


📞 SUPORTE
═══════════════════════════════════════════════════════════════════════════════

Documentação detalhada:
□ ETAPA_1_BANCO_COMPLETO.md - Explicação de cada tabela
□ ETAPA_1_INSTALACAO.md - Guia detalhado passo-a-passo
□ ETAPA_1_RESUMO.md - Visão geral do que foi criado
□ ETAPA_1_INDICE.md - Índice de todos os arquivos

Código:
□ prisma/schema.prisma - Modelo Prisma
□ prisma/migrations/001_init.sql - SQL puro
□ prisma/seed.ts - Dados iniciais


✅ PRÓXIMOS PASSOS (APÓS ETAPA 1)
═══════════════════════════════════════════════════════════════════════════════

Quando terminar a instalação:

□ Criar lib/prisma.ts (cliente Prisma)
□ Criar middleware de autenticação
□ Começar ETAPA 2 (APIs)
  └─ Route Handlers (/app/api/)
  └─ Controllers para CRUD
  └─ Validação com Zod

Ou:
□ Ignorar APIs por enquanto
□ Começar ETAPA 3 (Frontend)
  └─ Páginas públicas
  └─ Dashboard de usuários
  └─ Painel admin


🎉 CHECKLIST RESUMIDO
═══════════════════════════════════════════════════════════════════════════════

ANTES:
□ Node 18+
□ npm/pnpm
□ MySQL em Hostinger
□ Leu ETAPA_1_RESUMO.md

DURANTE:
□ npm install dependências
□ Copiar arquivos Prisma
□ Criar .env.local
□ npm run prisma:migrate
□ npm run prisma:seed

DEPOIS:
□ npm run prisma:studio
□ Verificar 24 tabelas
□ Verificar dados de seed
□ npm run dev (OK?)

FIM:
□ Banco 100% funcional
□ Pronto para ETAPA 2
□ Documentação consultada


═══════════════════════════════════════════════════════════════════════════════

Tempo total estimado: 30-45 minutos

Dúvidas? Consulte ETAPA_1_INSTALACAO.md (guia detalhado)

Vamos começar? 🚀
