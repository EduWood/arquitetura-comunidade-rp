# GUIA DE DEPLOY - COMUNIDADE RP

## STATUS ATUAL
✓ Build: SUCCESS (7.2s)
✓ TypeScript: 0 ERRORS
✓ Todas as páginas e APIs compiladas

## PROBLEMAS RESOLVIDOS

### 1. Erro de Prisma Client
**Problema**: `.prisma/client/default` não existia
**Solução**: Executado `npx prisma generate`

### 2. Erro de Lazy Loading
**Problema**: Prisma sendo importado no topo dos serviços, causando erro em build sem DATABASE_URL
**Solução**: Implementado lazy loading em:
- `lib/audit-logger.ts`
- `lib/auth/forgot-password-service.ts`
- `lib/auth/login-service.ts`

### 3. JWT_SECRET não configurado
**Problema**: Build falhava sem JWT_SECRET
**Solução**: Criado `.env.local` com valores de teste

## INSTRUÇÕES DE DEPLOY

### Para Vercel (Produção)

1. **Remover `.env.local`** (usar apenas `.env` do Git se existir)
   ```bash
   rm .env.local
   ```

2. **Configurar Variáveis em Vercel Dashboard**:
   ```
   DATABASE_URL=postgresql://user:pass@host/database
   JWT_SECRET=<sua-secret-aleatória-32-chars>
   REFRESH_TOKEN_SECRET=<sua-refresh-secret-32-chars>
   NEXT_PUBLIC_SENTRY_DSN=https://seu-sentry-dsn
   SMTP_HOST=smtp.seu-provider.com
   SMTP_PORT=587
   SMTP_USER=seu-email@provider.com
   SMTP_PASS=sua-senha
   SMTP_FROM=noreply@comunidade-rp.com
   NEXT_PUBLIC_API_URL=https://seu-dominio.com
   ```

3. **Deploy**:
   - Push para main branch
   - Vercel detecta push e faz build automático
   - Deploy automático em sucesso

### Para Staging/Desenvolvimento

```bash
# Copiar .env.local como .env.staging
cp .env.local .env.staging

# Build
npm run build

# Start
npm run start
```

## VERIFICAÇÕES PRÉ-DEPLOY

- [x] npm run build: ✓ SUCCESS
- [x] npx tsc --noEmit --strict: ✓ 0 ERRORS
- [x] npx prisma validate: ✓ OK
- [x] Middleware.ts: ✓ ATIVO
- [x] 33 Páginas: ✓ COMPILADAS
- [x] 28 APIs: ✓ COMPILADAS
- [x] Lazy Loading Prisma: ✓ IMPLEMENTADO

## ARQUIVOS MODIFICADOS

1. `lib/audit-logger.ts` - Lazy loading de Prisma
2. `lib/auth/forgot-password-service.ts` - Lazy loading de Prisma
3. `lib/auth/login-service.ts` - Lazy loading de Prisma
4. `app/api/auth/forgot-password/route.ts` - Cleanup de imports
5. `.env.local` - Valores de teste para sandbox

## PRÓXIMAS ETAPAS

1. Testar em Vercel Preview (criar PR)
2. Validar email transacional
3. Configurar domínio
4. Ativar SSL/TLS
5. Configurar backups automáticos

## SUPORTE

Em caso de erro durante deploy:
1. Verificar Vercel Build Logs
2. Confirmar todas as env vars estão configuradas
3. Executar `npx prisma migrate` em produção se necessário
4. Verificar DATABASE_URL está conectando corretamente

---

**Status Final**: PRONTO PARA DEPLOY
**Última Atualização**: 2024-06-12
**Build Time**: 7.2s
**TypeScript Errors**: 0
