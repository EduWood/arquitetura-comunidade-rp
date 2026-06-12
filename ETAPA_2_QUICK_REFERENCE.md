# ETAPA 2 - QUICK REFERENCE

## Instalação de Dependências

```bash
npm install jsonwebtoken bcrypt
npm install -D @types/jsonwebtoken
```

## Configuração Inicial

1. **Copiar .env.example para .env.local:**
   ```bash
   cp .env.example .env.local
   ```

2. **Configurar variáveis (especialmente JWT_SECRET):**
   ```bash
   # Gerar JWT_SECRET seguro (mínimo 32 caracteres)
   openssl rand -base64 32
   ```

3. **Executar Prisma migrations:**
   ```bash
   npx prisma migrate dev --name init
   ```

4. **Executar seed (dados iniciais):**
   ```bash
   npx prisma db seed
   ```

## Estrutura de Pastas

```
project/
├── lib/
│   └── auth/                    # Todo o sistema de autenticação
│       ├── index.ts             # Exports
│       ├── types.ts             # TypeScript types
│       ├── errors.ts            # Erro handling
│       ├── helpers.ts           # Utilidades
│       ├── password-service.ts  # Bcrypt
│       ├── jwt-service.ts       # JWT
│       ├── auth-service.ts      # Main service
│       ├── register-service.ts  # Registro
│       ├── login-service.ts     # Login
│       ├── refresh-token-service.ts
│       ├── forgot-password-service.ts
│       ├── middleware.ts        # Auth middleware
│       └── authorization.ts     # Autorização
├── app/
│   └── api/
│       └── auth/                # API Routes
│           ├── register/route.ts
│           ├── login/route.ts
│           ├── logout/route.ts
│           ├── refresh/route.ts
│           ├── profile/route.ts
│           ├── change-password/route.ts
│           ├── forgot-password/route.ts
│           └── reset-password/route.ts
├── prisma/
│   ├── schema.prisma            # Modelo de dados
│   ├── migrations/              # Migrations SQL
│   └── seed.ts                  # Dados iniciais
└── .env.local                   # Configurações (NÃO COMMITAR)
```

## Usando o Sistema em API Routes

### Exemplo 1: Rota Protegida (Qualquer Role)

```typescript
import { requireAuth, ResponseHelper } from '@/lib/auth';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { error, user } = await requireAuth(request);
  
  if (error) return error;
  
  // User está autenticado
  return NextResponse.json({
    success: true,
    data: { userId: user.userId, role: user.role }
  });
}
```

### Exemplo 2: Rota Admin Only

```typescript
import { requireAdmin, ResponseHelper } from '@/lib/auth';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const { authorized, error, user } = requireAdmin(request);
  
  if (!authorized) return error;
  
  // Apenas ADMINs ou SUPER_ADMIN
  return NextResponse.json({ success: true });
}
```

### Exemplo 3: Rota Super Admin Only

```typescript
import { requireSuperAdmin, ResponseHelper } from '@/lib/auth';
import { NextRequest, NextResponse } from 'next/server';

export async function DELETE(request: NextRequest) {
  const { authorized, error } = requireSuperAdmin(request);
  
  if (!authorized) return error;
  
  // Apenas SUPER_ADMIN
  return NextResponse.json({ success: true });
}
```

### Exemplo 4: Verificar Múltiplos Roles

```typescript
import { requireRole, ResponseHelper } from '@/lib/auth';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const { authorized, error } = requireRole('ADMIN', 'SUPER_ADMIN')(request);
  
  if (!authorized) return error;
  
  // ADMIN ou SUPER_ADMIN
  return NextResponse.json({ success: true });
}
```

## Dados Iniciais (Seed)

Após rodar `npx prisma db seed`, você terá:

**Usuários:**
1. **super@exemplo.com** (SUPER_ADMIN)
   - Senha: SuperAdmin@123
   
2. **admin@exemplo.com** (ADMIN)
   - Senha: Admin@123
   
3. **membro@exemplo.com** (MEMBRO)
   - Senha: Membro@123

**Cursos iniciais:**
- 4 cursos com módulos e aulas
- 6 depoimentos
- 5 FAQs

## Testando as APIs

### 1. Registrar

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "nome": "Novo Usuário",
    "email": "novo@exemplo.com",
    "password": "NovaSenha@123",
    "confirmPassword": "NovaSenha@123",
    "aceitaTermos": true
  }'
```

### 2. Login

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "novo@exemplo.com",
    "password": "NovaSenha@123"
  }'
```

**Response inclui `accessToken` que deve ser usado em futuras requests**

### 3. Usar Token

```bash
curl http://localhost:3000/api/auth/profile \
  -H "Authorization: Bearer $ACCESS_TOKEN"
```

## Próximos Passos

✅ **ETAPA 2 COMPLETA** - Sistema de autenticação backend pronto

⏳ **ETAPA 3** - Frontend de autenticação (páginas, componentes, hooks)

⏳ **ETAPA 4** - Sistema de CMS dinâmico

⏳ **ETAPA 5** - Sistema de cursos

## Segurança

- ✅ Senhas hasheadas com Bcrypt (10 rounds)
- ✅ JWTs assinados com HS256
- ✅ Refresh tokens em httpOnly cookies
- ✅ Rate limiting (5 tentativas, 15 minutos bloqueado)
- ✅ Email enumeration prevention
- ✅ Token expiration
- ✅ Session tracking
