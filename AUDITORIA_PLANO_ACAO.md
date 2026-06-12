# PLANO DE AÇÃO - CORREÇÃO DOS PROBLEMAS

## FASE 1: BLOQUEADORES (Críticas - ~1 hora)

### Ação 1.1: Corrigir Schema Prisma com @map()

**Arquivo:** `prisma/schema.prisma`

**Problema Atual:**
```typescript
model Usuario {
  senha_hash        String
  email_verificado  Boolean
  ultima_login      DateTime?
  tentativas_login  Int          // NÃO EXISTE
  bloqueado_ate     DateTime?    // NÃO EXISTE
}
```

**Código tenta acessar:**
```typescript
user.senhaHash          // ❌ campo não existe
user.emailVerificado    // ❌ campo não existe
user.ultimoAcesso       // ❌ campo não existe
user.tentativasLogin    // ❌ campo não existe
user.bloqueadoAte       // ❌ campo não existe
```

**Solução:**
1. Adicionar campos faltantes ao schema
2. Mapear com @map() para camelCase
3. Rodar migration

---

### Ação 1.2: Implementar Prisma Singleton

**Problema Atual:**
- Cada arquivo: `const prisma = new PrismaClient()`
- Resultado: ~20 instâncias criadas
- Efeito: Esgota pool em produção

**Localizar em:**
- `lib/auth/refresh-token-service.ts:4`
- `lib/auth/forgot-password-service.ts:4`
- `lib/auth/register-service.ts:4`
- `lib/auth/login-service.ts:4`

**Solução:**
1. Criar `lib/db.ts` com singleton
2. Substituir em todos os arquivos

---

### Ação 1.3: Validar JWT_SECRET

**Arquivo:** `lib/auth/jwt-service.ts`

**Problema:**
```typescript
private static secret = process.env.JWT_SECRET || 'dev-secret-key'
```

**Solução:**
Adicionar validação obrigatória com erro se não setado

---

### Ação 1.4: Fixar Session ID Generation

**Arquivo:** `lib/auth/login-service.ts`

**Problema:**
```typescript
sessionId: `session_${Date.now()}`  // Pode ter duplicatas
```

**Solução:**
Usar `nanoid()` ou `cuid()` do Prisma

---

## FASE 2: SEGURANÇA (Altas - ~2 horas)

### Ação 2.1: Implementar Rate Limiting

**Usar:** Upstash Redis

**Onde:** Em todos os endpoints de autenticação

---

### Ação 2.2: Adicionar CORS Validation

**Arquivo:** Criar `lib/middleware/cors.ts`

**Endpoints a validar:**
- `/api/auth/*`

---

### Ação 2.3: Logging de Segurança

**Registrar em LogAuditoria:**
- Login (sucesso/falha)
- Logout
- Password reset
- Unauthorized attempts

---

### Ação 2.4: Validar Reset Password

**Adicionar:**
- Expiração do token
- Força da senha
- Invalidar sessões antigas

---

## VERIFICAÇÃO PÓS-CORREÇÃO

### Checklist

- [ ] Schema Prisma tem @map() em todos os campos
- [ ] Prisma singleton em `lib/db.ts`
- [ ] Todos os imports de prisma usam `lib/db`
- [ ] JWT_SECRET com validação obrigatória
- [ ] Session ID usa nanoid() ou cuid()
- [ ] Rate limiting implementado
- [ ] CORS validation implementado
- [ ] Logging em LogAuditoria
- [ ] Reset password com validações
- [ ] Build executa sem erros
- [ ] 149 testes passam

---

## ESTIMATIVA DE TEMPO

| Ação | Tempo | Impacto |
|------|-------|--------|
| 1.1 - Schema Prisma | 30 min | CRÍTICO |
| 1.2 - Singleton | 15 min | CRÍTICO |
| 1.3 - JWT validation | 10 min | CRÍTICO |
| 1.4 - Session ID | 20 min | ALTO |
| 2.1 - Rate limiting | 45 min | ALTO |
| 2.2 - CORS | 30 min | ALTO |
| 2.3 - Logging | 60 min | MÉDIO |
| 2.4 - Reset pass | 20 min | ALTO |
| **Total** | **3-4 horas** | - |

---

## PRÓXIMO PASSO

**Aguardar sua confirmação para:**
1. Iniciar correções
2. Ou prosseguir direto para ETAPA 3 (não recomendado)
