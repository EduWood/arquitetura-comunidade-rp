ETAPA 1 - GUIA DE INSTALAÇÃO
============================

Data: 2026-06-11
Status: ✅ PRONTO PARA INSTALAR

# 📦 PRÉ-REQUISITOS

Antes de começar, certifique-se de ter:

```bash
# Node.js 18+ e npm/pnpm
node --version  # v18.0.0 ou superior
npm --version   # 9+

# MySQL em Hostinger
# Hostinger Dashboard → Databases → MySQL
# Anotado: Host, User, Password, Database Name

# Git (opcional)
git --version   # 2.0+
```

---

# 🔧 PASSO 1: SETUP DO PROJETO

## 1.1. Criar projeto Next.js 15
```bash
npx create-next-app@latest comunidade-rp \
  --typescript \
  --tailwind \
  --eslint \
  --app

cd comunidade-rp
```

## 1.2. Instalar dependências
```bash
# Prisma e drivers
npm install @prisma/client
npm install -D prisma

# Autenticação
npm install bcrypt
npm install -D @types/bcrypt

# JWT
npm install jsonwebtoken
npm install -D @types/jsonwebtoken

# Validação
npm install zod

# HTTP client
npm install axios
```

Ou com pnpm:
```bash
pnpm add @prisma/client bcrypt jsonwebtoken zod axios
pnpm add -D prisma @types/bcrypt @types/jsonwebtoken
```

---

# 🗄️ PASSO 2: CONFIGURAR BANCO DE DADOS

## 2.1. Hostinger - Criar Database

```
Hostinger Dashboard
├─ Manage my Services
├─ Hosting
├─ Database Management
├─ MySQL Database
│
├─ Create New Database
│  ├─ Name: comunidade_rp
│  ├─ User: user_rp
│  ├─ Password: (gerar senha forte)
│  └─ Create
│
└─ Anotar:
   ├─ Host: mysql-ab123456.c9.biz (ou localhost se local)
   ├─ User: user_rp
   ├─ Password: (sua senha)
   └─ Database: comunidade_rp
```

## 2.2. Criar arquivo .env.local
```bash
# Copiar arquivo de exemplo (se existir)
cp .env.example .env.local

# Ou criar manualmente
cat > .env.local << 'EOF'
# Database
DATABASE_URL="mysql://user_rp:password@mysql-ab123456.c9.biz/comunidade_rp"

# JWT
JWT_SECRET="sua-chave-secreta-aleatorio-64-caracteres-minimo"
JWT_REFRESH_SECRET="outra-chave-secreta-aleatorio-64-caracteres-minimo"

# URLs
NEXT_PUBLIC_API_URL="http://localhost:3000"
NEXT_PUBLIC_SITE_URL="http://localhost:3000"
EOF
```

Gerar chaves JWT seguras:
```bash
# Linux/Mac
openssl rand -base64 32
openssl rand -base64 32

# Windows PowerShell
[Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes([System.Guid]::NewGuid().ToString()))
```

## 2.3. Verificar conexão
```bash
# Testar conexão com banco
npx prisma db push --skip-generate

# Se tudo OK, deve conectar
```

---

# 📋 PASSO 3: COPIAR ARQUIVOS PRISMA

## 3.1. Copiar schema.prisma
```bash
# Já deve estar em:
# /vercel/share/v0-project/prisma/schema.prisma

# Copiar para seu projeto:
cp prisma/schema.prisma ./prisma/schema.prisma
```

## 3.2. Copiar seed.ts
```bash
cp prisma/seed.ts ./prisma/seed.ts
```

## 3.3. Verificar package.json
```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "prisma:generate": "prisma generate",
    "prisma:migrate": "prisma migrate dev",
    "prisma:seed": "prisma db seed",
    "prisma:studio": "prisma studio"
  },
  "prisma": {
    "seed": "ts-node prisma/seed.ts"
  }
}
```

---

# 🗃️ PASSO 4: CRIAR BANCO E TABELAS

## 4.1. Opção A: Via Prisma (Recomendado)

```bash
# Gerar Prisma Client
npm run prisma:generate

# Criar migrations
npm run prisma:migrate
# Será pedido um nome, ex: "init"

# Criar tabelas no banco
# (vai executar SQL automaticamente)
```

## 4.2. Opção B: SQL Direto (Hostinger PhpMyAdmin)

```bash
# 1. Ir em: Hostinger Dashboard → Database Management → phpmyadmin
# 2. Login com as credenciais criadas
# 3. Selecionar database "comunidade_rp"
# 4. Abrir aba "SQL"
# 5. Copiar conteúdo de prisma/migrations/001_init.sql
# 6. Colar no editor
# 7. Executar ("Go")
# 8. Aguardar mensagem de sucesso
```

## 4.3. Verificar Tabelas
```bash
# Via Prisma Studio (interface visual)
npm run prisma:studio
# Abrir http://localhost:5555

# Ou via MySQL CLI
mysql -h mysql-ab123456.c9.biz -u user_rp -p comunidade_rp
> SHOW TABLES;
> DESCRIBE Usuario;
```

---

# 🌱 PASSO 5: SEED DATA (DADOS INICIAIS)

```bash
# Adicionar dados de teste
npm run prisma:seed

# Ou executar diretamente
npx prisma db seed

# Saída esperada:
# 🌱 Iniciando seed do banco de dados...
# 📝 Criando usuários...
# ✅ Usuários criados...
# 📚 Criando cursos...
# ✅ Cursos criados...
# ... (mais logs)
# 🎉 Seed finalizado com sucesso!
```

### Dados Criados:
```
📧 Super Admin:
   Email: admin@comunidaderp.com
   Senha: senha123

📧 Admin:
   Email: gerente@comunidaderp.com
   Senha: senha123

📧 Membro:
   Email: aluno@comunidaderp.com
   Senha: senha123

📚 Cursos: 4
   - Forex para Iniciantes
   - Criptomoedas: Do Zero ao Lucro
   - Bolsa de Valores
   - Opções - Estratégias Avançadas

📖 Módulos & Aulas: 3 + 2
🎬 Vídeos: 1 (YouTube)
💬 Depoimentos: 3
❓ FAQs: 4
🔔 Notificações: 3
⚙️ Configurações: 7
```

---

# ✅ PASSO 6: VALIDAR INSTALAÇÃO

## 6.1. Verificar Prisma Client
```bash
# Criar arquivo lib/prisma.ts
cat > lib/prisma.ts << 'EOF'
import { PrismaClient } from '@prisma/client';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: ['query', 'error', 'warn'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
EOF
```

## 6.2. Testar Conexão
```bash
# Criar arquivo test-db.ts
cat > test-db.ts << 'EOF'
import { prisma } from './lib/prisma';

async function main() {
  const usuarios = await prisma.usuario.findMany();
  console.log('✅ Conexão OK! Usuários:', usuarios.length);
  
  const cursos = await prisma.curso.findMany();
  console.log('✅ Cursos:', cursos.length);
  
  const notificacoes = await prisma.notificacao.findMany({ where: { ativo: true } });
  console.log('✅ Notificações ativas:', notificacoes.length);
}

main()
  .then(() => process.exit(0))
  .catch((e) => { console.error(e); process.exit(1); });
EOF

# Executar
npx ts-node test-db.ts
```

Saída esperada:
```
✅ Conexão OK! Usuários: 3
✅ Cursos: 4
✅ Notificações ativas: 3
```

## 6.3. Verificar Estrutura
```bash
# Ver todas as tabelas
npx prisma db execute --stdin << 'EOF'
SELECT TABLE_NAME FROM information_schema.TABLES 
WHERE TABLE_SCHEMA = 'comunidade_rp' 
ORDER BY TABLE_NAME;
EOF
```

Deve listar 24 tabelas:
```
Aula
AulaConteudo
CMSFAQ
CMSBlocoConteudo
CMSConfiguracao
CMSDepoimento
CMSPagina
CMSSecao
Curso
Download
LogAuditoria
MediaImagem
MediaPDF
MediaVideo
Modulo
Notificacao
NotificacaoLida
SessaoJWT
SuporteMensagem
SuporteTicket
TokenRecuperacao
Usuario
UsuarioAula
UsuarioCurso
UsuarioDownload
```

---

# 🚀 PASSO 7: PRÓXIMOS PASSOS

## 7.1. Criar Diretórios
```bash
# Estrutura para ETAPA 2
mkdir -p app/api/auth
mkdir -p app/api/cursos
mkdir -p app/api/usuarios
mkdir -p lib/utils
mkdir -p types
mkdir -p middleware

# Estrutura para uploads
mkdir -p public/uploads/imagens
mkdir -p public/uploads/pdfs
mkdir -p public/uploads/videos
```

## 7.2. Criar Tipos TypeScript
```bash
cat > types/index.ts << 'EOF'
// Types gerados automaticamente
export type { User } from '@prisma/client';
export type { Curso } from '@prisma/client';
export type { Aula } from '@prisma/client';
// ... etc
EOF
```

## 7.3. Criar Middleware de Auth
```bash
cat > middleware.ts << 'EOF'
import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET!);

export async function middleware(request: NextRequest) {
  const token = request.cookies.get('access_token')?.value;

  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  try {
    await jwtVerify(token, JWT_SECRET);
    return NextResponse.next();
  } catch (error) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
}

export const config = {
  matcher: ['/dashboard/:path*', '/admin/:path*'],
};
EOF
```

## 7.4. Iniciar Dev Server
```bash
npm run dev

# Ou com pnpm
pnpm dev

# Abrir http://localhost:3000
```

---

# 🔍 TROUBLESHOOTING

## Erro: "Cannot find module '@prisma/client'"
```bash
# Solução
npm install @prisma/client
npx prisma generate
```

## Erro: "Connection refused" no banco
```bash
# Verificar credenciais em .env.local
# DATABASE_URL deve ser correto

# Testar conexão
mysql -h HOST -u USER -p DATABASE

# Se Hostinger: usar IP/host do painel
```

## Erro: "Relation not found"
```bash
# Esquema mudou? Regenerar:
npx prisma generate

# Ou fazer nova migração
npx prisma migrate dev --name fix
```

## Erro: "Seed failed"
```bash
# Checar bcrypt instalado
npm install bcrypt

# Rodar seed novamente
npm run prisma:seed
```

## Erro: "Type 'Usuario' is not exported"
```bash
# Regenerar tipos
npx prisma generate

# Ou limpar node_modules
rm -rf node_modules
npm install
```

---

# 📊 ESTRUTURA FINAL DE DIRETÓRIOS

```
comunidade-rp/
├── app/
│   ├── api/                    ← APIs (ETAPA 2)
│   ├── dashboard/              ← Dashboard (ETAPA 3)
│   ├── admin/                  ← Admin panel (ETAPA 3)
│   └── page.tsx                ← Home (ETAPA 3)
│
├── components/                 ← Componentes (ETAPA 3)
│
├── lib/
│   ├── prisma.ts               ← Cliente Prisma
│   └── utils.ts                ← Utilitários
│
├── middleware.ts               ← Autenticação (ETAPA 2)
│
├── prisma/
│   ├── schema.prisma           ✅ PRONTO
│   ├── migrations/
│   │   └── 001_init.sql       ✅ PRONTO
│   └── seed.ts                ✅ PRONTO
│
├── public/
│   └── uploads/
│       ├── imagens/
│       ├── pdfs/
│       └── videos/
│
├── types/                      ← Types TypeScript
│
├── .env.local                  ← Variáveis locais
├── .env.production            ← Variáveis produção
│
└── package.json
```

---

# ✅ CHECKLIST DE INSTALAÇÃO

- [ ] Node.js 18+ instalado
- [ ] MySQL em Hostinger criado
- [ ] Credenciais MySQL anotadas
- [ ] .env.local criado com DATABASE_URL
- [ ] npm dependencies instaladas
- [ ] schema.prisma copiado
- [ ] seed.ts copiado
- [ ] npm run prisma:migrate executado
- [ ] npm run prisma:seed executado
- [ ] Prisma Studio abrindo (npm run prisma:studio)
- [ ] 24 tabelas criadas no banco
- [ ] Dados de teste inseridos
- [ ] npm run dev iniciado com sucesso
- [ ] Tipo User importável de @prisma/client

---

# 🎉 INSTALAÇÃO COMPLETA!

Seu banco está 100% pronto para ETAPA 2 (APIs).

Próximo passo: Criar Route Handlers e Controllers.

**Qualquer dúvida?** Consulte ETAPA_1_BANCO_COMPLETO.md para detalhes.

Vamos para ETAPA 2? 🚀
