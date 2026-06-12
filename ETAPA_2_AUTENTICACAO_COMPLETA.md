# ETAPA 2 - SISTEMA DE AUTENTICAÇÃO COMPLETO

## Visão Geral

Sistema de autenticação enterprise-grade implementado com Next.js 15, Prisma ORM, MySQL e JWT.

## Estrutura de Arquivos

```
lib/auth/
├── index.ts                          # Exports principais
├── types.ts                          # TypeScript types
├── errors.ts                         # Tratamento de erros
├── helpers.ts                        # Utilidades
├── password-service.ts               # Hash e validação de senha
├── jwt-service.ts                    # Geração e verificação JWT
├── auth-service.ts                   # Serviço principal
├── register-service.ts               # Registro de usuário
├── login-service.ts                  # Login
├── refresh-token-service.ts          # Renovação de tokens
├── forgot-password-service.ts        # Recuperação de senha
├── middleware.ts                     # Autenticação middleware
└── authorization.ts                  # Autorização middleware

app/api/auth/
├── register/route.ts                 # POST /api/auth/register
├── login/route.ts                    # POST /api/auth/login
├── logout/route.ts                   # POST /api/auth/logout
├── refresh/route.ts                  # POST /api/auth/refresh
├── profile/route.ts                  # GET/PUT /api/auth/profile
├── change-password/route.ts          # POST /api/auth/change-password
├── forgot-password/route.ts          # POST /api/auth/forgot-password
└── reset-password/route.ts           # POST /api/auth/reset-password

.env.example                          # Configurações de ambiente
```

## Configurações de Ambiente

```env
# Database
DATABASE_URL="mysql://user:password@localhost:3306/comunidade_rp"

# JWT
JWT_SECRET="sua-chave-super-secreta-min-32-caracteres"
JWT_EXPIRATION="24h"
JWT_REFRESH_EXPIRATION="7d"

# Bcrypt
BCRYPT_ROUNDS=10

# Security
MAX_LOGIN_ATTEMPTS=5
LOGIN_LOCK_TIME_MINUTES=15
EMAIL_VERIFICATION_ENABLED=true

# App
NEXT_PUBLIC_API_URL="http://localhost:3000"
NODE_ENV="development"
```

## API Endpoints

### 1. Registro (POST /api/auth/register)

**Request:**
```json
{
  "nome": "João Silva",
  "email": "joao@exemplo.com",
  "password": "Senha@123",
  "confirmPassword": "Senha@123",
  "aceitaTermos": true
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Usuário registrado com sucesso",
  "data": {
    "id": "user_xxx",
    "nome": "João Silva",
    "email": "joao@exemplo.com",
    "role": "MEMBRO",
    "emailVerificado": false
  }
}
```

### 2. Login (POST /api/auth/login)

**Request:**
```json
{
  "email": "joao@exemplo.com",
  "password": "Senha@123",
  "rememberMe": false
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Login realizado com sucesso",
  "data": {
    "user": {
      "id": "user_xxx",
      "email": "joao@exemplo.com",
      "nome": "João Silva",
      "role": "MEMBRO",
      "emailVerificado": false
    },
    "accessToken": "eyJhbGc..."
  }
}
```

**Cookies Set:**
- `refreshToken` (httpOnly, secure, sameSite=strict)

### 3. Logout (POST /api/auth/logout)

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response (200):**
```json
{
  "success": true,
  "message": "Logout realizado com sucesso"
}
```

### 4. Refresh Token (POST /api/auth/refresh)

**Cookies:**
- `refreshToken` (automaticamente enviado)

**Response (200):**
```json
{
  "success": true,
  "message": "Token atualizado com sucesso",
  "data": {
    "accessToken": "eyJhbGc..."
  }
}
```

### 5. Perfil (GET /api/auth/profile)

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response (200):**
```json
{
  "success": true,
  "message": "Perfil carregado com sucesso",
  "data": {
    "id": "user_xxx",
    "nome": "João Silva",
    "email": "joao@exemplo.com",
    "role": "MEMBRO",
    "emailVerificado": false,
    "ativo": true,
    "criadoEm": "2024-01-01T10:00:00Z",
    "ultimoAcesso": "2024-01-10T14:30:00Z"
  }
}
```

### 6. Atualizar Perfil (PUT /api/auth/profile)

**Request:**
```json
{
  "nome": "João Silva Updated",
  "email": "novo-email@exemplo.com"
}
```

### 7. Alterar Senha (POST /api/auth/change-password)

**Request:**
```json
{
  "currentPassword": "SenhaAtual@123",
  "newPassword": "NovaSenha@456",
  "confirmPassword": "NovaSenha@456"
}
```

### 8. Recuperar Senha (POST /api/auth/forgot-password)

**Request:**
```json
{
  "email": "joao@exemplo.com"
}
```

**Response (200) - Sempre sucesso por segurança:**
```json
{
  "success": true,
  "message": "Se este email estiver registrado, você receberá um link de recuperação"
}
```

### 9. Redefinir Senha (POST /api/auth/reset-password)

**Request:**
```json
{
  "token": "reset_token_from_email",
  "newPassword": "NovaSenha@123",
  "confirmPassword": "NovaSenha@123"
}
```

## Validação de Senha

A senha deve ter:
- Mínimo 8 caracteres
- Pelo menos uma letra maiúscula
- Pelo menos uma letra minúscula
- Pelo menos um número
- Pelo menos um caractere especial

## Middleware de Autenticação

### Usar em API Routes

```typescript
import { requireAuth, ResponseHelper } from '@/lib/auth';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { error, user } = await requireAuth(request);

  if (error) {
    return error;
  }

  // User está autenticado
  console.log(user.userId, user.email, user.role);

  return NextResponse.json({ success: true });
}
```

### Middleware de Autorização

```typescript
import { requireRole } from '@/lib/auth';

const { authorized, error, user } = requireRole('ADMIN')(request);

if (!authorized) {
  return error;
}

// Apenas ADMINs chegam aqui
```

## Níveis de Permissões

- **SUPER_ADMIN** (nível 3): Acesso total ao sistema
- **ADMIN** (nível 2): Gerenciamento de conteúdo e usuários
- **MEMBRO** (nível 1): Acesso aos cursos e comunidade

## Fluxo de Login

1. **Validação**: Email e senha obrigatórios
2. **Verificação**: Usuário existe?
3. **Bloqueio**: Verificar se está bloqueado (múltiplas tentativas)
4. **Senha**: Comparar com hash Bcrypt
5. **Verificação de Email**: Validar se necessário
6. **Reset de Tentativas**: Limpar contador de tentativas falhadas
7. **Gerar Tokens**: JWT access + refresh
8. **Criar Sessão**: Armazenar no banco de dados
9. **Retornar**: Access token + refresh token em cookie

## Fluxo de Refresh Token

1. **Extrair**: Cookie refreshToken
2. **Verificar**: Validar JWT
3. **Encontrar Sessão**: Buscar no banco de dados
4. **Validar**: Sessão ativa e não expirada?
5. **Gerar Novo**: Access token + novo refresh token
6. **Atualizar**: Sessão com novo token
7. **Retornar**: Novo access token

## Fluxo de Recuperação de Senha

1. **Solicitar**: POST /api/auth/forgot-password com email
2. **Gerar Token**: Criar token SHA256 com expiração (1 hora)
3. **Enviar Email**: Link com token (TODO: implementar)
4. **Clicar Link**: Usuário clica no email
5. **Redefinir**: POST /api/auth/reset-password com novo password
6. **Validar**: Token ainda válido?
7. **Atualizar**: Hash de nova senha + marcar token como usado
8. **Logout**: Invalidar todas as sessões

## Recursos de Segurança

- ✅ Bcrypt hashing com 10 rounds
- ✅ JWT com expiração configurável
- ✅ Refresh tokens em httpOnly cookies (não acessível via JS)
- ✅ Rate limiting (bloqueio após múltiplas tentativas)
- ✅ Validação de força de senha
- ✅ Email enumeration prevention
- ✅ CSRF protection ready
- ✅ Session tracking (IP, User-Agent)
- ✅ Invalidação de sessões ao trocar senha
- ✅ Token expiration checks

## Próximos Passos (ETAPA 3)

1. Frontend de autenticação (páginas de login, registro, etc)
2. Sistema de CMS
3. Sistema de cursos
4. Sistema de permissões granulares
