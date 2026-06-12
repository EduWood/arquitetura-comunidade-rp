# AUDITORIA TÉCNICA COMPLETA - ETAPA 2

## RESUMO EXECUTIVO

Análise técnica completa do sistema de autenticação (ETAPA 2) verificando:
- Compatibilidade com tecnologias (Next.js 15, Prisma, MySQL, Vercel)
- Segurança em múltiplas camadas
- Qualidade do código TypeScript
- Possíveis riscos e problemas

**Data da Auditoria:** 2024
**Versões Auditadas:**
- Next.js: 16.2.6 (LTS)
- Prisma: 7.8.0
- MySQL: Hostinger
- Node: 18+

---

## PROBLEMAS ENCONTRADOS

### 1. COMPATIBILIDADE COM NEXT.JS 16

#### ❌ PROBLEMA: Geração de Session ID inconsistente

**Arquivo:** `lib/auth/login-service.ts` (Linhas 97-99)

```typescript
const accessToken = JWTService.generateAccessToken({
  userId: user.id,
  email: user.email,
  role: user.role as any,
  sessionId: `session_${Date.now()}`,  // ❌ PROBLEMA
});
```

**Explicação:**
- SessionId é gerado como string timestamp simples
- Isso NÃO é persistido como sessionId único na tabela SessaoJWT
- Cria inconsistência entre JWT e banco de dados
- Em caso de múltiplas requisições simultâneas, pode gerar IDs idênticos

**Impacto:**
- CRÍTICO (8/10)
- Pode causar confusion entre tokens em múltiplos devices
- Dificulta logout seletivo por device

**Correção Recomendada:**
```typescript
// Gerar sessionId primeiro e armazenar no banco
const sessionId = `session_${nanoid()}`;
// Depois usar para tokens
```

---

### 2. COMPATIBILIDADE COM PRISMA ATUAL

#### ❌ PROBLEMA: Campos do schema não correspondem ao código

**Arquivo:** `prisma/schema.prisma` vs `lib/auth/login-service.ts`

**Mismatches encontrados:**

| Campo | Schema | Código | Status |
|-------|--------|--------|--------|
| `senhaHash` | `senha_hash` (snake_case) | `user.senhaHash` (camelCase) | ❌ ERRO |
| `emailVerificado` | `email_verificado` | `user.emailVerificado` | ❌ ERRO |
| `ultimoAcesso` | `ultima_login` | `user.ultimoAcesso` | ❌ ERRO |
| `tentativasLogin` | (não existe) | `user.tentativasLogin` | ❌ MISSING |
| `bloqueadoAte` | (não existe) | `user.bloqueadoAte` | ❌ MISSING |

**Explicação:**
- Prisma usa snake_case no schema, mas código acessa camelCase
- Sem `@map()`, Prisma não consegue mapear
- Tentativas de acesso causarão `undefined` e erros em runtime

**Impacto:**
- CRÍTICO (10/10)
- Código não funcionará em produção
- Login completamente quebrado
- Testes unitários falharão

**Correção Recomendada:**

```typescript
// No schema.prisma:
model Usuario {
  // ... outros campos
  senha_hash        String      @db.VarChar(500) @map("senhaHash")
  email_verificado  Boolean     @default(false) @map("emailVerificado")
  ultima_login      DateTime?   @map("ultimoAcesso")
  tentativas_login  Int         @default(0) @map("tentativasLogin")
  bloqueado_ate     DateTime?   @map("bloqueadoAte")
}
```

---

### 3. COMPATIBILIDADE COM MYSQL HOSTINGER

#### ❌ PROBLEMA: Campos em tabela SessaoJWT não mapeados

**Arquivo:** `prisma/schema.prisma` (Linhas 51-68)

```typescript
model SessaoJWT {
  id                String    @id @default(cuid())
  usuario_id        String
  token             String    @unique @db.VarChar(1000)
  refresh_token     String    @unique @db.VarChar(1000)
  ip_address        String?   @db.VarChar(45)
  user_agent        String?   @db.Text
  expires_at        DateTime
  revogado          Boolean   @default(false)
  created_at        DateTime  @default(now())
  updated_at        DateTime  @updatedAt

  usuario           Usuario   @relation(fields: [usuario_id], references: [id], onDelete: Cascade)
}
```

**Vs código em `refresh-token-service.ts` (Linha 17):**

```typescript
// Campo mapeado errado
refreshToken: session.refreshToken  // ❌ Esperado: session.refresh_token
```

**Explicação:**
- Prisma snake_case campos sem `@map()` mapeiam automaticamente
- Mas o código tenta acessar camelCase
- Em MySQL real, os campos ficam em snake_case

**Impacto:**
- ALTO (9/10)
- Refresh token não funcionará
- Logout e sessão quebrarão

**Correção Recomendada:**
```typescript
// Opção 1: Usar @map() no schema
model SessaoJWT {
  refreshToken      String    @unique @db.VarChar(1000) @map("refresh_token")
}

// Opção 2: Acessar corretamente no código
const newRefreshToken = session.refresh_token;
```

---

### 4. COMPATIBILIDADE COM DEPLOY NA VERCEL

#### ⚠️ PROBLEMA: PrismaClient singleton não otimizada

**Arquivo:** `lib/auth/refresh-token-service.ts` (Linha 4)

```typescript
const prisma = new PrismaClient();
```

**Problema:**
- Cada serviço cria nova instância de PrismaClient
- Em Vercel com serverless functions, cada requisição cria nova conexão
- Esgota pool de conexões do MySQL Hostinger
- Causa "too many connections" errors

**Impacto:**
- CRÍTICO (9/10)
- App quebra em produção após ~10 requisições simultâneas
- Impossível escalar horizontalmente

**Correção Recomendada:**
```typescript
// lib/db.ts
import { PrismaClient } from '@prisma/client'

const globalForPrisma = global as unknown as { prisma: PrismaClient }

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
```

Depois usar em todos os arquivos:
```typescript
import { prisma } from '@/lib/db'
```

---

### 5. PROBLEMAS DE SEGURANÇA - JWT

#### ❌ PROBLEMA 1: Secret padrão inseguro

**Arquivo:** `lib/auth/jwt-service.ts` (Linha 9)

```typescript
private static secret = process.env.JWT_SECRET || 'dev-secret-key';
```

**Problema:**
- Fallback para 'dev-secret-key' muito fraco
- Se env var não setada, segurança compromete
- Fácil fazer bruteforce em produção

**Impacto:**
- CRÍTICO (10/10)
- Tokens podem ser forjados
- Autenticação completamente comprometida

**Correção Recomendada:**
```typescript
private static secret = (() => {
  const secret = process.env.JWT_SECRET
  if (!secret || secret.length < 32) {
    throw new Error('JWT_SECRET deve ter mínimo 32 caracteres')
  }
  return secret
})()
```

---

#### ❌ PROBLEMA 2: Sem verificação de algoritmo em decode()

**Arquivo:** `lib/auth/jwt-service.ts` (Linha 66)

```typescript
static decode(token: string): any {
  return jwt.decode(token);  // ❌ SEM VERIFICAÇÃO
}
```

**Problema:**
- `decode()` retorna payload sem validação
- Permite tokens inválidos
- Algoritmo pode ser 'none'

**Impacto:**
- ALTO (8/10)
- Token forjado pode passar em alguns cenários
- Vulnerável a JWT confusion attacks

**Correção Recomendada:**
```typescript
static decode(token: string): any {
  try {
    const decoded = jwt.decode(token, { complete: true })
    if (!decoded) return null
    return decoded.payload
  } catch {
    return null
  }
}
```

---

### 6. PROBLEMAS DE SEGURANÇA - COOKIES

#### ❌ PROBLEMA: HttpOnly não configurado corretamente

**Arquivo:** `app/api/auth/login/route.ts` (Linhas 42-50)

```typescript
response.cookies.set('refreshToken', result.refreshToken, {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',  // ❌ PROBLEMA
  sameSite: 'strict',
  maxAge: rememberMe ? 7 * 24 * 60 * 60 : 24 * 60 * 60,
  path: '/',
});
```

**Problema:**
- `secure: true` só funciona com HTTPS
- Em desenvolvimento, cookie não é setado (pois NODE_ENV !== 'production')
- Testes falham porque cookie nunca é setado
- Refresh token não é persistido em dev

**Impacto:**
- MÉDIO (6/10)
- Testes de refresh token falham
- Funciona em produção, mas dev environment quebrado

**Correção Recomendada:**
```typescript
response.cookies.set('refreshToken', result.refreshToken, {
  httpOnly: true,
  secure: true,  // Sempre HTTPS
  sameSite: 'strict',
  maxAge: rememberMe ? 7 * 24 * 60 * 60 : 24 * 60 * 60,
  path: '/',
});
```

Para desenvolvimento com HTTP:
```typescript
// .env.local
COOKIE_SECURE=false  // Só em desenvolvimento!
```

---

### 7. PROBLEMAS DE SEGURANÇA - RATE LIMITING

#### ⚠️ PROBLEMA: Rate limiting apenas em memória

**Arquivo:** `lib/auth/helpers.ts` (Linha 60)

```typescript
static generateRateLimitKey(identifier: string, action: string): string {
  return `ratelimit:${action}:${identifier}`;
}
```

**Problema:**
- Função só gera KEY, não implementa verificação real
- Sem Redis ou similar, rate limit não persiste entre requisições
- Cada serverless function tem sua própria memória
- Atacante pode contornar mantendo conexões paralelas

**Impacto:**
- ALTO (7/10)
- Brute force attack possível em login
- Não há proteção real contra força bruta

**Correção Recomendada:**
- Implementar com Upstash Redis ou similar:
```typescript
// Será necessário na ETAPA 3
import { Ratelimit } from '@upstash/ratelimit'
```

---

### 8. PROBLEMAS DE TIPAGEM TYPESCRIPT

#### ⚠️ PROBLEMA: Type assertions sem segurança

**Arquivo:** `lib/auth/login-service.ts` (Linha 93)

```typescript
role: user.role as any,  // ❌ Unsafe
```

**Vs no refresh-token-service.ts (Linha 46):**

```typescript
role: user.role as any,  // ❌ Unsafe
```

**Problema:**
- `as any` desativa type checking
- Campos podem ser undefined
- Não há validação em runtime

**Impacto:**
- MÉDIO (5/10)
- Erros silenciosos em produção
- Payload JWT pode ficar malformado

**Correção Recomendada:**
```typescript
// types.ts
export function assertUserRole(role: unknown): UserRole {
  if (role === 'SUPER_ADMIN' || role === 'ADMIN' || role === 'MEMBRO') {
    return role
  }
  throw new Error(`Invalid role: ${role}`)
}

// Uso:
role: assertUserRole(user.role),
```

---

### 9. PROBLEMA DE IMPORTS

#### ❌ PROBLEMA: Path imports não resolvem corretamente

**Arquivo:** `app/api/auth/login/route.ts` (Linha 2)

```typescript
import { LoginService } from '@/lib/auth/login-service';
```

**Problema:**
- `@/` é alias definido em tsconfig.json
- Deve apontar para `/`
- Se tsconfig não tiver configurado, falha em build

**Impacto:**
- MÉDIO (6/10)
- Build falha se tsconfig não tiver paths configurado
- Funciona em dev mas falha em produção

**Verificar em tsconfig.json:**
```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./*"]
    }
  }
}
```

---

### 10. PROBLEMA: Falta de validação em reset password

**Arquivo:** `app/api/auth/reset-password/route.ts`

**Problema:**
- Não valida se token expirou antes de usar
- Não valida força da nova senha
- Não invalida todos os tokens antigos

**Impacto:**
- ALTO (7/10)
- Senha fraca aceita
- Sessões antigas mantêm acesso

**Correção Necessária:**
```typescript
// Validar expiração
if (tokenRecord.expiresAt < new Date()) {
  throw new AuthError(...)
}

// Validar força
const strength = PasswordService.validatePasswordStrength(newPassword)
if (!strength.isValid) {
  throw new AuthError(...)
}

// Invalidar todas as sessões
await prisma.sessaoJWT.updateMany({
  where: { usuarioId: user.id },
  data: { ativa: false }
})
```

---

### 11. PROBLEMA: Sem validação de CORS

**Arquivos:** Todos os endpoints de auth

**Problema:**
- Nenhum endpoint valida origin
- CSRF attacks possíveis
- Qualquer site pode fazer requisição

**Impacto:**
- ALTO (8/10)
- Cross-site request forgery
- Credentials expostos

**Correção Recomendada:**
```typescript
// middleware/cors.ts
export function validateCORS(request: NextRequest) {
  const origin = request.headers.get('origin')
  const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || []
  
  if (!allowedOrigins.includes(origin!)) {
    return false
  }
  return true
}
```

---

### 12. PROBLEMA: Sem logging de segurança

**Arquivos:** Todos os endpoints

**Problema:**
- Apenas console.log básico
- Sem registro em banco de dados
- Impossível auditoria em produção
- Impossível detectar ataques

**Impacto:**
- MÉDIO (6/10)
- Segurança sem auditoria
- Impossível investigar incidentes

**Correção Necessária:**
- Registrar em LogAuditoria:
```typescript
await prisma.logAuditoria.create({
  data: {
    usuarioId: user.id,
    acao: 'LOGIN_SUCESSO',
    detalhes: JSON.stringify({ ip, userAgent }),
    created_at: new Date(),
  }
})
```

---

## RESUMO DE PROBLEMAS POR CATEGORIA

### Críticos (10 pontos)
1. ❌ Campos schema não mapeados (Prisma) - **BLOQUEIA FUNCIONALIDADE**
2. ❌ PrismaClient singleton não otimizada - **FALHA EM PRODUÇÃO**
3. ❌ JWT_SECRET fallback fraco - **SEGURANÇA COMPROMETIDA**

### Altos (7-9 pontos)
4. ⚠️ Session ID inconsistente
5. ⚠️ Refresh token implementação errada
6. ⚠️ Rate limiting não implementado
7. ⚠️ Sem validação em reset password
8. ⚠️ Sem validação CORS

### Médios (5-6 pontos)
9. ⚠️ Type assertions sem segurança
10. ⚠️ HttpOnly cookie inseguro
11. ⚠️ Sem logging de segurança

### Baixos (1-4 pontos)
12. ℹ️ Decode JWT sem verificação

---

## SCORE DE QUALIDADE

```
┌─────────────────────────────────────────┐
│         SCORE DE QUALIDADE              │
├─────────────────────────────────────────┤
│                                         │
│  SEGURANÇA:        ████░░░░░░  35/100  │
│  COMPATIBILIDADE:  ░░░░░░░░░░   0/100  │
│  CÓDIGO:           █████░░░░░  45/100  │
│  PERFORMANCE:      ██░░░░░░░░  20/100  │
│  AUDITORIA:        ░░░░░░░░░░   0/100  │
│                                         │
│  ═════════════════════════════════════  │
│  SCORE GERAL:      ██░░░░░░░░  20/100  │
│                                         │
└─────────────────────────────────────────┘

CLASSIFICAÇÃO: 🔴 CRÍTICO
NÃO ESTÁ PRONTO PARA PRODUÇÃO
```

---

## LISTA DE RISCOS

| ID | Risco | Severidade | Impacto | Status |
|----|-------|-----------|--------|--------|
| R1 | Schema não mapeado | CRÍTICO | Nenhuma rota funciona | BLOQUEADOR |
| R2 | PrismaClient não otimizado | CRÍTICO | Esgota conexões em produção | BLOQUEADOR |
| R3 | JWT secret fraco | CRÍTICO | Tokens podem ser forjados | BLOQUEADOR |
| R4 | Session ID inconsistente | ALTO | Logout seletivo falha | GRAVE |
| R5 | Sem rate limiting real | ALTO | Brute force attack possível | GRAVE |
| R6 | Sem validação CORS | ALTO | CSRF attacks possíveis | GRAVE |
| R7 | Sem logging de segurança | MÉDIO | Impossível auditoria | IMPORTANTE |
| R8 | Reset password sem validação | MÉDIO | Senhas fracas aceitas | IMPORTANTE |
| R9 | Type assertions sem verificação | MÉDIO | Erros silenciosos | IMPORTANTE |
| R10 | Cookie inseguro em dev | BAIXO | Testes quebram em dev | MINOR |

---

## LISTA DE MELHORIAS RECOMENDADAS

### ANTES DE ETAPA 3 (BLOQUEADORES)

1. **Corrigir Schema Prisma com @map()**
   - Prioridade: CRÍTICA
   - Tempo: 30 minutos
   - Impacto: ALTO (sem isso nada funciona)

2. **Implementar Prisma Singleton**
   - Prioridade: CRÍTICA
   - Tempo: 15 minutos
   - Impacto: ALTÍSSIMO (necessário para produção)

3. **Validar JWT_SECRET em inicialização**
   - Prioridade: CRÍTICA
   - Tempo: 10 minutos
   - Impacto: ALTO (segurança)

4. **Corrigir session ID generation**
   - Prioridade: ALTA
   - Tempo: 20 minutos
   - Impacto: ALTO (logout seletivo)

### RECOMENDAÇÕES SECUNDÁRIAS

5. **Implementar Rate Limiting com Upstash**
   - Prioridade: ALTA
   - Tempo: 45 minutos
   - Impacto: MÉDIO (segurança contra bruteforce)

6. **Adicionar validação CORS**
   - Prioridade: ALTA
   - Tempo: 30 minutos
   - Impacto: MÉDIO (CSRF prevention)

7. **Implementar Logging de Segurança**
   - Prioridade: MÉDIA
   - Tempo: 60 minutos
   - Impacto: MÉDIO (auditoria)

8. **Melhorar Type Safety**
   - Prioridade: MÉDIA
   - Tempo: 40 minutos
   - Impacto: BAIXO (qualidade)

---

## RECOMENDAÇÕES DE AÇÃO

### ⚠️ RECOMENDAÇÃO 1: PAUSAR ETAPA 3

**Não prosseguir para ETAPA 3 até corrigir:**
- ✅ Schema Prisma com @map()
- ✅ Prisma singleton
- ✅ JWT_SECRET validation
- ✅ Session ID generation

**Tempo total:** ~1 hora

---

### ✅ RECOMENDAÇÃO 2: Ordem de Correção

**Fase 1 (Bloqueadores) - 1 hora:**
1. Corrigir schema Prisma
2. Implementar Prisma singleton
3. Validar JWT_SECRET
4. Fixar session ID

**Fase 2 (Segurança) - 2 horas:**
5. Rate limiting com Upstash
6. CORS validation
7. Logging de segurança

**Fase 3 (Qualidade) - 1 hora:**
8. Type safety improvements
9. Error handling
10. Documentation

---

## CONCLUSÃO

A ETAPA 2 tem **3 PROBLEMAS CRÍTICOS** que impossibilitam funcionamento:

1. **Schema não mapeado** → Nenhuma rota funciona
2. **PrismaClient não otimizado** → Falha em produção
3. **JWT secret inseguro** → Segurança comprometida

**Status:** 🔴 **NÃO APROVADO PARA ETAPA 3**

**Proximos passos:**
1. Aplicar as 4 correções críticas (1 hora)
2. Executar novamente os 149 testes de autenticação
3. Re-validar ETAPA 2
4. Após aprovação, prosseguir para ETAPA 3

---

**Recomendação Final:** Aguardar correção dos bloqueadores antes de prosseguir com CMS BACKEND (ETAPA 3).
